const remote = require("@electron/remote");
const { ipcRenderer } = require("electron");

const win = remote.getCurrentWindow();

document.onreadystatechange = (event) => {
	if (document.readyState == "complete") {
		handleWindowControls();
	}
	document.querySelector("#path-dialog-bg > div > div.dialog-button > button.secondary").style.display = "none";
	document.querySelector("#path-dialog-bg > div > div.dialog-title > h3").innerText = "Couldn't load model";
	ipcRenderer.send("checkModelPath");
};

ipcRenderer.on("modelPathValid", (_event, { data }) => {
	if (data) {
		ipcRenderer.send("startChat");
	} else {
		ipcRenderer.send("getCurrentModel");
		document.getElementById("path-dialog-bg").classList.remove("hidden");
	}
});

document.querySelector("#path-dialog-bg > div > div.dialog-button > button.primary").addEventListener("click", () => {
	var path = document.querySelector("#path-dialog > input[type=text]").value.replaceAll('"', "");
	ipcRenderer.send("checkPath", { data: path });
});

document.querySelector("#path-dialog-bg > div > div.dialog-button > button.secondary").addEventListener("click", () => {
	document.getElementById("path-dialog-bg").classList.add("hidden");
});

ipcRenderer.on("pathIsValid", (_event, { data }) => {
	console.log(data);
	if (data) {
		document.querySelector("#path-dialog > p.error-text").style.display = "none";
		document.getElementById("path-dialog-bg").classList.add("hidden");
		ipcRenderer.send("reloadApp");
	} else {
		document.querySelector("#path-dialog > p.error-text").style.display = "block";
	}
});

window.onbeforeunload = (event) => {
	win.removeAllListeners();
};

function handleWindowControls() {
	document.getElementById("min-button").addEventListener("click", (event) => {
		win.minimize();
	});

	document.getElementById("max-button").addEventListener("click", (event) => {
		win.maximize();
	});

	document.getElementById("restore-button").addEventListener("click", (event) => {
		win.unmaximize();
	});

	document.getElementById("close-button").addEventListener("click", (event) => {
		win.close();
	});

	toggleMaxRestoreButtons();
	win.on("maximize", toggleMaxRestoreButtons);
	win.on("unmaximize", toggleMaxRestoreButtons);

	function toggleMaxRestoreButtons() {
		if (win.isMaximized()) {
			document.body.classList.add("maximized");
		} else {
			document.body.classList.remove("maximized");
		}
	}
}

var gen = 0;
const config = {
	seed: -1,
	threads: 16,
	n_predict: 6942069,
	model: "7B",
	top_k: 420,
	top_p: 0.9,
	temp: 0.9,
	repeat_last_n: 64,
	repeat_penalty: 1.3,
	debug: false,
	// html: true,
	models: []
};
const socket = io();
const form = document.getElementById("form");
const stopButton = document.getElementById("stop");
const input = document.getElementById("input");
const model = document.getElementById("model");
const messages = document.getElementById("messages");

input.addEventListener("keydown", () => {
	setTimeout(() => {
		input.style.height = "auto";
		input.style.height = input.scrollHeight + "px";
	});
});
input.addEventListener("keyup", () => {
	setTimeout(() => {
		input.style.height = "auto";
		input.style.height = input.scrollHeight + "px";
	});
});

const renderHeader = (config) => {
	const fields = [{ key: "debug", type: "checkbox" }, "threads", "n_predict", "repeat_last_n", "repeat_penalty", "top_k", "top_p", "temp", "seed"]
		.map((key) => {
			if (typeof key === "string") {
				return `
<div class='kv'>
<label>${key}</label>
<input 
  name="${key}" 
  type='number' 
  placeholder="${key}" 
  value="${config[key] || ""}"
>
</div>`;
			} else {
				if (key.type === "checkbox") {
					return `
<div class='kv'>
  <label>${key.key}</label>
  <label class="switch">
    <input name="${key.key}" type='checkbox' ${config[key.key] ? "checked" : ""}>
    <span class="slider round"></span>
  </label>
</div>`;
				}
			}
		})
		.join("");

	config.model = config.models[0];
	const models = config.models
		.map((model, i) => {
			return `<option value="${model}" ${i === 0 ? "selected" : ""}>${model}</option>`;
		})
		.join("");
	return `
<div class='config-container'>
  ${fields}
  <div class='kv'>
    <label>model</label>
    <label class="dropdown-arrow">
      <select id="model" name="model">${models}</select>
    </label>
  </div>
  <div class="kv">
    <label for="prompt-select">prompt</label>
    <label class="dropdown-arrow">
      <select id="prompt-select" name="prompt-select"></select>
    </label>
  </div>
</div>`;
};
let isRunningModel = false;
const loading = (on) => {
	if (on) {
		document.querySelector(".loading").classList.remove("hidden");
	} else {
		document.querySelector(".loading").classList.add("hidden");
	}
};
document.querySelector(".form-header").addEventListener("input", (e) => {
	if (e.target.tagName === "SELECT") {
		if (e.target.id == "model") {
			console.log(e.target.id);
			if (config[e.target.name] != config.models[e.target.selectedIndex]) {
				socket.emit("request", {
					method: "stop"
				});
			}
			config[e.target.name] = config.models[e.target.selectedIndex];
			console.log(config.models[e.target.selectedIndex]);
		}
	} else if (e.target.type === "checkbox") {
		config[e.target.name] = e.target.checked;
	} else {
		config[e.target.name] = e.target.value;
	}
});

form.addEventListener("submit", (e) => {
	e.preventDefault();
	e.stopPropagation();
	if (input.value) {
		config.prompt = input.value.replaceAll("\n", "\\n");
		ipcRenderer.send("message", { data: config.prompt });
		say(input.value, `user${gen}`, true);
		loading(config.prompt);
		input.value = "";
		isRunningModel = true;
		form.setAttribute("class", isRunningModel ? "running-model" : "");
		gen++;
		setTimeout(() => {
			input.style.height = "auto";
			input.style.height = input.scrollHeight + "px";
		});
	}
});
input.addEventListener("keydown", (e) => {
	if (e.keyCode === 13) {
		e.preventDefault();
		if (e.shiftKey) {
			document.execCommand("insertLineBreak");
		} else {
			form.requestSubmit();
		}
	}
});

stopButton.addEventListener("click", (e) => {
	e.preventDefault();
	e.stopPropagation();
	ipcRenderer.send("stopGeneration");
	setTimeout(() => {
		isRunningModel = false;
		form.setAttribute("class", isRunningModel ? "running-model" : "");
		input.style.height = "34px";
	}, 5);
});

const sha256 = async (input) => {
	const textAsBuffer = new TextEncoder().encode(input);
	const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map((item) => item.toString(16).padStart(2, "0")).join("");
	return hash;
};
const say = (msg, id, isUser) => {
	let item = document.createElement("li");
	if (id) item.setAttribute("data-id", id);
	item.classList.add(isUser ? "user-msg" : "bot-msg");
	console.log(msg);
	item.innerHTML = msg;
	if (document.getElementById("bottom").getBoundingClientRect().y - 40 < window.innerHeight) {
		setTimeout(() => {
			bottom.scrollIntoView({ behavior: "smooth", block: "end" });
		}, 100);
	}
	messages.append(item);
};
socket.emit("request", {
	method: "installed"
});
var responses = [];

function setHomepage() {
	if (document.getElementById("model").value.toLowerCase().startsWith("alpaca")) {
		document.body.classList.remove("llama");
		document.body.classList.add("alpaca");
	} else if (document.getElementById("model").value.toLowerCase().startsWith("llama")) {
		document.body.classList.remove("alpaca");
		document.body.classList.add("llama");
	}
}

ipcRenderer.on("result", async (_event, { data }) => {
	var response = data;
	loading(false);
	if (data == "\n\n<end>") {
		setTimeout(() => {
			isRunningModel = false;
			form.setAttribute("class", isRunningModel ? "running-model" : "");
		}, 200);
	} else {
		console.log(data);
		document.body.classList.remove("llama");
		document.body.classList.remove("alpaca");
		isRunningModel = true;
		form.setAttribute("class", isRunningModel ? "running-model" : "");
		const id = gen;
		let existing = document.querySelector(`[data-id='${id}']`);
		if (existing) {
			if (!responses[id]) {
				responses[id] = document.querySelector(`[data-id='${id}']`).innerHTML;
			}
			response = response.replaceAll(/</g, "&lt;");
			response = response.replaceAll(/>/g, "&gt;");
			console.log(response);

			responses[id] = responses[id] + response;

			if (responses[id].startsWith("<br>")) {
				responses[id] = responses[id].replace("<br>", "");
			}
			if (responses[id].startsWith("\n")) {
				responses[id] = responses[id].replace("\n", "");
			}

			responses[id] = responses[id].replaceAll(/\r?\n\x1B\[\d+;\d+H./g, "");
			responses[id] = responses[id].replaceAll(/\x08\r?\n?/g, "");

			responses[id] = responses[id].replaceAll("\\t", "&nbsp;&nbsp;&nbsp;&nbsp;"); //tab chracters
			responses[id] = responses[id].replaceAll("\\b", "&nbsp;"); //no break space
			responses[id] = responses[id].replaceAll("\\f", "&nbsp;"); //no break space
			responses[id] = responses[id].replaceAll("\\r", "\n"); //sometimes /r is used in codeblocks

			responses[id] = responses[id].replaceAll("\\n", "\n"); //convert line breaks back
			responses[id] = responses[id].replaceAll("\\\n", "\n"); //convert line breaks back
			responses[id] = responses[id].replaceAll('\\\\\\""', '"'); //convert quotes back

			responses[id] = responses[id].replaceAll(/\[name\]/gi, "Alpaca");

			//support for codeblocks
			responses[id] = responses[id].replaceAll("\\begin{code}", `<pre><code>`); //start codeblock

			responses[id] = responses[id].replaceAll("\\end{code}", `</code></pre>`); //end codeblock
			// if scroll is within 8px of the bottom, scroll to bottom
			if (document.getElementById("bottom").getBoundingClientRect().y - 40 < window.innerHeight) {
				setTimeout(() => {
					bottom.scrollIntoView({ behavior: "smooth", block: "end" });
				}, 100);
			}
			existing.innerHTML = responses[id];
		} else {
			say(response, id);
		}
	}
});

ipcRenderer.on("installedModels", (_events, { data }) => {
	if (!document.querySelector(".form-header .config-container")) {
		var header = document.createElement("div");
		document.querySelector(".form-header").prepend(header);
		header.outerHTML = renderHeader(config);

		// Load prompts from files
		const promptSelect = document.getElementById("prompt-select");
		fetch("./prompts")
			.then((response) => response.json())
			.then((prompts) => {
				console.log(prompts);
				if (prompts.length === 0) {
					promptSelect.disabled = true;
					return;
				}
				// Populate prompt options
				prompts.forEach((prompt) => {
					const option = document.createElement("option");
					option.value = prompt.value;
					option.textContent = prompt.name;
					promptSelect.appendChild(option);
				});
				// Select the "default" prompt if it exists, otherwise select the first prompt
				const defaultPrompt = prompts.find((prompt) => prompt.name.toLowerCase() === "instruction-alpaca");
				const initialPrompt = defaultPrompt || prompts[0];
				promptSelect.value = initialPrompt.value;
				input.value = initialPrompt.value;
				setTimeout(() => {
					input.style.height = "auto";
					input.style.height = input.scrollHeight + "px";
				});
				// Update the input text with the selected prompt value
				const handlePromptChange = () => {
					const selectedPromptValue = promptSelect.value;
					const currentInputValue = input.value;
					input.value = selectedPromptValue;
					// Move the cursor to the first instance of ">PROMPT" and select only the word ">PROMPT"
					const promptIndex = input.value.indexOf(">PROMPT");
					// Focus the input
					input.focus();
					input.setSelectionRange(promptIndex, promptIndex + ">PROMPT".length);
					setTimeout(() => {
						input.style.height = "auto";
						input.style.height = input.scrollHeight + "px";
					});
				};
				promptSelect.addEventListener("change", handlePromptChange);
				// Create a Reset button
				const resetButton = document.createElement("button");
				resetButton.textContent = "Reset";
				// Append the Reset button to the same container as the dropdown
				promptSelect.parentNode.appendChild(resetButton);
				resetButton.addEventListener("click", (e) => {
					e.preventDefault(); // Prevent form from submitting
					handlePromptChange();
				});
			})
			.catch((error) => {
				console.error("Error loading prompts:", error);
			});

		// document.querySelector(".form-header").innerHTML = renderHeader(config);
		setHomepage();
		document.getElementById("model").addEventListener("change", () => {
			if (document.body.classList.length != 0) {
				setHomepage();
			}
		});
	} else {
		config.models.push(response);
	}
});

document.querySelectorAll("#feed-placeholder-llama button.card").forEach((e) => {
	e.addEventListener("click", () => {
		let text = e.innerText.replace('"', "").replace('" →', "");
		input.value = text;
	});
});
document.querySelectorAll("#feed-placeholder-alpaca button.card").forEach((e) => {
	e.addEventListener("click", () => {
		let text = e.innerText.replace('"', "").replace('" →', "");
		input.value = text;
	});
});

const cpuText = document.querySelector("#cpu .text");
const ramText = document.querySelector("#ram .text");
const cpuBar = document.querySelector("#cpu .bar-inner");
const ramBar = document.querySelector("#ram .bar-inner");

var cpuCount, threadUtilized, totalmem, cpuPercent, freemem;
ipcRenderer.send("cpuCount");
ipcRenderer.send("threadUtilized");
ipcRenderer.send("totalmem");
ipcRenderer.on("cpuCount", (_event, { data }) => {
	cpuCount = data;
});
ipcRenderer.on("threadUtilized", (_event, { data }) => {
	threadUtilized = data;
});
ipcRenderer.on("totalmem", (_event, { data }) => {
	totalmem = Math.round(data / 102.4) / 10;
});

setInterval(async () => {
	ipcRenderer.send("cpuUsage");
	ipcRenderer.send("freemem");
}, 1500);
ipcRenderer.on("cpuUsage", (_event, { data }) => {
	cpuPercent = Math.round(data * 100);
	cpuText.innerText = `CPU: ${cpuPercent}%, ${threadUtilized}/${cpuCount} threads`;
	cpuBar.style.transform = `scaleX(${cpuPercent / 100})`;
});
ipcRenderer.on("freemem", (_event, { data }) => {
	freemem = data;
	ramText.innerText = `RAM: ${Math.round((totalmem - freemem) * 10) / 10}GB/${totalmem}GB`;
	ramBar.style.transform = `scaleX(${(totalmem - freemem) / totalmem})`;
});

document.getElementById("clear").addEventListener("click", () => {
	input.value = "";
	setTimeout(() => {
		input.style.height = "auto";
		input.style.height = input.scrollHeight + "px";
	});
});

document.getElementById("clear-chat").addEventListener("click", () => {
	document.querySelectorAll("#messages li").forEach((element) => {
		element.remove();
	});
});
document.getElementById("change-model").addEventListener("click", () => {
	ipcRenderer.send("getCurrentModel");
	document.querySelector("#path-dialog-bg > div > div.dialog-button > button.secondary").style.display = "";
	document.querySelector("#path-dialog-bg > div > div.dialog-title > h3").innerText = "Change model path";
	document.getElementById("path-dialog-bg").classList.remove("hidden");
});

ipcRenderer.on("currentModel", (_event, { data }) => {
	document.querySelector("#path-dialog > input[type=text]").value = data;
});

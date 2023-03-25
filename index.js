// checks if the app is being run as an installer
const setupEvents = require("./installers/setupEvents");
if (setupEvents.handleSquirrelEvent()) {
	return;
}

const { BrowserWindow, app, ipcMain } = require("electron");
const path = require("path");
require("@electron/remote/main").initialize();

var win;
app.on("ready", () => {
	win = new BrowserWindow({
		width: 1200,
		height: 810,
		minWidth: 960,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			devTools: false
		},
		titleBarStyle: "hidden",
		icon: path.join(__dirname, "icon", "png", "128x128.png")
	});
	require("@electron/remote/main").enable(win.webContents);

	win.loadFile(path.resolve(__dirname, "src", "index.html"));

	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
app.on("before-quit", () => {
	if (runningShell) runningShell.kill();
});

ipcMain.on("reloadApp", () => {
	app.relaunch();
	app.exit();
});

// OS STATS
const osUtil = require("os-utils");
var threads;
var sysThreads = osUtil.cpuCount();
for (let i = 1; i < sysThreads - 1; i = i * 2) {
	threads = i;
}
ipcMain.on("cpuUsage", () => {
	osUtil.cpuUsage(function (v) {
		win.webContents.send("cpuUsage", { data: v });
	});
});
ipcMain.on("cpuFree", () => {
	osUtil.cpuFree(function (v) {
		win.webContents.send("cpuFree", { data: v });
	});
});

ipcMain.on("cpuCount", () => {
	win.webContents.send("cpuCount", {
		data: osUtil.cpuCount()
	});
});
ipcMain.on("threadUtilized", () => {
	win.webContents.send("threadUtilized", {
		data: threads
	});
});
ipcMain.on("freemem", () => {
	win.webContents.send("freemem", {
		data: Math.round(osUtil.freemem() / 102.4) / 10
	});
});
ipcMain.on("totalmem", () => {
	win.webContents.send("totalmem", {
		data: osUtil.totalmem()
	});
});

// SET-UP
const Store = require("electron-store");
const store = new Store();
const fs = require("fs");
var modelPath = store.get("modelPath");

ipcMain.on("checkModelPath", () => {
	modelPath = store.get("modelPath");
	if (modelPath) {
		if (fs.existsSync(path.resolve(modelPath))) {
			win.webContents.send("modelPathValid", { data: true });
		} else {
			win.webContents.send("modelPathValid", { data: false });
		}
	} else {
		win.webContents.send("modelPathValid", { data: false });
	}
});

ipcMain.on("checkPath", (_event, { data }) => {
	if (data) {
		if (fs.existsSync(path.resolve(data))) {
			store.set("modelPath", data);
			modelPath = store.get("modelPath");
			win.webContents.send("pathIsValid", { data: true });
		} else {
			win.webContents.send("pathIsValid", { data: false });
		}
	} else {
		win.webContents.send("pathIsValid", { data: false });
	}
});

// RUNNING CHAT
const pty = require("node-pty-prebuilt-multiarch");
const os = require("os");
var runningShell, currentPrompt;
var alpacaReady,
	alpacaHalfReady = false;
var checkAVX,
	isAVX2 = false;
if (store.get("supportsAVX2") == undefined) {
	store.set("supportsAVX2", true);
}
var supportsAVX2 = store.get("supportsAVX2");
const config = {
	name: "xterm-color",
	cols: 69420,
	rows: 30
};
const platform = os.platform();
const shell = platform === "win32" ? "powershell.exe" : "bash";
const stripAnsi = (str) => {
	const pattern = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");

	const regex = new RegExp(pattern, "g");
	return str.replace(regex, "");
};

function initChat() {
	if (runningShell) {
		win.webContents.send("ready");
		return;
	}
	const ptyProcess = pty.spawn(shell, [], config);
	runningShell = ptyProcess;
	ptyProcess.onData((res) => {
		res = stripAnsi(res);
		console.log(`////> ${res}`);
		if ((res.includes("llama_model_load: invalid model file") || res.includes("llama_model_load: failed to open")) && res.includes("main: failed to load model from")) {
			runningShell.kill();
			win.webContents.send("modelPathValid", { data: false });
		} else if (res.includes("\n>") && !alpacaReady) {
			alpacaHalfReady = true;
		} else if (alpacaHalfReady && !alpacaReady) {
			alpacaReady = true;
			checkAVX = false;
			win.webContents.send("ready");
			console.log("ready!");
		} else if (res.startsWith("sampling parameters: ") && !checkAVX) {
			checkAVX = true;
			console.log("avx error");
		} else if (res.match(/PS [A-Z]:.*>/) && checkAVX) {
			console.log("avx2 incompatible, retrying with avx1");
			runningShell.kill();
			runningShell = undefined;
			currentPrompt = undefined;
			alpacaReady = false;
			alpacaHalfReady = false;
			supportsAVX2 = false;
			store.set("supportsAVX2", false);
			initChat();
		} else if (res.match(/PS [A-Z]:.*>/) && alpacaReady) {
			console.log("restarting");
			win.webContents.send("result", {
				data: "\n\n<end>"
			});
			runningShell.kill();
			runningShell = undefined;
			currentPrompt = undefined;
			alpacaReady = false;
			alpacaHalfReady = false;
			initChat();
		} else if (res.includes("\n>") && alpacaReady) {
			win.webContents.send("result", {
				data: "\n\n<end>"
			});
		} else if (!res.startsWith(currentPrompt) && alpacaReady) {
			win.webContents.send("result", {
				data: res
			});
		}
	});
	runningShell.write(`[System.Console]::OutputEncoding=[System.Console]::InputEncoding=[System.Text.Encoding]::UTF8; ."${path.resolve(__dirname, "bin", supportsAVX2 ? "" : "no_avx2", "chat.exe")}" -m "${modelPath}" --temp 0.9 --top_k 420 --top_p 0.9 --threads ${threads} --repeat_last_n 128\r`);
}
ipcMain.on("startChat", () => {
	initChat();
});

ipcMain.on("message", (_event, { data }) => {
	// console.log(`User says: ${data}`);
	currentPrompt = data;
	if (runningShell) {
		runningShell.write(`${data}\r`);
	}
});
ipcMain.on("stopGeneration", () => {
	if (runningShell) {
		runningShell.write("\x03");
		setTimeout(() => {
			win.webContents.send("result", {
				data: "\n\n<end>"
			});
		}, 200);
	}
});
ipcMain.on("getCurrentModel", () => {
	win.webContents.send("currentModel", {
		data: store.get("modelPath")
	});
});

process.on("unhandledRejection", () => {});
process.on("uncaughtException", () => {});
process.on("uncaughtExceptionMonitor", () => {});
process.on("multipleResolves", () => {});

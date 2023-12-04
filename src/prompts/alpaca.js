const instruction = "Below is an instruction that describes a task. Write a response that appropriately completes the request.\n\n";
const prefix = {
	user: "### Instruction: ",
	bot: "### Response: "
};

module.exports = { instruction, prefix };

const createWindowsInstaller = require("electron-winstaller").createWindowsInstaller;
const path = require("path");
const version = "1.0.0";

getInstallerConfig()
	.then(createWindowsInstaller)
	.catch((error) => {
		console.error(error.message || error);
		process.exit(1);
	});

function getInstallerConfig() {
	console.log("creating windows installer");
	const rootPath = path.join("./");
	const outPath = path.join(rootPath, "release-builds");

	return Promise.resolve({
		appDirectory: path.join(outPath, "Alpaca Electron-win32-x64/"),
		authors: "Pi",
		noMsi: true,
		outputDirectory: path.join(outPath, "windows-installer"),
		exe: "Alpaca Electron.exe",
		setupExe: "Alpaca-Electron-setup-win-v" + version + ".exe"
	});
}

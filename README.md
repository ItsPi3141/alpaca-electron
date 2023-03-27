<h1 align="center">
<sub>
<img src="https://raw.githubusercontent.com/ItsPi3141/alpaca-electron/main/icon/alpaca-chat-logo.png?raw=true" height=144>
</sub>
<br>
Alpaca Electron
</h1>
<br>
<p align="center">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white">
  <img src="https://img.shields.io/badge/Alpaca.cpp-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white">
</p>
<p align="center"><i>Alpaca Electron is built from the ground-up to be the easiest way to chat with the alpaca AI models. No command line or compiling needed!</i></p>
<br>
<hr>

## 📃 Features + to-do

- [x] Runs locally on your computer, internet connection is not needed except when downloading models
- [x] Compact and efficient since it uses [alpaca.cpp](https://github.com/antimatter15/alpaca.cpp) as it's backend
- [x] Runs on CPU, anyone can run it without an expensive graphics card
- [x] No external dependencies required, everything is included in the installer
- [x] "Borrowed" UI from *that* popular chat AI :trollface:
- [x] Supports Windows and MacOS
- [x] Docker-ized 🐋
- [x] Linux support
- [ ] Chat history
- [ ] Context memory
- [ ] Integration with Stable Diffusion

## 🎞 Demo

![Demonstration](https://github.com/ItsPi3141/alpaca-electron/raw/main/demo.gif)

## 🚀 Quick Start Guide

1. Download an Alpaca model (7B native is recommended) and place it somewhere on your computer where it's easy to find.
> **Note**  
> Download links will not be provided in this repository.

2. Download the latest installer from the [releases page](https://github.com/ItsPi3141/alpaca-electron/releases) section.

3. Open the installer and wait for it to install.

4. Once done installing, it'll ask for a valid path to a model. Now, go to where you placed the model, hold shift, right click on the file, and then click on "Copy as Path". Then, paste this into that dialog box and click `Confirm`. 

5. The program will automatically restart. Now you can begin chatting!

> **Note**  
> The program will also accept any other 4 bit quantized .bin model files. If you can find other .bin Alpaca model files, you can use them instead of the one recommended in the Quick Start Guide to experiment with different models. As always, be careful about what you download from the internet.

## 🔧 Troubleshooting

### General
- If you get an error that says "Invalid file path" when pasting the path to the model file, you probably have some sort of misspelling in there. Try copying the path again or using the file picker.
- If you get an error that says "Couldn't load model", your model is probably corrupted or incompatible. Try downloading the model again.
- If you face other problems or issues not listed here, create an issue in the "Issues" tab at the top of this page. Describe in detail what happens, and include screenshots. 

### Windows
- If the model has been loaded into RAM but text generation doesn't seem start, [check](https://ark.intel.com/content/www/us/en/ark.html#@Processors) to see if your CPU is compatible with the [AVX2](https://edc.intel.com/content/www/us/en/design/ipla/software-development-platforms/client/platforms/alder-lake-desktop/12th-generation-intel-core-processors-datasheet-volume-1-of-2/002/intel-advanced-vector-extensions-2-intel-avx2/) instruction set. If it does not support AVX2, Alpaca Electron will use AVX instead, which is much slower so be patient. 

### MacOS
- If you get an error that says "App can't be opened because it is from an unidentified developer.", go to the Applications folder. Then, hold the control key and click on the app. Then click "Open", then click "Open" when it gives you a warning. Your preference will be saved and MacOS will let you open the app normally from now on. 

### Linux

- You can either download the prebuilt binary (packaged as tar.gz), extract it and execute it with ```./alpaca-electron``` or build the application on yourself.

- If you want to build the application yourself:
>Clone the repository:
>
>```git clone https://github.com/ItsPi3141/alpaca-electron.git```
>
>Change your current directory to alpaca-electron:
>
>```cd alpaca-electron```
>
>Install application specific dependencies: 
>
>```npm install --save-dev```
>
>Build the application:
>
>```npm run linux-x64```
>
>Change your current directory to the build target:
>
>```cd release-builds/alpaca-electron-linux-x64```
>
>Run the application with ```./alpaca-electron```

### Docker Compose

- You can run this electron application with docker compose. Therefore you need to compelete the following steps:

>Clone the repository:
>
>```git clone https://github.com/ItsPi3141/alpaca-electron.git```
>
>Change your current directory to alpaca-electron:
>
>```cd alpaca-electron```
>
>Build the container image:
>
>```docker compose build```
>
>Run the application container:
>
>```docker compose up -d```

- If no window opens up run ```docker compose up``` (without the -d). If there is an error like ```Authorization required, but no authorization protocol specified``` run ```xhost local:root``` on your docker host.

## 👨‍💻 Credits

Credits go to [antimatter15](https://github.com/antimatter15/alpaca.cpp) for creating alpaca.cpp and to [ggerganov](https://github.com/ggerganov/llama.cpp) for creating llama.cpp, the backbones behind alpaca.cpp. Finally, credits go to Meta and Stanford for creating the LLaMA and Alpaca models, respectively.

Special thanks to [@keldenl](https://github.com/keldenl) for providing arm64 builds for MacOS

<p align="center"><img src="https://raw.githubusercontent.com/ItsPi3141/alpaca-electron/main/icon/alpaca-chat-logo.png?raw=true" height=192></p>
<h1 align="center">
  Alpaca Electron
</h1>
<p align="center">Alpaca Electron is built from the ground-up to be the easiest way to chat with the alpaca AI models. No command line or compiling needed!</p>

## 📃 Features

-   Fully local to your computer
-   Compact and efficient since it uses [alpaca.cpp](https://github.com/antimatter15/alpaca.cpp) as it's backend
-   Runs on the CPU, meaning no need for an expensive graphics card
-   No external dependencies required, everything is included in the installer

## 🎞 Demo

![Demonstration](https://github.com/ItsPi3141/alpaca-electron/raw/main/demo.gif)

## 🚀 Quick Start Guide

Step 1. Download the [model file](https://huggingface.co/Sosaka/Alpaca-native-4bit-ggml/blob/main/ggml-alpaca-7b-q4.bin) and place it somewhere on your computer where it's easy to find.

Step 2. Download the latest .exe from the [releases](https://github.com/ItsPi3141/alpaca-electron/releases) section.

Step 3. Open the program and wait for it to install.

Step 4. Once done installing, it'll ask for a valid path to a model. Now, go to where you placed the model, hold shift, right click on the file, and then click on "Copy as Path". Then, paste this into that dialog box.

Step 5. The program will automatically restart. Now you can begin chatting!

#### Note that the program will also accept any other 4 bit quantized .bin model files. If you can find other .bin Alpaca model files, you can use them instead of the one in the Quick Start Guide to experiment with different models. As always, be careful about what you download from the internet.

## 🔧 Troubleshooting

-   If you get an error like, "Invalid file path" when pasting the path to the model file, you probably have some sort of misspelling in there. Try getting the path again.
-   If you get an error like, "Invalid model file", your model is probably corrupted. Try downloading the model again
-   If you get any other error, create an issue in the "Issues" tab at the top of this page. Describe in detail what happens, and include screenshots.

## 👨‍💻 Credits

Credits go to [antimatter15](https://github.com/antimatter15/alpaca.cpp) for creating alpaca.cpp and [Sosaka](https://huggingface.co/Sosaka/Alpaca-native-4bit-ggml) for creating the 4 bit quantized Alpaca 7B Native model file. Credits also go to [chavinlo](https://huggingface.co/chavinlo/alpaca-native) for creating the original Alpaca 7B Native model, and to [ggerganov](https://github.com/ggerganov/llama.cpp) for creating llama.cpp, the backbones behind alpaca.cpp. Finally, credits go to Meta and Stanford for creating the LLaMA and Alpaca models, respectively.

FROM debian:bullseye-slim as alpaca-cpp-builder

USER root

RUN apt-get update \
 && apt-get install -yq --no-install-recommends git build-essential ca-certificates \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV LD_LIBRARY_PATH=/usr/local/lib64:$LD_LIBRARY_PATH

RUN git clone https://github.com/ggerganov/llama.cpp /tmp/llama.cpp
RUN cd /tmp/llama.cpp && git checkout master-87a6f84 && make -j

FROM node:20.0-bullseye as alpaca-electron-builder

USER root

COPY . /tmp/alpaca-electron
COPY --from=alpaca-cpp-builder /tmp/llama.cpp/main /tmp/alpaca-electron/bin/chat
WORKDIR /tmp/alpaca-electron

RUN npm install
RUN npm run linux-x64 

FROM debian:bullseye-slim

USER root

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -yq --no-install-recommends tini procps xorg openbox libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 libatk-adaptor \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir /alpaca-electron
ARG src="/tmp/alpaca-electron/release-builds/Alpaca Electron-linux-x64"
COPY --chown=1000 --from=alpaca-electron-builder ${src} /alpaca-electron

WORKDIR /alpaca-electron

RUN chown root chrome-sandbox
RUN chmod 4755 chrome-sandbox

RUN useradd -m -u 1000 debian
RUN mkdir -p /home/debian/.config && chown debian:debian /home/debian/.config

USER 1000
ENTRYPOINT [ "tini", "--" ]
CMD [ "bash", "-c", "/alpaca-electron/Alpaca\\ Electron --no-sandbox --disable-gpu & sleep 5 && while [[ $(ps | grep 'Alpaca\\ Electron' | wc -l) -gt 0 ]]; do sleep 5; done" ]

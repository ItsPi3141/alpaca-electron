FROM debian:stable as alpaca-cpp-builder

USER root

RUN apt-get update \
 && apt-get install -yq --no-install-recommends git build-essential ca-certificates \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/antimatter15/alpaca.cpp.git /tmp/alpaca.cpp
WORKDIR /tmp/alpaca.cpp

RUN make chat

FROM node:19.8-bullseye

USER root

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -yq --no-install-recommends tini git libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 xorg openbox libatk-adaptor \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node . /alpaca-electron
COPY --from=alpaca-cpp-builder /tmp/alpaca.cpp/chat /alpaca-electron/bin/chat
WORKDIR /alpaca-electron

RUN npm install
RUN npx electron-rebuild

RUN chown -R node:node .

RUN chown root ./node_modules/electron/dist/chrome-sandbox
RUN chmod 4755 ./node_modules/electron/dist/chrome-sandbox

USER node

ENTRYPOINT [ "bash", "-c", "npx electron --no-sandbox . & sleep 5 && while [[ $(ps | grep electron | wc -l) -gt 0 ]]; do sleep 5; done" ]

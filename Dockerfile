FROM debian:bullseye-slim as alpaca-cpp-builder

USER root

RUN apt-get update \
 && apt-get install -yq --no-install-recommends git build-essential ca-certificates \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/antimatter15/alpaca.cpp.git /tmp/alpaca.cpp
WORKDIR /tmp/alpaca.cpp

RUN make chat

FROM node:19.8 as alpaca-electron-builder

USER root

COPY . /tmp/alpaca-electron
COPY --from=alpaca-cpp-builder /tmp/alpaca.cpp/chat /tmp/alpaca-electron/bin/chat
WORKDIR /tmp/alpaca-electron

RUN npm install --save-dev
RUN npm run linux-x64 

FROM debian:bullseye-slim

USER root

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -yq --no-install-recommends tini procps xorg openbox libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 libatk-adaptor \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir /alpaca-electron
COPY --chown=1000 --from=alpaca-electron-builder /tmp/alpaca-electron/release-builds/alpaca-electron-linux-x64 /alpaca-electron

WORKDIR /alpaca-electron

RUN chown root chrome-sandbox
RUN chmod 4755 chrome-sandbox

RUN useradd -m -u 1000 debian
USER 1000

ENTRYPOINT [ "tini", "--" ]
CMD [ "bash", "-c", "/alpaca-electron/alpaca-electron --no-sandbox & sleep 5 && while [[ $(ps | grep electron | wc -l) -gt 0 ]]; do sleep 5; done" ]

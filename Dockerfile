#!/bin/bash

FROM node:18

ARG PORT=5600
ARG MONGO_URI=""
ARG LOG_LEVEL="debug"

ENV MONGO_URI $MONGO_URI
ENV PORT $PORT
ENV LOG_LEVEL $LOG_LEVEL

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm test

EXPOSE ${PORT}

CMD [ "npm", "start" ]
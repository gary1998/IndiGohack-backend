FROM registry.access.redhat.com/ubi8/nodejs-16:1-111.1689167503

USER root
RUN yum update -y && yum upgrade -y

WORKDIR /opt/app-root/src

ARG PORT=5600
ARG MONGO_URI=""
ARG LOG_LEVEL="debug"
ARG IFTTT_KEY=""

ENV MONGO_URI $MONGO_URI
ENV PORT $PORT
ENV LOG_LEVEL $LOG_LEVEL
ENV IFTTT_KEY $IFTTT_KEY
ENV NODE_ENV production

COPY package.json /opt/app-root/src
RUN npm install
COPY . /opt/app-root/src

RUN npm test

EXPOSE ${PORT}
CMD [ "npm", "start" ]
FROM node:21-alpine3.18
WORKDIR /home/

COPY client/package*.json ./
RUN npm install
RUN rm ./package*.json
RUN rm -r node
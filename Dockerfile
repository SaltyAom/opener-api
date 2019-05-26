FROM node:12.2.0-slim
WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn
COPY . .
EXPOSE 4000
cmd ["yarn", "start"]
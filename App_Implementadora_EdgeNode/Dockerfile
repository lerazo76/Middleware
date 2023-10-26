FROM node:14.17
WORKDIR /EdgeNode
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "StartApp.js"]


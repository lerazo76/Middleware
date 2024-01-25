FROM node:14.17
WORKDIR /visor-autoconsciencia-1
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "inicio.js"]
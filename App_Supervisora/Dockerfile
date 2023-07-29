FROM node:18.12.1
WORKDIR /app-supervisora
COPY package*.json ./
RUN npm install
RUN npm install ponte
COPY . .
CMD ["node", "StartApp.js", "--ruta", "/app-supervisora/modelos/Modelo.json"]
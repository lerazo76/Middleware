FROM node:14.17
WORKDIR /app-supervisor-nodo-fog-1
COPY package*.json ./s
RUN npm install
RUN npm install ponte
RUN npm install chokidar
RUN npm install request
COPY . .
CMD ["node", "StartApp.js", "--tipoejecucion", "2", "--rutamodelos", "./modelos","--tipoapp","1"]
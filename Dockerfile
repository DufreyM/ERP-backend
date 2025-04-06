FROM node:22.14.0-alpine
WORKDIR /app

# Se le pasan a Docker las dependencias
COPY package*.json ./
RUN npm install

# Copia el código fuente en el directorio actual
COPY . .

EXPOSE 3000
CMD ["npm", "start"]

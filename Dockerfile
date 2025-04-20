FROM node:22.14.0-alpine    
RUN apk add --no-cache postgresql-client

WORKDIR /app
#Se elige node 22; y se le solicita que trabaje en el directorio /app 

# Se le pasan a Docker las dependencias a usar, ubicadas en package.json 
COPY package*.json ./
RUN npm install

# Copia el código fuente en el directorio específico
COPY . .
RUN chmod +x entrypoint.sh

#RUN npm install -g knex
#Se expone el puerto 3000 para su uso. Y se llaman las funciones a ejecutar. 
EXPOSE 3000
CMD ["./entrypoint.sh"]

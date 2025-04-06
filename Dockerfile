FROM node:22.14.0-alpine    
WORKDIR /app
#Se elige node 22; y se le solicita que trabaje en el directorio /app 

# Se le pasan a Docker las dependencias a usar, ubicadas en package.json 
COPY package*.json ./
RUN npm install

# Copia el código fuente en el directorio actual
COPY . .

#Se expone el puerto 3000 para su uso. Y se llaman las funciones a ejecutar. 
EXPOSE 3000
CMD ["npm", "start"]

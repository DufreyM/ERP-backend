# 💊 ERP Farmacia Econofarma - Backend Sprint 1

Este repositorio contiene el backend básico para el primer sprint del ERP de **Farmacia Econofarma**. Se trata de una API REST construida con **Node.js**, **Express** y **PostgreSQL**, diseñada para pruebas iniciales de conexión y despliegue.

## 🚀 Tecnologías utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [cors](https://www.npmjs.com/package/cors)

## 📁 Estructura del proyecto

express-backend/
 │ ├── index.js # Punto de entrada de la app 
 ├── .env # Variables de entorno
 ├── package.json # Dependencias y scripts 
 └── README.md # Documentación del proyecto


## ⚙️ Instalación y ejecución

1. Clona el repositorio:
git clone https://github.com/tuusuario/express-backend.git
cd express-backend
npm install

Crea un archivo .env con los siguientes valores:
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
PORT=3000

npm start    # Ejecución normal

## Ejemplo completo del endpoint:
URL: http://localhost:3000/

Método: GET

Descripción: Verifica que la API esté corriendo y conectada a la base de datos. También devuelve la fecha y hora actual desde PostgreSQL.

Respuesta: 

  {
    "message": "API funcionando 🎉; siuuuu",
    "timestamp": {
      "now": "2025-04-06T17:15:26.123Z"
    }
  }

## 👥 Equipo de desarrollo
Backend Lead: Grupo no. 7 Ingeniería de software 1
Proyecto ERP para: Farmacia Econofarma
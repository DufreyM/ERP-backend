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
git clone https://github.com/DufreyM/ERP-backend.git  
cd express-backend  
npm install  

Crea un archivo .env con los siguientes valores:
DB_HOST=localhost  
DB_PORT=5432  
DB_USER=tu_usuario  
DB_PASSWORD=tu_contraseña  
DB_NAME=nombre_base_datos  
PORT=3000    
  
npm start  

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
---

## 🐳 Guía para usar Docker en el proyecto

### Inicialización del entorno (Docker)

1. Asegúrate de que **Docker Desktop** esté ejecutándose.  
   > *(Nota: Puedes buscar “Docker Desktop” en el menú de inicio de Windows y abrir la aplicación manualmente, al menos es de esta manera en el caso de windows.)*

2. Abre dos terminales (por ejemplo, utilizando **Windows Terminal** o **CMD/Powershell**):
   - Una ubicada en la carpeta `backend`
   - Otra en la carpeta `frontend`

3. En **cada terminal**, ejecuta el siguiente comando:
   ```bash
   docker-compose up --build
   ```
   Este comando compilará e iniciará los contenedores correspondientes para cada servicio.

4. Espera a que se completen los procesos de construcción e inicio.  
   Docker se encargará del resto automáticamente. ✅

---

### Apagar los contenedores

**Opción 1 – Desde la misma terminal:**  
Presiona `Ctrl + C` en la terminal donde está corriendo Docker. Luego espera a que los contenedores se detengan correctamente.

**Opción 2 – Desde otra terminal (preferida):**
```bash
docker-compose down
```

> Esta opción es la mejor debido a que detiene los contenedores de forma más ordenada y segura.

---

### Reiniciar sin recompilar

Si no se ha modificado el código fuente y simplemente se desea reiniciar los contenedores, puedes usar el siguiente comando (sin la opción `--build`):

```bash
docker-compose up
```

Esto reutilizará las imágenes ya construidas, lo que acelera el proceso de inicio.


# EconoFarma Backend

Este es el backend del sistema de gestión de empresas para **EconoFarma**, diseñado para manejar la lógica de negocio, conexión a base de datos y exposición de endpoints RESTful para la gestión de una farmacia ubicada en el interior de Guatemala.

---

## Tecnologías Utilizadas

- **Express** `~5.1.0`
- **pg** `8.13.3` – Cliente PostgreSQL
- **dotenv** `^16.3.1` – Variables de entorno
- **cors** `^2.8.5` – Control de acceso HTTP
- **nodemon** `^3.1.9` – Recarga automática en desarrollo
- **postgres** `16.0.0` - Base de datos

---

## Requisitos Previos

- PostgreSQL
- Node.js `v18+`
- Git

---

## Instalación

### 1. Clonar el repositorio
```bash
git https://github.com/DufreyM/ERP-backend.git
cd express-backend
```

### 2. Instala las dependencias
```bash
npm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz con el siguiente contenido:

```env
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/nombredb
PORT=3000
```

### 4. Inicia el servidor

```bash
npm run dev
```

---

## Scripts útiles

```json
"scripts": {
  "dev": "nodemon index.js",
  "start": "node index.js"
}
```

---

## Buenas prácticas

- Ramas de desarrollo bajo `feature/` y `hotfix/`.
- Archivos comentados y organizados por responsabilidad.
- No subir archivos `.env` ni `node_modules`.
- Usar `dotenv` para ocultar credenciales.

---

## Contribuciones

Usar ramas con prefijos como `feature/crear-usuario`, y enviar pull request hacia `develop` siguiendo el flujo Git definido.

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

---

## Licencia

Proyecto académico desarrollado por el Grupo No. 7 del curso de Ingeniería de Software de estudiantes de la Universidad del Valle de Guatemala.

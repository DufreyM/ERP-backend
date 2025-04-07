
# EconoFarma Backend

Este es el backend del sistema de gestión de empresas para **EconoFarma**, diseñado para manejar la lógica de negocio, conexión a base de datos y exposición de endpoints RESTful para la gestión de una farmacia ubicada en el interior de Guatemala.

---

## Tecnologías Utilizadas

- **Express** `~5.1.0`
- **pg** `8.13.3` – Cliente PostgreSQL
- **dotenv** `^16.3.1` – Variables de entorno
- **cors** `^2.8.5` – Control de acceso HTTP
- **nodemon** `^3.1.9` – Recarga automática en desarrollo

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

## Licencia

Proyecto académico desarrollado por el Grupo No. 7 del curso de Ingeniería de Software de estudiantes de la Universidad del Valle de Guatemala.

// Nombre del archivo: authorizeRole.js

// Principales funciones y pequeña descripción de las mismas:
// 1. authorizeRole: revisa si dentro de los roles se tiene permiso para acceder a los roles. 

// Archivos relacionados:
// - .env: Contiene la clave secreta utilizada para firmar y verificar los JWT (`JWT_SECRET`).
// - mailService.js: Utiliza este middleware junto con authorizeRole para proteger rutas específicas.
// - Dockerfile / docker-compose.yml: Infraestructura necesaria para correr el backend y servicios relacionados.

// Autores:
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 21/04/2025


module.exports = function authorizeRole(rolesPermitidos) {
    return (req, res, next) => {
        const usuario = req.user;

        if (!usuario) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!rolesPermitidos.includes(usuario.rol_id)) {
            return res.status(403).json({ error: 'No tienes permiso para esta acción' });
        }

        next();
    };
};

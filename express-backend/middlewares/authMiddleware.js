// Nombre del archivo: authMiddleware.js

// Principales funciones y pequeña descripción de las mismas:
// 1. authMiddleware: Middleware que verifica la validez del token JWT enviado en el encabezado `Authorization`. Si el token es válido, agrega los datos del usuario autenticado (como `id` y `rol_id`) al objeto `req.user`. Si no lo es, bloquea la solicitud con un error 401.

// Archivos relacionados:
// - .env: Contiene la clave secreta utilizada para firmar y verificar los JWT (`JWT_SECRET`).
// - mailService.js: Utiliza este middleware junto con authorizeRole para proteger rutas específicas.
// - Dockerfile / docker-compose.yml: Infraestructura necesaria para correr el backend y servicios relacionados.

// Autores:
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 21/04/2025


const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });

        req.user = user;
        next();
    });
};

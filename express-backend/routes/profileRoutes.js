// Nombre del archivo: usuarioRoutes.js

// Principales rutas y pequeña descripción de las mismas:
// 1. GET /me: Obtiene la información del usuario autenticado utilizando el token JWT.

// Archivos relacionados:
// - models/Usuario.js: Modelo de datos para usuarios.
// - middlewares/authMiddleware.js: Middleware para autenticar el token JWT.
// - app.js o index.js: Punto de entrada donde se importa este router.

// Autor: María José Girón, 23559
// Última modificación: 06/08/2025

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const Usuario = require('../models/Usuario');

router.get('/me',
    authenticateToken,
    async (req, res) => {
        try {
            const usuarioId = req.user.id;

            const usuario = await Usuario.query()
                .findById(usuarioId)
                .select('nombre', 'email', 'status', 'fechanacimiento', 'contrasena');
            
            if(!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(usuario);
        } catch (err){
            console.error('Error al obtener el usuario:', err);
            res.status(500).json({ error: 'Error al obtener la información del usuario' });
        }
    }
)

module.exports = router;

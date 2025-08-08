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
                .select('nombre', 'apellidos', 'email', 'status', 'fechanacimiento', 'contrasena');
            
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

router.patch('/me',
    authenticateToken,
    async (req, res) => {
        try {
            const usuarioId = req.user.id;
            const camposPermitidos = ['nombre', 'apellidos', 'email', 'fechanacimiento'];
            const datosActualizados = {};

            camposPermitidos.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    datosActualizados[campo] = req.body[campo];
                }
            });

            if (Object.keys(datosActualizados).length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
            }

            const usuarioActualizado = await Usuario.query()
                .patchAndFetchById(usuarioId, datosActualizados)
                .select('nombre', 'apellidos', 'email', 'status', 'fechanacimiento');

            res.json(usuarioActualizado);
        } catch (err) {
            console.error('Error al actualizar el usuario:', err);
            res.status(500).json({ error: 'Error al actualizar la información del usuario' });
        }
    }
);

module.exports = router;

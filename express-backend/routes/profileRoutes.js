// Nombre del archivo: usuarioRoutes.js

// Principales rutas y pequeña descripción de las mismas:
// 1. GET /me: Obtiene la información del usuario autenticado utilizando el token JWT.
// 2. PATCH /me: Actualiza ciertos campos permitidos del usuario autenticado.
// 3. POST /me/upload-pfp: Sube una nueva foto de perfil del usuario a Cloudinary, elimina la anterior si existe y actualiza la referencia en la base de datos.
// 4. GET /me/foto-perfil: Verifica en Cloudinary si existe la foto de perfil del usuario. Si la encuentra, actualiza la base de datos y devuelve la URL de la foto.

// Archivos relacionados:
// - models/Usuario.js: Modelo de datos para usuarios.
// - middlewares/authMiddleware.js: Middleware para autenticar el token JWT.
// - app.js o index.js: Punto de entrada donde se importa este router.
// - services/cloudinary.js: Configuración y cliente de Cloudinary.

// Autor: María José Girón, 23559
// Última modificación: 23/08/2025

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const Usuario = require('../models/Usuario');
const cloudinary = require('../services/cloudinary');
const { formatProfile } = require('../helpers/formatters/profileFormatter');

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

            //datos filtrados
            const formatted = formatProfile(usuario)
            res.json(formatted)

            //res.json(usuario);
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

router.post('/me/upload-pfp',
    authenticateToken,
    async (req, res) => {
        try {
            if (!req.files || !req.files.file) {
                return res.status(400).json({ error: 'No hay foto adjuntada.' });
            }

            const archivo = req.files.file;
            const usuarioId = req.user.id;
            const usuario = await Usuario.query().findById(usuarioId);

            // El public_id correcto incluye la carpeta
            const publicId = `usuarios/perfil/usuario_${usuarioId}`;

            // Borrar la foto anterior si existe
            if (usuario.foto_public_id) {
                try {
                    await cloudinary.uploader.destroy(usuario.foto_public_id);
                } catch (err) {
                    console.warn("No se pudo borrar la foto anterior:", err.message);
                }
            }

            // Subir nueva foto
            const result = await cloudinary.uploader.upload(archivo.tempFilePath, {
                folder: 'usuarios/perfil',
                public_id: `usuario_${usuarioId}`,
                overwrite: true
            });

            // Guardar nueva URL en BD
            const usuarioActualizado = await Usuario.query()
                .patchAndFetchById(usuarioId, {
                    foto_perfil: result.secure_url,
                    foto_public_id: result.public_id
                })
                .select('id', 'nombre', 'apellidos', 'email', 'foto_perfil');

            res.json({
                message: 'Foto de perfil actualizada con éxito.',
                usuario: usuarioActualizado
            });

        } catch (error) {
            console.error('Ocurrió algo inesperado al subir la foto de perfil:', error);
            res.status(500).json({ error: 'Error al subir foto de perfil' });
        }
    }
);

router.get('/me/foto-perfil',
    authenticateToken,
    async (req, res) => {
        try {
            const usuarioId = req.user.id;

            let usuario = await Usuario.query()
                .findById(usuarioId)
                .select('id', 'nombre', 'apellidos', 'email', 'status', 'fechanacimiento', 'foto_perfil', 'foto_public_id');

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            try {
                // Buscar en Cloudinary si existe
                const resource = await cloudinary.api.resource(`usuarios/perfil/usuario_${usuarioId}`, {
                    type: 'upload'
                });

                if (resource && resource.secure_url) {
                    const updates = {};

                    if (usuario.foto_perfil !== resource.secure_url) {
                        updates.foto_perfil = resource.secure_url;
                    }
                    if (usuario.foto_public_id !== resource.public_id) {
                        updates.foto_public_id = resource.public_id;
                    }

                    if (Object.keys(updates).length > 0) {
                        usuario = await Usuario.query().patchAndFetchById(usuarioId, updates);
                    }
                }
            } catch (errorC) {
                console.warn(`No se encontró imagen en cloudinary para usuario_${usuarioId}`, errorC.message);
            }

            const { foto_perfil } = usuario;
            res.json({ foto_perfil });

        } catch (err) {
            console.error('Error al obtener la foto de perfil:', err);
            res.status(500).json({ error: 'Error al obtener la foto de perfil' });
        }
    }
);

module.exports = router;

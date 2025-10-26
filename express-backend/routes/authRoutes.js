const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const mailService = require('../services/mailService');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

// POST /auth/register - Registrar nuevo usuario (solo admin)
router.post('/register', 
    authenticateToken,
    authorizeRole([1]),
    async (req, res) => {
    const {
        nombre, apellidos, rol_id, email, local,
        contrasena, fechaNacimiento, proveedor_id
    } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const token = mailService.generateToken();

        console.log('Datos del nuevo usuario (sin guardar en DB):', {
            nombre,
            apellidos,
            rol_id,
            email,
            local,
            hashedPassword,
            token,
            fechaNacimiento
        });

        const newUserData = {
            nombre,
            apellidos,
            rol_id,
            email,
            contrasena: hashedPassword,
            fechaNacimiento,
            status: 'inactivo',
            token
        };

        if (rol_id !== 3) {
            if (!local) {
                return res.status(400).json({
                    error: 'Falta información adicional de local.'
                });
            }
            newUserData.id_local = local;
        }

        const newUser = await Usuario.query().insert(newUserData);

        if (rol_id === 3) {
            if (!proveedor_id) {
                return res.status(400).json({
                    error: 'Falta información adicional para Visitador Médico: proveedor_id requerido.'
                });
            }

            await Usuario.knex().insert({
                usuario_id: newUser.id,
                proveedor_id
            }).into('visitadores_medicos');
        }

        await mailService.sendVerificationEmail(email, token);

        res.status(200).json({
            message: 'Correo de verificación enviado.',
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ error: 'Error al procesar el registro' });
    }
});

// POST /auth/register-visitador - Registrar visitador médico
router.post('/register-visitador', async (req, res) => {
    const {
        nombre,
        apellido,
        fechaNacimiento,
        password,
        email,
        proveedor
    } = req.body;

    try {
        console.log('Datos recibidos del frontend:', {
            nombre,
            apellido,
            fechaNacimiento,
            password,
            email,
            proveedor
        });

        // Buscar proveedor por nombre (puedes ajustar esto si decides usar ID directamente)
        const proveedorEncontrado = await Usuario.knex()('proveedores')
            .where('nombre', proveedor)
            .first();

        console.log('Proveedor encontrado:', proveedorEncontrado);

        if (!proveedorEncontrado) {
            return res.status(400).json({ error: 'Proveedor no encontrado' });
        }
        
        if (!fechaNacimiento || isNaN(new Date(fechaNacimiento).getTime())) {
            return res.status(400).json({ error: 'Fecha de nacimiento inválida o faltante' });
        }

        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento);
        if (!isValidDate) {
            return res.status(400).json({ error: 'Formato de fecha inválido. Se requiere YYYY-MM-DD.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = mailService.generateToken();

        const newUserData = {
            nombre,
            apellidos: apellido,
            rol_id: 3,
            email,
            contrasena: hashedPassword,
            fechanacimiento: fechaNacimiento,
            status: 'inactivo',
            token
        };

        console.log("Usuario visitador médico: ", newUserData);

        const newUser = await Usuario.query().insert(newUserData);

        await Usuario.knex().insert({
            usuario_id: newUser.id,
            proveedor_id: proveedorEncontrado.id
        }).into('visitadores_medicos');

        console.log('Enviando correo de verificación a:', email);
        await mailService.sendVerificationEmail(email, token);

        res.status(200).json({
            message: 'Registro exitoso. Revisa tu correo para verificar la cuenta.'
        });
    } catch (error) {
        console.error('Error al registrar visitador médico:', error);
        res.status(500).json({ error: 'Error al registrar visitador médico' });
    }
});

// GET /auth/verify - Verificar correo
router.get('/verify', async (req, res) => {
    const { token, email } = req.query;

    if (!token || !email) {
        return res.status(400).json({ error: 'Token o correo no proporcionado.' });
    }

    try {
        const usuario = await Usuario.query().findOne({ 
            email,
            token
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Token inválido o expirado.' });
        }

        await Usuario.query()
        .patch({ 
            verificado: true, 
            token: null, 
            status: 'activo' // Cambiar a activo después de verificación
        })
        .where('id', usuario.id);

        res.status(200).json({
        message: 'Usuario verificado correctamente.',
        });
    } catch (err) {
        console.error('Error al verificar usuario:', err);
        res.status(500).json({ error: 'Error al verificar el usuario.' });
    }
});  

// POST /auth/request-password-reset - Solicitar reset de contraseña
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    try {
        const usuario = await Usuario.query().findOne({ email });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const token = mailService.generateToken();

        await Usuario.query().patch({ token }).where({ id: usuario.id });

        await mailService.sendChangePassEmail(email, token);
    
        res.status(200).json({ message: 'Correo para cambio de contraseña enviado.' });
    } catch (err) {
        console.error('Error en request-password-reset:', err);
        res.status(500).json({ error: 'Error al solicitar cambio de contraseña' });
    }
});

// GET /auth/verify-reset - Verificar token de reset
router.get('/verify-reset', async (req, res) => {
    const { token, email } = req.query;
    
    if (!token || !email) {
        return res.status(400).json({ error: 'Token o correo no proporcionado.' });
    }
    
    try {
        const usuario = await Usuario.query().findOne({ token, email });
    
        if (!usuario) {
            return res.status(404).json({ error: 'Token inválido o expirado.' });
        }
    
        res.status(200).json({ message: 'Token válido. Procede con cambio de contraseña.' });
    } catch (err) {
        console.error('Error al verificar token de reseteo:', err);
        res.status(500).json({ error: 'Error interno al verificar el token.' });
    }
});

// POST /auth/reset-password - Resetear contraseña
router.post('/reset-password', async (req, res) => {
    const { token, email, nuevaContrasena } = req.body;
    
    if (!token || !email || !nuevaContrasena) {
        return res.status(400).json({ error: 'Datos incompletos.' });
    }

    try {
        const usuario = await Usuario.query().findOne({ token, email });
    
        if (!usuario) {
            return res.status(404).json({ error: 'Token o email inválidos.' });
        }
    
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    
        await Usuario.query()
            .patch({
                contrasena: hashedPassword,
                token: null
            })
            .where({ id: usuario.id });
    
            res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        console.error('Error al resetear contraseña:', err);
        res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
});

// POST /auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
    const { email, contrasena: password } = req.body;

    try {
        const usuario = await Usuario.query().findOne({ email });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(password, usuario.contrasena);

        if (!match) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        if (!usuario.verificado) {
            return res.status(403).json({ error: 'Correo no verificado' });
        }

        const token = jwt.sign({
            id: usuario.id,
            email: usuario.email,
            rol_id: usuario.rol_id,
            local_id: usuario.id_local
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        let redirectUrl;

        switch (usuario.rol_id) {
            case 1:
                redirectUrl = '/admin/inicio';
                break;
            case 2:
                redirectUrl = '/dependienta/inicio';
                break;
            case 3:
                redirectUrl = '/visitador/inicio';
                break;
            case 4:
                redirectUrl = '/contador/inicio';
                break;
            default:
                redirectUrl = '/';
        }

        res.status(200).json({ token, redirectUrl });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// POST /auth/change-password - Cambiar contraseña (requiere autenticación)
router.post('/change-password', 
    authenticateToken,
    async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Contraseña actual y nueva contraseña son requeridas.' 
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ 
                error: 'La nueva contraseña no puede ser igual a la actual.' 
            });
        }

        try {
            const usuario = await Usuario.query().findById(userId);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.contrasena);
            
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta.' });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await Usuario.query()
                .patch({
                    contrasena: hashedNewPassword,
                })
                .where({ id: userId });

            await mailService.sendPasswordChangedEmail(usuario.email);

            res.status(200).json({ 
                message: 'Contraseña cambiada exitosamente. Se ha enviado una notificación a tu correo.' 
            });

        } catch (err) {
            console.error('Error al cambiar contraseña:', err);
            res.status(500).json({ error: 'Error interno al cambiar la contraseña.' });
        }
    }
);

module.exports = router;

// Nombre del archivo: mailService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. generateToken: Genera un token aleatorio de verificación.
// 2. sendVerificationEmail: Envía un correo electrónico de verificación al usuario con un enlace único para confirmar su dirección de correo electrónico.
// 3. sendChangePassEmail: Envía un correo al usuario con un enlace para restablecer su contraseña.
// 4. router.post('/register'): Ruta que maneja la solicitud de registro de un usuario. Genera un token aleatorio para verificación por correo, hashea la contraseña y guarda al usuario con estado "inactivo" y verificado en falso. Requiere autenticación por token y rol de administradora.
// 5. router.post('/login'): Ruta que maneja el inicio de sesión del usuario. Valida las credenciales y devuelve un token JWT que debe enviarse en futuras solicitudes protegidas.
// 6. router.get('/verify'): Ruta que verifica el token de registro enviado por correo. Activa y verifica la cuenta del usuario si el token es válido.
// 7. router.post('/request-password-reset'): Ruta que recibe el email del usuario y genera un token para cambio de contraseña. Luego, envía un correo con un enlace para restablecerla.
// 8. router.get('/verify-reset'): Ruta que valida el token de reseteo de contraseña antes de permitir el cambio.
// 9. router.post('/reset-password'): Ruta que actualiza la contraseña del usuario si el token es válido. También elimina el token después del uso.
// 10. router.post('/change-password'): Ruta para cambiar contraseña con autenticación JWT


// Archivos relacionados:
// - .env: Contiene las credenciales necesarias para la configuración del servicio de correo (Gmail o MailTrap) y la clave secreta para JWT.
// - Dockerfile: Contiene la configuración necesaria para construir la imagen de Docker para el servicio de backend.
// - docker-compose.yml: Configuración de Docker para la infraestructura del servicio de backend y la base de datos PostgreSQL.


// Autores:
// - María José Girón Isidro, 23559
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 21/04/2025

const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Genera un token aleatorio de 32 caracteres hexadecimales
function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

async function sendVerificationEmail(to, token) {
    const link = `${process.env.URL}/auth/verify?token=${token}&email=${encodeURIComponent(to)}`;

    const mailOptions = {
        from: 'econofarmafarmacias@gmail.com',
        to,
        subject: 'Verifica tu correo',
        html: `
            <strong><p>Haz clic aquí para verificar tu correo:</p></strong><br>
            <a href="${link}">${link}</a>
        `
    };

    await transporter.sendMail(mailOptions);
}

async function sendChangePassEmail(to, token) {
    const link = `${process.env.URL}/auth/verify-reset?token=${token}&email=${encodeURIComponent(to)}`;

    const mailOptions = {
        from: 'econofarmafarmacias@gmail.com',
        to,
        subject: 'Cambio de contraseña',
        html: `
            <strong><p>Haz clic aquí para cambiar tu contraseña:</p></strong><br>
            <a href="${link}">${link}</a>
        `
    };

    await transporter.sendMail(mailOptions);
}

const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');

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
        const token = generateToken();

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

        await sendVerificationEmail(email, token);

        res.status(200).json({
            message: 'Correo de verificación enviado.',
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ error: 'Error al procesar el registro' });
    }
});

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
        const token = generateToken();

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
        await sendVerificationEmail(email, token);

        res.status(200).json({
            message: 'Registro exitoso. Revisa tu correo para verificar la cuenta.'
        });
    } catch (error) {
        console.error('Error al registrar visitador médico:', error);
        res.status(500).json({ error: 'Error al registrar visitador médico' });
    }
});

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
            verificado: true, token: null, status: 'inactivo' }) // Limpia token
        .where('id', usuario.id);

        res.status(200).json({
        message: 'Usuario verificado correctamente.',
        });
    } catch (err) {
        console.error('Error al verificar usuario:', err);
        res.status(500).json({ error: 'Error al verificar el usuario.' });
    }
});  

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

        const token = generateToken();

        await Usuario.query().patch({ token }).where({ id: usuario.id });

        await sendChangePassEmail(email, token);
    
        res.status(200).json({ message: 'Correo para cambio de contraseña enviado.' });
    } catch (err) {
        console.error('Error en request-password-reset:', err);
        res.status(500).json({ error: 'Error al solicitar cambio de contraseña' });
    }
});

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
            local_id: usuario.id_local // Asegúrate de incluir el local_id
        }, process.env.JWT_SECRET, { expiresIn: '1hbuen' });

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

async function sendPasswordChangedEmail(to) {
    const mailOptions = {
        from: 'econofarmafarmacias@gmail.com',
        to,
        subject: 'Contraseña actualizada',
        html: `
            <strong><p>Se ha cambiado tu contraseña exitosamente.</p></strong>
            <p>Si no realizaste este cambio, por favor contacta al administrador inmediatamente.</p>
            <br>
            <p>Fecha y hora: ${new Date().toLocaleString()}</p>
        `
    };

    await transporter.sendMail(mailOptions);
}

router.post('/change-password', 
    authenticateToken,  // Middleware que verifica el token JWT
    async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // Extraído del token JWT

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
            // Buscar el usuario por ID
            const usuario = await Usuario.query().findById(userId);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            // Verificar que la contraseña actual sea correcta
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.contrasena);
            
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta.' });
            }

            // Hashear la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña en la base de datos
            await Usuario.query()
                .patch({
                    contrasena: hashedNewPassword,
                })
                .where({ id: userId });

            // Enviar correo de notificación
            try {
                await sendPasswordChangedEmail(usuario.email);
            } catch (mailError) {
                console.error('Error enviando correo de cambio de contraseña:', mailError);
                // Puedes opcionalmente enviar un mensaje de advertencia al frontend
                return res.status(200).json({ 
                    message: 'Contraseña cambiada exitosamente, pero no se pudo enviar la notificación por correo.'
                });
            }

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

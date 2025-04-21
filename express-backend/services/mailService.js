// Nombre del archivo: mailService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. generateToken: Genera un token aleatorio de verificación.
// 2. sendVerificationEmail: Envía un correo electrónico de verificación al usuario con un enlace único para confirmar su dirección de correo electrónico.
// 3. sendChangePassEmail: Envía un correo al usuario con un enlace para restablecer su contraseña.
// 4. router.post('/register'): Ruta que maneja la solicitud de registro de un usuario. Genera un token aleatorio, hashea la contraseña y envía un correo de verificación, guardando el usuario en la base de datos con estado "inactivo".
// 5. router.get('/verify'): Ruta que verifica el token de registro enviado por correo. Activa y verifica la cuenta del usuario si el token es válido.
// 6. router.post('/request-password-reset'): Ruta que recibe el email del usuario y genera un token para cambio de contraseña. Luego, envía un correo con un enlace para restablecerla.
// 7. router.get('/verify-reset'): Ruta que valida el token de reseteo de contraseña antes de permitir el cambio.
// 8. router.post('/reset-password'): Ruta que actualiza la contraseña del usuario si el token es válido. También elimina el token después del uso.

// Archivos relacionados:
// - .env: Contiene las credenciales necesarias para la configuración del servicio de correo (Gmail o MailTrap).
// - Dockerfile: Contiene la configuración necesaria para construir la imagen de Docker para el servicio de backend.
// - docker-compose.yml: Configuración de Docker para la infraestructura del servicio de backend y la base de datos PostgreSQL.

// Autores:
// - María José Girón Isidro, 23559
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 21/04/2025

const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');

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
    const link = `http://localhost:3000/auth/verify?token=${token}&email=${encodeURIComponent(to)}`;

    const mailOptions = {
        from: 'econofarmaverify@gmail.com',
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
    const link = `http://localhost:3000/auth/verify-reset?token=${token}&email=${encodeURIComponent(to)}`;

    const mailOptions = {
        from: 'econofarmaverify@gmail.com',
        to,
        subject: 'Cambio de contraseña',
        html: `
            <strong><p>Haz clic aquí para cambiar tu contraseña:</p></strong><br>
            <a href="${link}">${link}</a>
        `
    };

    await transporter.sendMail(mailOptions);
}

router.post('/register', async (req, res) => {
    const {
        nombre, apellidos, rol_id, email, local,
        contrasena, fechaNacimiento
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

        const newUser = await Usuario.query().insert({
            nombre,
            apellidos,
            rol_id,
            email,
            id_local: local,
            contrasena: hashedPassword,
            fechanacimiento: fechaNacimiento,
            status: 'inactivo',
            token,
            verificado: false
        });

        await sendVerificationEmail(email, token);

        res.status(200).json({
            message: 'Correo de verificación enviado.',
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ error: 'Error al procesar el registro' });
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
            verificado: true, token: null, status: 'activo' }) // Limpia token
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

module.exports = router;

// Nombre del archivo: mailService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. generateToken: Genera un token aleatorio de verificación.
// 2. sendVerificationEmail: Envia un correo electrónico de verificación al usuario con un enlace único para confirmar su dirección de correo electrónico.
// 3. router.post('/register'): Ruta que maneja la solicitud de registro de un usuario. Genera un token aleatorio, hashea la contraseña y envía un correo de verificación, sin guardar aún en la base de datos.

// Archivos relacionados:
// - .env: Contiene las credenciales necesarias para la configuración del servicio de correo (MailTrap).
// - Dockerfile: Contiene la configuración necesaria para construir la imagen de Docker para el servicio de backend.
// - docker-compose.yml: Configuración de Docker para la infraestructura del servicio de backend y la base de datos PostgreSQL.

// Autores:
// - María José Girón Isidro, 23559
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 16/04/2025

const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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
    const link = `http://localhost:3000/auth/verify?token=${token}`;

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

        await sendVerificationEmail(email, token);

        res.status(200).json({
            message: 'Correo de verificación enviado.',
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ error: 'Error al procesar el registro' });
    }
});

router.get('/auth/verify', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token no proporcionado.' });
    }

    // Simulación
    console.log('Token recibido para verificación:', token);

    // Renato aquí para ver si el token esta en la base de datos pero aún no lo agregamos. 
    //Pero aquí debería cambiarse en la base de datos lo que modifique de verificado = true

    res.status(200).json({
        message: 'Token recibido correctamente.',
    });
});


module.exports = router;

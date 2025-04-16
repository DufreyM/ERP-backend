// Nombre del archivo: mailService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. generateToken: Retorna un número fijo como token en vez de generar un token aleatorio.
// 2. sendVerificationEmail: Envia un correo electrónico de verificación al usuario con un enlace único para confirmar su dirección de correo electrónico.
// 3. router.post('/register'): Ruta que maneja la solicitud de registro de un usuario. Utiliza un número fijo como token y llama a la función sendVerificationEmail para enviar el correo de verificación.

// Archivos relacionados:
// - .env: Contiene las credenciales necesarias para la configuración del servicio de correo (MailTrap).
// - Dockerfile: Contiene la configuración necesaria para construir la imagen de Docker para el servicio de backend.
// - docker-compose.yml: Configuración de Docker para la infraestructura del servicio de backend y la base de datos PostgreSQL.

// Autores:
// - María José Girón Isidro, 23559
// -

// Última modificación: 15/04/2025


const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

function generateToken() {
    return '1234567890';
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
    const { email } = req.body;
    const token = generateToken();

    try {
        await sendVerificationEmail(email, token);
        res.json({ message: 'Correo de verificación enviado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

module.exports = router;

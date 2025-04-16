const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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
    return crypto.randomBytes(32).toString('hex');
}

async function sendVerificationEmail(to, token) {
    const link = `http://localhost:3000/auth/verify?token=${token}`;

    const mailOptions = {
        from: 'econofarmaverify@gmail.com',
        to,
        subject: 'Verifica tu correo',
        html: `<p>Haz clic aquí para verificar tu correo:</p><a href="${link}">${link}</a>`
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

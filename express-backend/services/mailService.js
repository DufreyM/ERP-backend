const nodemailer = require('nodemailer');
const crypto = require('crypto');

require('dotenv').config();

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
    const link = `http://localhost:3000/auth/verify-reset?token=${token}&email=${encodeURIComponent(to)}`;

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

// Exportar solo las funciones de correo
module.exports = {
    generateToken,
    sendVerificationEmail,
    sendChangePassEmail,
    sendPasswordChangedEmail
};

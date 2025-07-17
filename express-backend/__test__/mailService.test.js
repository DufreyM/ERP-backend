// 1. Mock de nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

// 2. Mock de Usuario 
jest.mock('../models/Usuario');
const Usuario = require('../models/Usuario');

// 3. Mock de middlewares de autenticación y autorización
jest.mock('../middlewares/authMiddleware', () => (req, res, next) => next());
jest.mock('../middlewares/authorizeRole', () => () => (req, res, next) => next());

// 4. Configurar app express con el router
const express = require('express');
const request = require('supertest');
const router = require('../services/mailService');

const app = express();
app.use(express.json());
app.use('/auth', router);

describe('POST /auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpia mocks antes de cada test
  });

  it('debería registrar usuario y enviar correo de verificación', async () => {
    // Simulación del modelo de usuario
    Usuario.query.mockReturnValue({
      insert: jest.fn().mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        email: 'juan@correo.com',
        verificado: false,
        token: 'fakeToken'
      })
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        nombre: 'Juan',
        apellidos: 'Pérez',
        rol_id: 1,
        email: 'juan@correo.com',
        local: 1,
        contrasena: '123456',
        fechaNacimiento: '1990-01-01'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Correo de verificación enviado.');
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});

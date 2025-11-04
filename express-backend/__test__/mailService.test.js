// 1. Mock de nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

// 2. Mock de Usuario 
jest.mock('../models/Usuario');
const Usuario = require('../models/Usuario');

// 3. Mock de middlewares de autenticación y autorización
jest.mock('../middlewares/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, rol_id: 1 };
  next();
});
jest.mock('../middlewares/authorizeRole', () => () => (req, res, next) => next());

// 4. Mock de bcrypt
jest.mock('bcryptjs');
const bcrypt = require('bcryptjs');

// 5. Importar el servicio de correo
const mailService = require('../services/mailService');

// 6. Configurar app express con el router
const express = require('express');
const request = require('supertest');
const router = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Mail Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('debería generar un token de 32 caracteres hexadecimales', () => {
      const token = mailService.generateToken();
      
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('debería generar tokens diferentes en cada llamada', () => {
      const token1 = mailService.generateToken();
      const token2 = mailService.generateToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('sendVerificationEmail', () => {
    it('debería enviar correo de verificación correctamente', async () => {
      const email = 'test@example.com';
      const token = 'testToken123';

      await mailService.sendVerificationEmail(email, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const callArgs = sendMailMock.mock.calls[0][0];
      
      expect(callArgs.from).toBe('econofarmafarmacias@gmail.com');
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toBe('Verifica tu correo');
      expect(callArgs.html).toContain('/auth/verify');
    });

    it('debería manejar errores al enviar correo de verificación', async () => {
      const email = 'test@example.com';
      const token = 'testToken123';
      const errorMessage = 'Error de envío';
      
      sendMailMock.mockRejectedValueOnce(new Error(errorMessage));

      await expect(mailService.sendVerificationEmail(email, token))
        .rejects.toThrow(errorMessage);
    });
  });

  describe('sendChangePassEmail', () => {
    it('debería enviar correo de cambio de contraseña correctamente', async () => {
      const email = 'test@example.com';
      const token = 'resetToken123';

      await mailService.sendChangePassEmail(email, token);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const callArgs = sendMailMock.mock.calls[0][0];
      
      expect(callArgs.from).toBe('econofarmafarmacias@gmail.com');
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toBe('Cambio de contraseña');
      expect(callArgs.html).toContain('/auth/verify-reset');
    });

    it('debería manejar errores al enviar correo de cambio de contraseña', async () => {
      const email = 'test@example.com';
      const token = 'resetToken123';
      const errorMessage = 'Error de envío';
      
      sendMailMock.mockRejectedValueOnce(new Error(errorMessage));

      await expect(mailService.sendChangePassEmail(email, token))
        .rejects.toThrow(errorMessage);
    });
  });

  describe('sendPasswordChangedEmail', () => {
    it('debería enviar correo de notificación de cambio de contraseña', async () => {
      const email = 'test@example.com';

      await mailService.sendPasswordChangedEmail(email);

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const callArgs = sendMailMock.mock.calls[0][0];
      
      expect(callArgs.from).toBe('econofarmafarmacias@gmail.com');
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toBe('Contraseña actualizada');
      expect(callArgs.html).toContain('exitosa');
    });

    it('debería manejar errores al enviar correo de notificación', async () => {
      const email = 'test@example.com';
      const errorMessage = 'Error de envío';
      
      sendMailMock.mockRejectedValueOnce(new Error(errorMessage));

      await expect(mailService.sendPasswordChangedEmail(email))
        .rejects.toThrow(errorMessage);
    });
  });
});

describe('POST /auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería registrar usuario y enviar correo de verificación', async () => {
    // Mock para Usuario.query()
    const mockInsert = jest.fn().mockResolvedValue({
      id: 1,
      nombre: 'Juan',
      email: 'juan@correo.com',
      verificado: false,
      token: 'fakeToken'
    });

    Usuario.query = jest.fn().mockReturnValue({
      insert: mockInsert
    });

    // Mock para Usuario.knex() - versión corregida
    const mockKnexInsert = jest.fn().mockResolvedValue([1]);
    const mockKnexTable = jest.fn().mockReturnValue({
      insert: mockKnexInsert
    });
    
    Usuario.knex = jest.fn(() => mockKnexTable);

    // Mock de bcrypt.hash
    bcrypt.hash.mockResolvedValue('hashedPassword');

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

  it('debería manejar error al enviar correo de verificación', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      id: 1,
      nombre: 'Juan',
      email: 'juan@correo.com',
      verificado: false,
      token: 'fakeToken'
    });

    Usuario.query = jest.fn().mockReturnValue({
      insert: mockInsert
    });

    const mockKnexInsert = jest.fn().mockResolvedValue([1]);
    const mockKnexTable = jest.fn().mockReturnValue({
      insert: mockKnexInsert
    });
    
    Usuario.knex = jest.fn(() => mockKnexTable);

    bcrypt.hash.mockResolvedValue('hashedPassword');

    // Simular error en el envío de correo
    sendMailMock.mockRejectedValueOnce(new Error('Error de envío'));

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

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al procesar el registro');
  });
});

describe('POST /auth/register-visitador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería registrar visitador médico y enviar correo de verificación', async () => {
    // Mock de la base de datos para proveedores
    const mockProveedor = { id: 1, nombre: 'Proveedor Test' };
    
    // Mock para el insert().into() de visitadores_medicos
    const mockInsertChain = {
      into: jest.fn().mockResolvedValue([1])
    };

    // Mock de la función que retorna knex
    // Esta función se llama dos veces:
    // 1. Usuario.knex()('proveedores') - para buscar el proveedor
    // 2. Usuario.knex().insert(...).into(...) - para insertar visitador
    const mockKnexInstance = {
      // Para cuando se llama como función: knex('proveedores')
      call: jest.fn((thisArg, tableName) => {
        if (tableName === 'proveedores') {
          return {
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockProveedor)
          };
        }
      }),
      // Para cuando se llama .insert()
      insert: jest.fn().mockReturnValue(mockInsertChain)
    };

    // Crear una función que actúe como knex
    const mockKnexFunction = function(tableName) {
      if (tableName === 'proveedores') {
        return {
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockProveedor)
        };
      }
      return this;
    };

    // Agregar el método insert a la función
    mockKnexFunction.insert = jest.fn().mockReturnValue(mockInsertChain);

    // Configurar Usuario.knex para retornar la función mock
    Usuario.knex = jest.fn(() => mockKnexFunction);

    // Mock para Usuario.query()
    const mockInsert = jest.fn().mockResolvedValue({
      id: 1,
      nombre: 'Visitador',
      apellidos: 'Test',
      email: 'visitador@test.com',
      verificado: false,
      token: 'fakeToken'
    });

    Usuario.query = jest.fn().mockReturnValue({
      insert: mockInsert
    });

    bcrypt.hash.mockResolvedValue('hashedPassword');

    const res = await request(app)
      .post('/auth/register-visitador')
      .send({
        nombre: 'Visitador',
        apellido: 'Test',
        fechaNacimiento: '1990-01-01',
        password: '123456',
        email: 'visitador@test.com',
        proveedor: 'Proveedor Test'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Registro exitoso. Revisa tu correo para verificar la cuenta.');
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });

  it('debería manejar proveedor no encontrado', async () => {
    // Mock de la cadena de Knex que retorna null (proveedor no encontrado)
    const mockKnexChain = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null)
    };

    const mockKnexFunction = jest.fn(() => mockKnexChain);
    Usuario.knex = jest.fn(() => mockKnexFunction);

    const res = await request(app)
      .post('/auth/register-visitador')
      .send({
        nombre: 'Visitador',
        apellido: 'Test',
        fechaNacimiento: '1990-01-01',
        password: '123456',
        email: 'visitador@test.com',
        proveedor: 'Proveedor Inexistente'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Proveedor no encontrado');
  });
});

describe('POST /auth/request-password-reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería enviar correo de reset de contraseña', async () => {
    const mockUsuario = {
      id: 1,
      email: 'test@example.com'
    };

    // Mock completo para Usuario.query()
    const mockFindOne = jest.fn().mockResolvedValue(mockUsuario);
    const mockPatch = jest.fn().mockResolvedValue(1);

    Usuario.query = jest.fn().mockReturnValue({
      findOne: mockFindOne,
      patch: jest.fn().mockReturnValue({
        where: mockPatch
      })
    });

    const res = await request(app)
      .post('/auth/request-password-reset')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Correo para cambio de contraseña enviado.');
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });

  it('debería manejar usuario no encontrado', async () => {
    Usuario.query = jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null)
    });

    const res = await request(app)
      .post('/auth/request-password-reset')
      .send({ email: 'nonexistent@example.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Usuario no encontrado');
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});

describe('POST /auth/change-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería cambiar contraseña y enviar correo de notificación', async () => {
    const mockUsuario = {
      id: 1,
      email: 'test@example.com',
      contrasena: '$2a$10$hashedPassword'
    };

    // Mock de bcrypt
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$2a$10$newHashedPassword');

    // Mock completo para Usuario.query()
    const mockFindById = jest.fn().mockResolvedValue(mockUsuario);
    const mockPatch = jest.fn().mockResolvedValue(1);

    Usuario.query = jest.fn().mockReturnValue({
      findById: mockFindById,
      patch: jest.fn().mockReturnValue({
        where: mockPatch
      })
    });

    const res = await request(app)
      .post('/auth/change-password')
      .set('Authorization', 'Bearer fakeToken')
      .send({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Contraseña cambiada exitosamente. Se ha enviado una notificación a tu correo.');
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});

describe('GET /auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería verificar correo exitosamente', async () => {
    const mockUsuario = {
      id: 1,
      email: 'test@example.com',
      token: 'validToken'
    };

    // Mock completo para Usuario.query()
    const mockFindOne = jest.fn().mockResolvedValue(mockUsuario);
    const mockPatch = jest.fn().mockResolvedValue(1);

    Usuario.query = jest.fn().mockReturnValue({
      findOne: mockFindOne,
      patch: jest.fn().mockReturnValue({
        where: mockPatch
      })
    });

    const res = await request(app)
      .get('/auth/verify')
      .query({
        token: 'validToken',
        email: 'test@example.com'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Usuario verificado correctamente.');
  });

  it('debería manejar token inválido', async () => {
    Usuario.query = jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null)
    });

    const res = await request(app)
      .get('/auth/verify')
      .query({
        token: 'invalidToken',
        email: 'test@example.com'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Token inválido o expirado.');
  });
});

// Tests para escenarios de error del servicio de correo
describe('Mail Service Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería funcionar incluso sin variables de entorno específicas', async () => {
    // El servicio debería funcionar con la configuración actual
    await expect(mailService.sendVerificationEmail('test@example.com', 'token'))
      .resolves.not.toThrow();

    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});

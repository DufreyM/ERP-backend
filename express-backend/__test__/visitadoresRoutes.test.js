const request = require('supertest');
const express = require('express');
const fileUpload = require('express-fileupload');
const visitadoresRouter = require('../routes/visitadoresRoutes');
const VisitadorMedico = require('../models/VisitadorMedico');
const Usuario = require('../models/Usuario');

// Mock de modelos
jest.mock('../models/VisitadorMedico');
jest.mock('../models/Usuario');

// Mock de middlewares de autenticación
jest.mock('../middlewares/authMiddleware', () => (req, res, next) => {
  // Simular un usuario autenticado con los permisos necesarios
  req.user = {
    id: 1,
    email: 'test@example.com',
    rol_id: 1,
    permisos: [
      'ver_visitadores_medicos',
      'crear_visitador_medico',
      'editar_visitador_medico',
      'subir_archivo_productos'
    ]
  };
  next();
});

jest.mock('../middlewares/checkPermission', () => {
  return (permission) => (req, res, next) => {
    // Simular que el usuario tiene todos los permisos necesarios
    if (req.user && req.user.permisos && req.user.permisos.includes(permission)) {
      return next();
    }
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
  };
});

// Configurar app de prueba
const app = express();
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use('/visitadores', visitadoresRouter);

describe('Visitadores Médicos API', () => {
  beforeEach(() => {
    // Configurar mocks básicos para cada test
    VisitadorMedico.query.mockImplementation(() => ({
      withGraphFetched: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      insertGraph: jest.fn().mockReturnThis(),
      patchAndFetchById: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      whereExists: jest.fn().mockReturnThis()
    }));

    Usuario.query.mockImplementation(() => ({
      patch: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis()
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /visitadores debe retornar todos los visitadores', async () => {
    VisitadorMedico.query.mockReturnValue({
      withGraphFetched: jest.fn().mockResolvedValue([{ id: 1 }])
    });

    const res = await request(app).get('/visitadores');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  test('GET /visitadores/:id retorna un visitador por ID', async () => {
    VisitadorMedico.query.mockReturnValue({
      findById: jest.fn().mockReturnValue({
        withGraphFetched: jest.fn().mockResolvedValue({ id: 1 })
      })
    });

    const res = await request(app).get('/visitadores/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1 });
  });

  test('POST /visitadores crea un nuevo visitador', async () => {
    const body = { usuario_id: 2, proveedor_id: 1 };

    VisitadorMedico.query.mockReturnValue({
      insertGraph: jest.fn().mockResolvedValue({ id: 1, ...body })
    });

    const res = await request(app).post('/visitadores').send(body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 1, ...body });
  });

test('PUT /visitadores/:id actualiza un visitador', async () => {
  const body = {
    proveedor_id: 2,
    usuario: {
      nombre: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@example.com',
      fechanacimiento: '1990-01-01',
      rol_id: 3,
      status: 'activo',
      contrasena: 'unchanged'
    },
    telefonos: [
      { id: 1, numero: '12345678', tipo: 'fijo' },
      { numero: '87654321', tipo: 'movil' }
    ]
  };

  // Mock para encontrar el visitador existente
  VisitadorMedico.query.mockReturnValueOnce({
    findById: jest.fn().mockReturnValue({
      withGraphFetched: jest.fn().mockResolvedValue({
        id: 1,
        usuario_id: 2,
        proveedor_id: 1,
        usuario: {
          id: 2,
          nombre: 'Juan',
          apellidos: 'Pérez',
          email: 'juan@example.com',
          fechanacimiento: '1990-01-01',
          rol_id: 3,
          status: 'activo'
        },
        telefonos: [
          { id: 1, numero: '12345678', tipo: 'fijo' }
        ]
      })
    })
  });

  // Mock para la actualización del usuario
  Usuario.query.mockReturnValueOnce({
    patch: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(1)
  });

  // Mock para la actualización del visitador
  VisitadorMedico.query.mockReturnValueOnce({
    patch: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(1)
  });

  // Mock para los teléfonos (necesitas mockear el modelo Telefono)
  jest.mock('../models/Telefono');
  const Telefono = require('../models/Telefono');
  Telefono.query = jest.fn().mockReturnValue({
    patch: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ id: 2 })
  });

  // Mock para devolver el visitador actualizado
  VisitadorMedico.query.mockReturnValueOnce({
    findById: jest.fn().mockReturnValue({
      withGraphFetched: jest.fn().mockResolvedValue({
        id: 1,
        proveedor_id: 2,
        usuario: {
          id: 2,
          nombre: 'Juan',
          apellidos: 'Pérez',
          email: 'juan@example.com',
          fechanacimiento: '1990-01-01',
          rol_id: 3,
          status: 'activo'
        },
        telefonos: [
          { id: 1, numero: '12345678', tipo: 'fijo' },
          { id: 2, numero: '87654321', tipo: 'movil' }
        ]
      })
    })
  });

  const res = await request(app).put('/visitadores/1').send(body);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('ok', true);
  expect(res.body).toHaveProperty('message', 'Visitador actualizado correctamente');
  expect(res.body.visitador).toHaveProperty('id', 1);
  expect(res.body.visitador).toHaveProperty('proveedor_id', 2);
});

  test('PATCH /visitadores/:id/deactivate debe desactivar el usuario', async () => {
    // Mock para encontrar el visitador
    VisitadorMedico.query.mockReturnValueOnce({
      findById: jest.fn().mockReturnValue({
        withGraphFetched: jest.fn().mockResolvedValue({ 
          id: 1, 
          usuario_id: 2,
          usuario: { id: 2, status: 'activo' }
        })
      })
    });

    // Mock para la actualización del usuario
    Usuario.query.mockReturnValue({
      patch: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(1)
    });

    const res = await request(app).patch('/visitadores/1/deactivate');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Visitador desactivado' });
  });

  test('PATCH /visitadores/:id/activate debe activar el usuario', async () => {
    // Mock para encontrar el visitador
    VisitadorMedico.query.mockReturnValueOnce({
      findById: jest.fn().mockReturnValue({
        withGraphFetched: jest.fn().mockResolvedValue({ 
          id: 1, 
          usuario_id: 2,
          usuario: { id: 2, status: 'inactivo' }
        })
      })
    });

    // Mock para la actualización del usuario
    Usuario.query.mockReturnValue({
      patch: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(1)
    });

    const res = await request(app).patch('/visitadores/1/activate');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Visitador activado' });
  });
});

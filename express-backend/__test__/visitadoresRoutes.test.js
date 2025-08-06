const request = require('supertest');
const express = require('express');
const fileUpload = require('express-fileupload');
const visitadoresRouter = require('../routes/visitadoresRoutes');
const VisitadorMedico = require('../models/VisitadorMedico');
const Usuario = require('../models/Usuario');

// Mock de modelos
jest.mock('../models/VisitadorMedico');
jest.mock('../models/Usuario');

// Configurar app de prueba
const app = express();
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use('/visitadores', visitadoresRouter);

describe('Visitadores Médicos API', () => {
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
    const body = { proveedor_id: 2 };

    VisitadorMedico.query.mockReturnValue({
      patchAndFetchById: jest.fn().mockResolvedValue({ id: 1, ...body })
    });

    const res = await request(app).put('/visitadores/1').send(body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1, ...body });
  });

  test('PATCH /visitadores/:id/deactivate debe desactivar el usuario', async () => {
    VisitadorMedico.query.mockReturnValue({
      findById: jest.fn().mockReturnValue({
        withGraphFetched: jest.fn().mockResolvedValue({ usuario_id: 2 })
      })
    });

    Usuario.query.mockReturnValue({
      patch: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(1)
    });

    const res = await request(app).patch('/visitadores/1/deactivate');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Visitador desactivado' });
  });

  test('PATCH /visitadores/:id/activate debe activar el usuario', async () => {
    VisitadorMedico.query.mockReturnValue({
      findById: jest.fn().mockReturnValue({
        withGraphFetched: jest.fn().mockResolvedValue({ usuario_id: 2 })
      })
    });

    Usuario.query.mockReturnValue({
      patch: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(1)
    });

    const res = await request(app).patch('/visitadores/1/activate');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Visitador activado' });
  });
});

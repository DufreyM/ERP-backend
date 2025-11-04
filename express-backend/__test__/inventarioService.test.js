const request = require('supertest');
const express = require('express');
const inventarioRouter = require('../services/inventarioServices1'); 
const Inventario = require('../models/Inventario');

// Mocks y configuración de prueba
jest.mock('../models/Inventario');

jest.mock('../middlewares/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 1, username: 'testuser' }; // Mock user object
    next();
  };
});

const app = express();
app.use(express.json());
app.use('/inventario', inventarioRouter);

describe('Inventario Service API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /inventario - debe retornar todos los registros', async () => {
    const mockData = [{ id: 1, nombre: 'Producto A' }];
    Inventario.query.mockReturnValue({
      withGraphFetched: jest.fn().mockResolvedValue(mockData),
    });

    const res = await request(app).get('/inventario');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /inventario/:id - debe retornar un registro por ID', async () => {
    const mockItem = { id: 1, nombre: 'Producto A' };
    Inventario.query.mockReturnValue({
      findById: jest.fn().mockReturnValue({
        withGraphFetched: jest.fn().mockResolvedValue(mockItem),
      }),
    });

    const res = await request(app).get('/inventario/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockItem);
  });

  test('POST /inventario - debe crear un nuevo registro', async () => {
    const newItem = { nombre: 'Producto B' };
    const mockCreated = { id: 2, ...newItem };
    Inventario.query.mockReturnValue({
      insert: jest.fn().mockResolvedValue(mockCreated),
    });

    const res = await request(app).post('/inventario').send(newItem);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockCreated);
  });

  test('PUT /inventario/:id - debe actualizar un registro existente', async () => {
    const updateData = { nombre: 'Producto A Modificado' };
    const mockUpdated = { id: 1, ...updateData };
    Inventario.query.mockReturnValue({
      patchAndFetchById: jest.fn().mockResolvedValue(mockUpdated),
    });

    const res = await request(app).put('/inventario/1').send(updateData);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockUpdated);
  });

  test('DELETE /inventario/:id - debe eliminar un registro', async () => {
    Inventario.query.mockReturnValue({
      deleteById: jest.fn().mockResolvedValue(1), // 1 fila eliminada
    });

    const res = await request(app).delete('/inventario/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Registro eliminado correctamente');
  });

});

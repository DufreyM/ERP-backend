const request = require('supertest');
const express = require('express');

// ⚠️ Mock del modelo y servicios
jest.mock('../models/Producto', () => ({
  query: jest.fn()
}));

jest.mock('../services/productoService', () => ({
  obtenerProductosConStock: jest.fn(),
  buscarProductosConStock: jest.fn()
}));

const Producto = require('../models/Producto');
const { obtenerProductosConStock, buscarProductosConStock } = require('../services/productoService');
const router = require('../routes/productoRoutes');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/producto', router);
  return app;
};

describe('Rutas /producto', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  describe('GET /producto/con-stock', () => {
    test('devuelve productos con stock (200)', async () => {
      const fake = [{ id: 1, nombre: 'P1' }];
      obtenerProductosConStock.mockResolvedValueOnce(fake);

      const res = await request(app).get('/producto/con-stock?local_id=5');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fake);
      expect(obtenerProductosConStock).toHaveBeenCalledWith('5');
    });

    test('error interno (500)', async () => {
      obtenerProductosConStock.mockRejectedValueOnce(new Error('fallo service'));

      const res = await request(app).get('/producto/con-stock');

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        error: 'Error al obtener productos',
        details: expect.any(String)
      });
    });
  });

  describe('GET /producto', () => {
    test('devuelve todos los productos', async () => {
      const fake = [{ id: 1 }, { id: 2 }];
      Producto.query.mockResolvedValueOnce(fake);

      const res = await request(app).get('/producto');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fake);
      expect(Producto.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /producto/search', () => {
    test('devuelve productos por búsqueda', async () => {
      const fake = [{ id: 3, nombre: 'Buscado' }];
      buscarProductosConStock.mockResolvedValueOnce(fake);

      const res = await request(app).get('/producto/search?query=x&local_id=2');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fake);
      expect(buscarProductosConStock).toHaveBeenCalledWith({ query: 'x', local_id: '2' });
    });

    test('error en búsqueda (500)', async () => {
      buscarProductosConStock.mockRejectedValueOnce(new Error('boom'));

      const res = await request(app).get('/producto/search?query=x');

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        error: 'Error al buscar productos',
        details: expect.any(String)
      });
    });
  });

  describe('GET /producto/:id', () => {
    test('devuelve producto por id', async () => {
      const fake = { id: 10, nombre: 'Prod' };
      const findById = jest.fn().mockResolvedValueOnce(fake);
      Producto.query.mockReturnValueOnce({ findById });

      const res = await request(app).get('/producto/10');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fake);
      expect(findById).toHaveBeenCalledWith('10');
    });

    test('no encontrado (404)', async () => {
      const findById = jest.fn().mockResolvedValueOnce(undefined);
      Producto.query.mockReturnValueOnce({ findById });

      const res = await request(app).get('/producto/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Producto no encontrado' });
    });
  });

  describe('POST /producto', () => {
    test('crea producto (201)', async () => {
      const body = { nombre: 'Nuevo' };
      const created = { id: 5, ...body };
      const insert = jest.fn().mockResolvedValueOnce(created);
      Producto.query.mockReturnValueOnce({ insert });

      const res = await request(app).post('/producto').send(body);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(insert).toHaveBeenCalledWith(body);
    });

    test('error al crear (400)', async () => {
      const insert = jest.fn().mockRejectedValueOnce(new Error('validación'));
      Producto.query.mockReturnValueOnce({ insert });

      const res = await request(app).post('/producto').send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        error: 'Error al crear producto',
        details: expect.any(String)
      });
    });
  });

  describe('PUT /producto/:id', () => {
    test('actualiza producto (200)', async () => {
      const body = { nombre: 'Editado' };
      const updated = { id: 7, ...body };
      const patchAndFetchById = jest.fn().mockResolvedValueOnce(updated);
      Producto.query.mockReturnValueOnce({ patchAndFetchById });

      const res = await request(app).put('/producto/7').send(body);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
      expect(patchAndFetchById).toHaveBeenCalledWith('7', body);
    });

    test('error al actualizar (400)', async () => {
      const patchAndFetchById = jest.fn().mockRejectedValueOnce(new Error('bad data'));
      Producto.query.mockReturnValueOnce({ patchAndFetchById });

      const res = await request(app).put('/producto/1').send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        error: 'Error al actualizar producto',
        details: expect.any(String)
      });
    });
  });

  describe('DELETE /producto/:id', () => {
    test('elimina producto (200)', async () => {
      const deleteById = jest.fn().mockResolvedValueOnce(1);
      Producto.query.mockReturnValueOnce({ deleteById });

      const res = await request(app).delete('/producto/9');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ mensaje: 'Producto eliminado' });
      expect(deleteById).toHaveBeenCalledWith('9');
    });

    test('error al eliminar (400)', async () => {
      const deleteById = jest.fn().mockRejectedValueOnce(new Error('DB down'));
      Producto.query.mockReturnValueOnce({ deleteById });

      const res = await request(app).delete('/producto/1');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        error: 'Error al eliminar producto',
        details: expect.any(String)
      });
    });
  });
});

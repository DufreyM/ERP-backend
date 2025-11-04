// __test__/ventaService.test.js
const request = require('supertest');
const express = require('express');

jest.setTimeout(15000);

jest.mock('../middlewares/authMiddleware');
jest.mock('../models/Venta');
jest.mock('../models/VentaDetalle');
jest.mock('../models/Inventario');
jest.mock('../models/Lote');
jest.mock('../helpers/resolveCliente');
jest.mock('../helpers/formatters/ventasFormatter');

const authenticateToken = require('../middlewares/authMiddleware');
const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const { resolveClienteId } = require('../helpers/resolveCliente');
const { formatVentas } = require('../helpers/formatters/ventasFormatter');

describe('Rutas /ventas', () => {
  let app;
  const routerPath = '../services/ventaService';
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    authenticateToken.mockImplementation((req, res, next) => next());

    Venta.query = jest.fn();
    Venta.startTransaction = jest.fn();
    VentaDetalle.query = jest.fn();
    Inventario.query = jest.fn();
    Lote.query = jest.fn();
    resolveClienteId.mockResolvedValue(1);
    formatVentas.mockImplementation(v => ({ id: v.id }));

    const router = require(routerPath);

    app = express();
    app.use(express.json());
    app.use('/ventas', router);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /ventas devuelve lista formateada cuando no se envía local_id', async () => {
    const ventasDb = [{ id: 11 }, { id: 22 }];
    Venta.query.mockReturnValue({
      withGraphFetched: jest.fn().mockResolvedValue(ventasDb)
    });

    const res = await request(app).get('/ventas').expect(200);
    expect(Venta.query).toHaveBeenCalled();
    expect(formatVentas).toHaveBeenCalledTimes(2);
    expect(res.body).toEqual([{ id: 11 }, { id: 22 }].map(formatVentas));
  });

  test('GET /ventas?local_id=1 filtra por inventario y devuelve ventas relacionadas', async () => {
    Inventario.query.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      whereNotNull: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockResolvedValue([{ venta_id: 99 }])
    });

    Venta.query.mockReturnValue({
      whereIn: jest.fn().mockReturnThis(),
      withGraphFetched: jest.fn().mockResolvedValue([{ id: 99 }])
    });

    const res = await request(app).get('/ventas?local_id=1').expect(200);
    expect(Inventario.query).toHaveBeenCalled();
    expect(Venta.query).toHaveBeenCalled();
    expect(res.body).toEqual([{ id: 99 }].map(formatVentas));
  });

  test('GET /ventas/:id devuelve 404 si no existe', async () => {
    Venta.query.mockReturnValue({
      findById: jest.fn().mockReturnThis(),
      withGraphFetched: jest.fn().mockResolvedValue(null)
    });

    const res = await request(app).get('/ventas/123').expect(404);
    expect(res.body).toEqual({ error: 'Venta no encontrada' });
  });

  test('GET /ventas/:id devuelve la venta si existe', async () => {
    const ventaObj = { id: 55, cliente: {}, encargado: {}, detalles: [] };
    Venta.query.mockReturnValue({
      findById: jest.fn().mockReturnThis(),
      withGraphFetched: jest.fn().mockResolvedValue(ventaObj)
    });

    const res = await request(app).get('/ventas/55').expect(200);
    expect(res.body).toEqual(ventaObj);
  });

  test('POST /ventas devuelve 401 si usuario no autenticado', async () => {
    const payload = { tipo_pago: 'efectivo', detalles: [{ producto_id: 1, cantidad: 1 }] };
    const res = await request(app).post('/ventas').send(payload).expect(401);
    expect(res.body).toEqual({ error: 'Usuario no autenticado' });
  });

  test('POST /ventas devuelve 400 si usuario no tiene local asignado', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 2, rol_id: 2, local_id: null };
      next();
    });

    const payload = { tipo_pago: 'efectivo', detalles: [{ producto_id: 1, cantidad: 1 }] };
    const res = await request(app).post('/ventas').send(payload).expect(400);
    expect(res.body).toEqual({ error: 'El usuario no tiene local asignado (local_id)' });
  });

  test('POST /ventas devuelve 400 si no hay detalles o es array vacío', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 3, rol_id: 2, local_id: 7 };
      next();
    });

    let res = await request(app).post('/ventas').send({ tipo_pago: 'efectivo' }).expect(400);
    expect(res.body).toEqual({ error: 'La venta requiere al menos un detalle' });

    res = await request(app).post('/ventas').send({ tipo_pago: 'efectivo', detalles: [] }).expect(400);
    expect(res.body).toEqual({ error: 'La venta requiere al menos un detalle' });
  });

  test('POST /ventas devuelve 400 si tipo_pago inválido', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 3, rol_id: 2, local_id: 7 };
      next();
    });

    const payload = { tipo_pago: 'bitcoin', detalles: [{ producto_id: 1, cantidad: 1 }] };
    const res = await request(app).post('/ventas').send(payload).expect(400);
    expect(res.body).toEqual({ error: 'tipo_pago inválido' });
  });

  test('POST /ventas falla con stock insuficiente y devuelve 500 con detalles', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 4, rol_id: 2, local_id: 10 };
      next();
    });

    const trx = jest.fn((table) => {
      if (table === 'productos') {
        return {
          select: () => ({ where: () => ({ first: () => Promise.resolve({ precioventa: '10', preciocosto: '5', nombre: 'ProdX', codigo: 'P1' }) }) })
        };
      }
      return { where: () => ({ first: () => Promise.resolve(null) }) };
    });
    trx.commit = jest.fn().mockResolvedValue();
    trx.rollback = jest.fn().mockResolvedValue();

    Venta.startTransaction.mockResolvedValue(trx);
    resolveClienteId.mockResolvedValue(8);

    Lote.query.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([{ id: 777 }])
    }));

    Inventario.query.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      sum: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ stock: 0 })
    }));

    Venta.query.mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue({ id: 500 })
    }));

    const payload = {
      cliente: { nombre: 'Cliente X' },
      tipo_pago: 'efectivo',
      detalles: [{ producto_id: 123, cantidad: 2 }]
    };

    const res = await request(app).post('/ventas').send(payload).expect(500);
    expect(res.body.error).toBe('Error al registrar la venta');
    expect(res.body.detalles).toMatch(/Stock insuficiente/);
    expect(trx.rollback).toHaveBeenCalled();
  });

  test('POST /ventas flujo feliz: distribuye entre lotes, inserta detalles e inventario y commitea', async () => {
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 5, rol_id: 2, local_id: 9 };
      next();
    });

    const trx = jest.fn((table) => {
      if (table === 'productos') {
        return {
          select: () => ({
            where: () => ({
              first: () => Promise.resolve({ precioventa: '20', preciocosto: '12', nombre: 'ProductoOK', codigo: 'P_OK' })
            })
          })
        };
      }
      if (table === 'inventario') {
        return {
          where: () => ({
            whereNotNull: () => ({
              orderBy: () => ({
                first: () => Promise.resolve({ precio_venta: '25', precio_costo: '14' })
              })
            })
          })
        };
      }
      return { where: () => ({ first: () => Promise.resolve(null) }) };
    });
    trx.commit = jest.fn().mockResolvedValue();
    trx.rollback = jest.fn().mockResolvedValue();

    Venta.startTransaction.mockResolvedValue(trx);
    resolveClienteId.mockResolvedValue(7);

    const ventaModel = {
      insert: jest.fn().mockResolvedValue({ id: 900 }),
      findById: jest.fn().mockReturnThis(),
      patch: jest.fn().mockResolvedValue()
    };
    Venta.query.mockReturnValue(ventaModel);

    Lote.query.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
    }));

    Inventario.query.mockImplementation(() => {
      const impl = {
        where: jest.fn().mockReturnThis(),
        sum: jest.fn().mockReturnThis(),
        first: jest.fn()
      };
      const calls = [{ stock: 2 }, { stock: 3 }];
      impl.first.mockImplementation(() => Promise.resolve(calls.shift() || { stock: 0 }));
      impl.insert = jest.fn().mockResolvedValue();
      return impl;
    });

    VentaDetalle.query.mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue()
    }));

    const payload = {
      cliente: { nombre: 'Cliente OK', nit: '1234567-8' },
      tipo_pago: 'efectivo',
      detalles: [{ producto_id: 555, cantidad: 4 }]
    };

    const res = await request(app).post('/ventas').send(payload).expect(201);
    expect(res.body).toEqual({ mensaje: 'Venta registrada correctamente', venta_id: 900 });

    expect(Venta.startTransaction).toHaveBeenCalled();
    expect(Venta.query).toHaveBeenCalled();
    expect(VentaDetalle.query).toHaveBeenCalled();
    expect(Inventario.query).toHaveBeenCalled();
    expect(ventaModel.findById).toHaveBeenCalledWith(900);
    expect(trx.commit).toHaveBeenCalled();
  });

});

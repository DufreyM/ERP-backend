// __test__/transferenciasService.test.js
const request = require('supertest');
const express = require('express');

jest.setTimeout(10000);

describe('Rutas /transferencias', () => {
  let app;
  const routerPath = '../services/transferenciasService'; // ajusta si tu ruta es distinta

  beforeEach(() => {
    // Forzamos módulo limpio y mockeamos TODO antes de requerir la ruta
    jest.resetModules();
    jest.clearAllMocks();

    jest.mock('../middlewares/authMiddleware');
    jest.mock('../models/Venta');
    jest.mock('../models/VentaDetalle');
    jest.mock('../models/Inventario');
    jest.mock('../models/Lote');

    // Requerimos los mocks para configurar implementaciones
    const authenticateToken = require('../middlewares/authMiddleware');
    const Venta = require('../models/Venta');
    const VentaDetalle = require('../models/VentaDetalle');
    const Inventario = require('../models/Inventario');
    const Lote = require('../models/Lote');

    // Default middleware: simplemente next() (tests que necesitan user lo sobreescriben)
    authenticateToken.mockImplementation((req, res, next) => next());

    // Por defecto, dejamos las funciones query como jest.fn para que cada test las sobreescriba
    Venta.startTransaction = jest.fn();
    Venta.query = jest.fn();
    VentaDetalle.query = jest.fn();
    Inventario.query = jest.fn();
    Lote.query = jest.fn();

    // Requerimos el router despues de preparar los mocks
    const router = require(routerPath);

    app = express();
    app.use(express.json());
    app.use('/transferencias', router);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('POST /transferencias devuelve 400 si locales inválidos o iguales', async () => {
    // origen === destino
    let res = await request(app).post('/transferencias').send({
      origen_local_id: 1,
      destino_local_id: 1,
      productos: [{ producto_id: 10, cantidad: 1 }]
    }).expect(400);
    expect(res.body).toEqual({ error: 'Locales inválidos o iguales' });

    // falta alguno
    res = await request(app).post('/transferencias').send({
      origen_local_id: null,
      destino_local_id: 2,
      productos: [{ producto_id: 10, cantidad: 1 }]
    }).expect(400);
    expect(res.body).toEqual({ error: 'Locales inválidos o iguales' });
  });

  test('POST /transferencias devuelve 400 si no incluye productos', async () => {
    const res1 = await request(app).post('/transferencias').send({
      origen_local_id: 1,
      destino_local_id: 2,
      productos: []
    }).expect(400);
    expect(res1.body).toEqual({ error: 'Debe incluir productos a transferir' });

    const res2 = await request(app).post('/transferencias').send({
      origen_local_id: 1,
      destino_local_id: 2
      // sin productos
    }).expect(400);
    expect(res2.body).toEqual({ error: 'Debe incluir productos a transferir' });
  });

  test('POST /transferencias falla con stock insuficiente y hace rollback', async () => {
    // Preparamos middleware para dar usuario
    const authenticateToken = require('../middlewares/authMiddleware');
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 7, rol_id: 2, local_id: 1 };
      next();
    });

    // Simulamos trx callable
    const trx = jest.fn((table) => {
      // no necesitamos que trx(table) devuelva algo especial para este test
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
        insert: jest.fn().mockResolvedValue()
      };
    });
    trx.commit = jest.fn().mockResolvedValue();
    trx.rollback = jest.fn().mockResolvedValue();

    const Venta = require('../models/Venta');
    Venta.startTransaction.mockResolvedValue(trx);

    // Venta.query(trx).insert será llamado dos veces (ventaOrigen y compraDestino)
    const ventaModel = { insert: jest.fn() };
    ventaModel.insert.mockResolvedValueOnce({ id: 100 }).mockResolvedValueOnce({ id: 200 });
    Venta.query.mockReturnValue(ventaModel);

    const Lote = require('../models/Lote');
    // Lote.query(trx).where(...).orderBy(...) -> retorna un lote con id 50
    Lote.query.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([{ id: 50 }])
    }));

    const Inventario = require('../models/Inventario');
    // Inventario.query(trx).where(...).where(...).sum(...).first() -> stock 0
    Inventario.query.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      sum: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ stock: 0 }),
      insert: jest.fn().mockResolvedValue()
    }));

    const payload = {
      origen_local_id: 1,
      destino_local_id: 2,
      productos: [{ producto_id: 99, cantidad: 3 }]
    };

    const res = await request(app).post('/transferencias').send(payload).expect(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/Stock insuficiente/);
    // trx.rollback debe haberse llamado
    expect(trx.rollback).toHaveBeenCalled();
  });

  test('POST /transferencias flujo feliz: consume lotes y commitea', async () => {
    // Middleware que agrega user
    const authenticateToken = require('../middlewares/authMiddleware');
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 9, rol_id: 2, local_id: 1 };
      next();
    });

    // Creamos trx callable que las queries usan
    const trx = jest.fn((table) => {
      // No necesitamos branch específico por table en este test porque
      // usamos mocks sobre Lote.query / Inventario.query / Venta.query independientes.
      return {
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
        insert: jest.fn().mockResolvedValue()
      };
    });
    trx.commit = jest.fn().mockResolvedValue();
    trx.rollback = jest.fn().mockResolvedValue();

    const Venta = require('../models/Venta');
    Venta.startTransaction.mockResolvedValue(trx);

    // Venta.query(trx).insert -> ventaOrigen.id = 111, compraDestino.id = 222
    const ventaModel = { insert: jest.fn() };
    ventaModel.insert.mockResolvedValueOnce({ id: 111 }).mockResolvedValueOnce({ id: 222 });
    Venta.query.mockReturnValue(ventaModel);

    const Lote = require('../models/Lote');
    // Dos lotes para el producto
    Lote.query.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
    }));

    const Inventario = require('../models/Inventario');
    // Inventario.sum().first() debe devolver stock por lote: primero 2, luego 3
    Inventario.query.mockImplementation(() => {
      const impl = {
        where: jest.fn().mockReturnThis(),
        sum: jest.fn().mockReturnThis(),
        first: jest.fn(),
        insert: jest.fn().mockResolvedValue()
      };
      const stocks = [{ stock: 2 }, { stock: 3 }];
      impl.first.mockImplementation(() => Promise.resolve(stocks.shift() || { stock: 0 }));
      return impl;
    });

    const VentaDetalle = require('../models/VentaDetalle');
    VentaDetalle.query.mockImplementation(() => ({ insert: jest.fn().mockResolvedValue() }));

    const payload = {
      origen_local_id: 1,
      destino_local_id: 2,
      productos: [{ producto_id: 50, cantidad: 4 }] // se consumen 2 del lote1 y 2 del lote2
    };

    const res = await request(app).post('/transferencias').send(payload).expect(201);
    expect(res.body).toEqual({ mensaje: 'Transferencia realizada correctamente' });

    expect(Venta.startTransaction).toHaveBeenCalled();
    expect(ventaModel.insert).toHaveBeenCalledTimes(2); // venta origen y compra destino
    expect(Lote.query).toHaveBeenCalled();
    expect(Inventario.query).toHaveBeenCalled();
    expect(VentaDetalle.query).toHaveBeenCalled();
    expect(trx.commit).toHaveBeenCalled();
  });
});

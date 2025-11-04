// __test__/compraService.test.js
//TARDA MUCHO -- ¿considerar?
const request = require('supertest');
const express = require('express');

jest.setTimeout(10000); // opcional: evita fallos en entornos lentos

describe('Rutas /compras', () => {
  let app;
  const routerPath = '../services/compraService'; // ajusta si tu archivo está en otra ruta

  beforeEach(() => {
    // Limpiamos el registro de módulos para forzar que los require siguientes usen las versiones mockeadas
    jest.resetModules();
    jest.clearAllMocks();

    // Mockeamos TODO lo que importa el router para que no intente abrir conexiones reales
    jest.mock('../middlewares/authMiddleware');
    jest.mock('../models/Compra');
    jest.mock('../models/PagoCompra');
    jest.mock('../models/Inventario');
    jest.mock('../models/Lote');
    jest.mock('../models/Producto');
    jest.mock('../models/Proveedor');
    jest.mock('../services/notificacionesVencimiento'); // si la ruta es distinta ajústala

    // Requerimos los mocks para poder setear implementaciones
    const authenticateToken = require('../middlewares/authMiddleware');
    const Compra = require('../models/Compra');
    const Inventario = require('../models/Inventario');
    const Producto = require('../models/Producto');

    // Implementación por defecto del middleware: añade next() sin usuario (los tests lo sobreescriben cuando lo necesiten)
    authenticateToken.mockImplementation((req, res, next) => next());

    // Parcheamos los métodos que usamos en los tests
    Compra.query = jest.fn();
    Compra.startTransaction = jest.fn(); // por si algún test lo necesita más adelante
    Inventario.query = jest.fn();
    Producto.query = jest.fn();

    // Requerimos el router DESPUÉS de preparar los mocks
    const router = require(routerPath);

    // Creamos la app de express para hacer requests con supertest
    app = express();
    app.use(express.json());
    app.use('/compras', router);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /compras devuelve compras cuando no se envía local_id', async () => {
    const Compra = require('../models/Compra');

    const fakeCompras = [{ id: 1, usuario: {}, proveedor: {}, pagos: [], productos: [] }];

    // Mock: Compra.query().withGraphFetched(...) -> Promise resolve fakeCompras
    Compra.query.mockReturnValue({
      withGraphFetched: jest.fn().mockResolvedValue(fakeCompras)
    });

    const res = await request(app).get('/compras').expect(200);

    expect(Compra.query).toHaveBeenCalled();
    expect(res.body).toEqual(fakeCompras);
  });

  test('GET /compras?local_id=1 filtra por inventario y devuelve compras relacionadas', async () => {
    const Inventario = require('../models/Inventario');
    const Compra = require('../models/Compra');

    // Inventario.query().where(...).whereNotNull(...).distinct(...) -> [{ compra_id: 42 }]
    Inventario.query.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      whereNotNull: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockResolvedValue([{ compra_id: 42 }])
    });

    // Compra.query().whereIn(...).withGraphFetched(...) -> [{ id: 42 }]
    Compra.query.mockReturnValue({
      whereIn: jest.fn().mockReturnThis(),
      withGraphFetched: jest.fn().mockResolvedValue([{ id: 42 }])
    });

    const res = await request(app).get('/compras?local_id=1').expect(200);

    expect(Inventario.query).toHaveBeenCalled();
    expect(Compra.query).toHaveBeenCalled();
    expect(res.body).toEqual([{ id: 42 }]);
  });

  test('POST /compras devuelve 401 si el usuario no está autenticado (req.user absent)', async () => {
    // El middleware por defecto no añade req.user, así que el handler debe devolver 401
    const payload = {
      detalles: [{ producto_id: 1, cantidad: 1, precio_costo: 10, precio_venta: 12, lote: 'L1', fecha_vencimiento: '2026-01-01' }]
    };

    const res = await request(app).post('/compras').send(payload).expect(401);

    expect(res.body).toEqual({ error: 'Usuario no autenticado' });
  });

  test('POST /compras devuelve 400 si el usuario no tiene local asignado (local_id)', async () => {
    const authenticateToken = require('../middlewares/authMiddleware');

    // Middleware que sí agrega req.user pero sin local_id y con rol distinto de 1
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 3, rol_id: 2, local_id: null };
      next();
    });

    const payload = {
      detalles: [{ producto_id: 1, cantidad: 1, precio_costo: 10, precio_venta: 12, lote: 'L1', fecha_vencimiento: '2026-01-01' }]
    };

    const res = await request(app).post('/compras').send(payload).expect(400);

    expect(res.body).toEqual({ error: 'El usuario no tiene local asignado (local_id)' });
  });

  test('POST /compras devuelve 400 si no se envían detalles o es array vacío', async () => {
    const authenticateToken = require('../middlewares/authMiddleware');

    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 4, rol_id: 2, local_id: 10 }; // usuario con local
      next();
    });

    // Sin detalles
    let res = await request(app).post('/compras').send({}).expect(400);
    expect(res.body).toEqual({ error: 'La compra requiere al menos un detalle' });

    // Detalles vacío
    res = await request(app).post('/compras').send({ detalles: [] }).expect(400);
    expect(res.body).toEqual({ error: 'La compra requiere al menos un detalle' });
  });
});

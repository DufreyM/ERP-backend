const request = require('supertest');
const express = require('express');

// Mock models y helpers
jest.mock('../models/Venta', () => ({
    query: jest.fn(),
    startTransaction: jest.fn()
    }));
    jest.mock('../models/VentaDetalle', () => ({ query: jest.fn() }));
    jest.mock('../models/Inventario', () => ({ query: jest.fn() }));
    jest.mock('../models/Lote', () => ({ query: jest.fn() }));
    jest.mock('../helpers/resolveCliente', () => ({
    resolveClienteId: jest.fn()
    }));
    jest.mock('../middlewares/authMiddleware', () =>
    jest.fn((req, res, next) => {
        // Fake auth
        req.user = { id: 1, local_id: 99 };
        next();
    })
);

const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const { resolveClienteId } = require('../helpers/resolveCliente');
const router = require('../services/ventaService');

const makeApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/ventas', router);
    return app;
};

describe('Rutas /ventas', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = makeApp();
    });

    describe('POST /ventas', () => {
        test('401 si no hay userId', async () => {
        // Forzamos middleware a poner user = {}
        require('../middlewares/authMiddleware').mockImplementationOnce((req, res, next) => {
            req.user = {};
            next();
        });
        app = makeApp();

        const res = await request(app).post('/ventas').send({});
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Usuario no autenticado');
        });

        test('400 si no hay local_id', async () => {
        require('../middlewares/authMiddleware').mockImplementationOnce((req, res, next) => {
            req.user = { id: 1 };
            next();
        });
        app = makeApp();

        const res = await request(app).post('/ventas').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/local/);
        });

        test('400 si detalles vacíos', async () => {
        const res = await request(app).post('/ventas').send({
            cliente_id: 1,
            tipo_pago: 'efectivo',
            detalles: []
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/requiere al menos un detalle/);
        });

        test('400 si tipo_pago inválido', async () => {
        const res = await request(app).post('/ventas').send({
            cliente_id: 1,
            tipo_pago: 'bitcoin',
            detalles: [{ producto_id: 1, cantidad: 1 }]
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/tipo_pago inválido/);
        });

        test('500 si producto no existe', async () => {
        // Mock transacción
        const commit = jest.fn();
        const rollback = jest.fn();
        Venta.startTransaction.mockResolvedValueOnce({ commit, rollback, table: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ first: jest.fn().mockResolvedValue(null) }) }) }) });

        Venta.query.mockReturnValue({ insert: jest.fn().mockResolvedValue({ id: 1 }) });

        resolveClienteId.mockResolvedValue(123);

        const res = await request(app).post('/ventas').send({
            cliente_id: 1,
            tipo_pago: 'efectivo',
            detalles: [{ producto_id: 'P1', cantidad: 2 }]
        });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error al registrar la venta');
        expect(rollback).toHaveBeenCalled();
        });

        test('201 caso feliz', async () => {
        // Fake trx
        const commit = jest.fn();
        const rollback = jest.fn();
        const fakeTrx = {
            commit,
            rollback,
            table: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                first: jest.fn().mockResolvedValue({ precioventa: 10, preciocosto: 5, nombre: 'Prod' })
                })
            })
            })
        };
        Venta.startTransaction.mockResolvedValue(fakeTrx);

        Venta.query.mockReturnValue({
            insert: jest.fn().mockResolvedValue({ id: 55 }),
            findById: jest.fn().mockReturnValue({ patch: jest.fn().mockResolvedValue() })
        });

        Lote.query.mockReturnValue({
            where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([{ id: 1, fecha_vencimiento: new Date(Date.now() + 86400000) }])
            })
        });

        Inventario.query.mockReturnValue({
            where: jest.fn().mockReturnValue({
            sum: jest.fn().mockReturnValue({
                first: jest.fn().mockResolvedValue({ stock: 5 })
            })
            }),
            insert: jest.fn().mockResolvedValue()
        });

        VentaDetalle.query.mockReturnValue({ insert: jest.fn().mockResolvedValue() });

        resolveClienteId.mockResolvedValue(321);

        const res = await request(app).post('/ventas').send({
            cliente_id: 1,
            tipo_pago: 'efectivo',
            detalles: [{ producto_id: 'P1', cantidad: 2 }]
        });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ mensaje: 'Venta registrada correctamente', venta_id: 55 });
        expect(commit).toHaveBeenCalled();
        });
    });

    describe('GET /ventas/:id', () => {
        test('200 devuelve venta', async () => {
        const withGraphFetched = jest.fn().mockResolvedValue({ id: 1 });
        const findById = jest.fn().mockReturnValue({ withGraphFetched });
        Venta.query.mockReturnValue({ findById });

        const res = await request(app).get('/ventas/1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1 });
        });

        test('404 no encontrada', async () => {
        const withGraphFetched = jest.fn().mockResolvedValue(undefined);
        const findById = jest.fn().mockReturnValue({ withGraphFetched });
        Venta.query.mockReturnValue({ findById });

        const res = await request(app).get('/ventas/999');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/no encontrada/);
        });

        test('500 error inesperado', async () => {
        const withGraphFetched = jest.fn().mockRejectedValue(new Error('DB fail'));
        const findById = jest.fn().mockReturnValue({ withGraphFetched });
        Venta.query.mockReturnValue({ findById });

        const res = await request(app).get('/ventas/1');
        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/Error al obtener la venta/);
        });
    });

    describe('GET /ventas', () => {
        test('200 sin local_id', async () => {
        Venta.query.mockReturnValue({
            withGraphFetched: jest.fn().mockResolvedValue([{ id: 1 }])
        });

        const res = await request(app).get('/ventas');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1 }]);
        });

        test('200 con local_id', async () => {
        Inventario.query.mockReturnValue({
            where: jest.fn().mockReturnValue({
            whereNotNull: jest.fn().mockReturnValue({
                distinct: jest.fn().mockResolvedValue([{ venta_id: 7 }])
            })
            })
        });
        Venta.query.mockReturnValue({
            whereIn: jest.fn().mockReturnValue({
            withGraphFetched: jest.fn().mockResolvedValue([{ id: 7 }])
            })
        });

        const res = await request(app).get('/ventas?local_id=99');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 7 }]);
        });

        test('500 error inesperado', async () => {
        Venta.query.mockImplementation(() => { throw new Error('boom'); });

        const res = await request(app).get('/ventas');
        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/Error al obtener las ventas/);
        });
    });
});

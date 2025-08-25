const request = require('supertest');
const express = require('express');

jest.mock('../models/Inventario', () => ({
    query: jest.fn()
}));
const Inventario = require('../models/Inventario');

const router = require('../services/inventarioServices1');

const makeApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/inventario', router);
    return app;
};

describe('Rutas /inventario', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = makeApp();
    });

    describe('GET /inventario', () => {
        test('devuelve lista (200)', async () => {
        const fakeList = [{ id: 1 }, { id: 2 }];
        const withGraphFetched = jest.fn().mockResolvedValueOnce(fakeList);
        Inventario.query.mockReturnValueOnce({ withGraphFetched });

        const res = await request(app).get('/inventario');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakeList);
        expect(Inventario.query).toHaveBeenCalledTimes(1); // spy simple
        expect(withGraphFetched).toHaveBeenCalledWith('[lote, tipoMovimiento, venta, compra, local, encargado]');
        });

        test('error inesperado (500)', async () => {
        const withGraphFetched = jest.fn().mockRejectedValueOnce(new Error('fallo DB'));
        Inventario.query.mockReturnValueOnce({ withGraphFetched });

        const res = await request(app).get('/inventario');

        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Error al obtener inventario',
            details: expect.any(String)
        });
        });
    });

    describe('GET /inventario/:id', () => {
        test('devuelve item por id (200)', async () => {
        const fakeItem = { id: 123, nombre: 'X' };
        const withGraphFetched = jest.fn().mockResolvedValueOnce(fakeItem);
        const findById = jest.fn().mockReturnValue({ withGraphFetched });
        Inventario.query.mockReturnValueOnce({ findById });

        const res = await request(app).get('/inventario/123');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakeItem);
        expect(findById).toHaveBeenCalledWith('123');
        expect(withGraphFetched).toHaveBeenCalledWith('[lote, tipoMovimiento, venta, compra, local, encargado]');
        });

        test('no encontrado (404)', async () => {
        const withGraphFetched = jest.fn().mockResolvedValueOnce(undefined);
        const findById = jest.fn().mockReturnValue({ withGraphFetched });
        Inventario.query.mockReturnValueOnce({ findById });

        const res = await request(app).get('/inventario/999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Registro no encontrado' });
        });

        test('error inesperado (500)', async () => {
        const withGraphFetched = jest.fn().mockRejectedValueOnce(new Error('boom'));
        const findById = jest.fn().mockReturnValue({ withGraphFetched });
        Inventario.query.mockReturnValueOnce({ findById });

        const res = await request(app).get('/inventario/1');

        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Error al obtener el registro',
            details: expect.any(String)
        });
        });
    });

    describe('POST /inventario', () => {
        test('crea registro (201)', async () => {
        const body = { nombre: 'Nuevo' };
        const created = { id: 10, ...body };
        const insert = jest.fn().mockResolvedValueOnce(created);
        Inventario.query.mockReturnValueOnce({ insert });

        const res = await request(app).post('/inventario').send(body);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(created);
        expect(insert).toHaveBeenCalledWith(body);
        });

        test('error de validación (400)', async () => {
        const insert = jest.fn().mockRejectedValueOnce(new Error('validación'));
        Inventario.query.mockReturnValueOnce({ insert });

        const res = await request(app).post('/inventario').send({});

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Error al crear el registro',
            details: expect.any(String)
        });
        });
    });

    describe('PUT /inventario/:id', () => {
        test('actualiza (200)', async () => {
        const body = { nombre: 'Editado' };
        const updated = { id: 5, ...body };
        const patchAndFetchById = jest.fn().mockResolvedValueOnce(updated);
        Inventario.query.mockReturnValueOnce({ patchAndFetchById });

        const res = await request(app).put('/inventario/5').send(body);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(updated);
        expect(patchAndFetchById).toHaveBeenCalledWith('5', body);
        });

        test('no existe (404)', async () => {
        const patchAndFetchById = jest.fn().mockResolvedValueOnce(undefined);
        Inventario.query.mockReturnValueOnce({ patchAndFetchById });

        const res = await request(app).put('/inventario/404').send({ nombre: 'X' });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Registro no encontrado' });
        });

        test('error de validación o negocio (400)', async () => {
        const patchAndFetchById = jest.fn().mockRejectedValueOnce(new Error('bad data'));
        Inventario.query.mockReturnValueOnce({ patchAndFetchById });

        const res = await request(app).put('/inventario/1').send({});

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Error al actualizar el registro',
            details: expect.any(String)
        });
        });
    });

    describe('DELETE /inventario/:id', () => {
        test('elimina (200)', async () => {
        const deleteById = jest.fn().mockResolvedValueOnce(1);
        Inventario.query.mockReturnValueOnce({ deleteById });

        const res = await request(app).delete('/inventario/9');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ mensaje: 'Registro eliminado correctamente' });
        expect(deleteById).toHaveBeenCalledWith('9');
        });

        test('no encontrado (404)', async () => {
        const deleteById = jest.fn().mockResolvedValueOnce(0);
        Inventario.query.mockReturnValueOnce({ deleteById });

        const res = await request(app).delete('/inventario/999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Registro no encontrado' });
        });

        test('error inesperado (500)', async () => {
        const deleteById = jest.fn().mockRejectedValueOnce(new Error('DB down'));
        Inventario.query.mockReturnValueOnce({ deleteById });

        const res = await request(app).delete('/inventario/1');

        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
            error: 'Error al eliminar el registro',
            details: expect.any(String)
        });
        });
    });
});

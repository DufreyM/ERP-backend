const request = require('supertest');
const express = require('express');

const inventario = require('../models/Inventario');

const inventarioServiceMock = {
    registrarMovimiento: jest.fn()
};

const validarMovimientoMock = jest.fn((req, res, next) => {
    next(); // El middleware "pasa" la petición
});

const app = express();
app.use(express.json());

const inventarioRoutes = express.Router();
inventarioRoutes.post('/', validarMovimientoMock, async (req, res) => {
    try {
        const resultado = await inventarioServiceMock.registrarMovimiento(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(400).json({error: 'Ocurrió algo inesperado, no se pudo registrar movimiento:', details: error.message });
    }
});

app.use('/', inventarioRoutes);

// --- Tests ---

describe('Inventario Router - POST /', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debería registrar un movimiento exitosamente y devolver 201', async () => {
        const movimientoData = { productoId: '123', cantidad: 10, tipo: 'entrada' };
        const servicioResponse = { id: 'mov-abc', ...movimientoData };

        // Configurar mock del servicio para que devuelva un valor específico
        inventarioServiceMock.registrarMovimiento.mockResolvedValue(servicioResponse);

        const response = await request(app)
        .post('/')
        .send(movimientoData);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(servicioResponse);
        expect(inventarioServiceMock.registrarMovimiento).toHaveBeenCalledTimes(1);
        expect(inventarioServiceMock.registrarMovimiento).toHaveBeenCalledWith(movimientoData);
        expect(validarMovimientoMock).toHaveBeenCalledTimes(1);
    });

    test('debería devolver 400 si el servicio falla al registrar movimiento', async () => {
        const movimientoData = { productoId: '456', cantidad: -5, tipo: 'salida' };
        const errorMessage = 'Stock insuficiente';

        // Configuramos el mock del servicio para que lance un error
        inventarioServiceMock.registrarMovimiento.mockRejectedValue(new Error(errorMessage));

        const response = await request(app)
        .post('/')
        .send(movimientoData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
        error: 'Error al registrar movimiento',
        details: errorMessage
        });
        expect(inventarioServiceMock.registrarMovimiento).toHaveBeenCalledTimes(1);
        expect(inventarioServiceMock.registrarMovimiento).toHaveBeenCalledWith(movimientoData);
        expect(validarMovimientoMock).toHaveBeenCalledTimes(1);
    });
});

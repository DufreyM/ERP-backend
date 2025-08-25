const request = require('supertest');
const express = require('express');

const clientesRouter = require('../routes/Clientes');

jest.mock('../middlewares/authMiddleware', () => jest.fn((req, res, next) => next()));

const mockQuery = {
    findOne: jest.fn(),
    insert: jest.fn(),
    onConflict: jest.fn(),
    merge: jest.fn(),
    returning: jest.fn(),
};
jest.mock('../models/Cliente', () => ({
    query: jest.fn(() => mockQuery),
}));

const app = express();
app.use(express.json());
app.use('/clientes', clientesRouter);

describe('API de Clientes (/clientes)', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- Pruebas para GET /clientes?nit=XXXX ---
    describe('GET /clientes', () => {
        it('debería devolver un cliente si el NIT existe', async () => {
        const mockCliente = { id: 1, nit: '12345678', nombre: 'Cliente de Prueba' };
        // Configuramos el mock para que devuelva el cliente cuando se llame a findOne
        mockQuery.findOne.mockResolvedValue(mockCliente);

        const response = await request(app).get('/clientes?nit=12345678');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCliente);
        // Verificamos que se llamó al método correcto del modelo con los parámetros correctos
        expect(mockQuery.findOne).toHaveBeenCalledWith({ nit: '12345678' });
        });

        it('debería devolver un error 404 si el cliente no se encuentra', async () => {
        // Configuramos el mock para que devuelva undefined, simulando que no encontró nada
        mockQuery.findOne.mockResolvedValue(undefined);

        const response = await request(app).get('/clientes?nit=00000000');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'no encontrado' });
        });

        it('debería devolver un error 400 si no se proporciona el NIT', async () => {
        const response = await request(app).get('/clientes');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'nit requerido' });
        // Nos aseguramos de que no se intentó hacer ninguna consulta a la BD
        expect(mockQuery.findOne).not.toHaveBeenCalled();
        });
    });


    // --- Pruebas para POST /clientes ---
    describe('POST /clientes', () => {
        it('debería crear o actualizar un cliente y devolverlo con un estado 201', async () => {
        const datosCliente = { nit: '87654321', nombre: 'Nuevo Cliente', direccion: 'Guatemala' };
        const clienteCreado = { id: 2, ...datosCliente, correo: null };
        
        // Para simular la cadena de métodos (insert(...).onConflict(...).merge(...).returning(...))
        // usamos mockReturnThis() para que cada llamada devuelva el mismo objeto mockeado.
        mockQuery.insert.mockReturnThis();
        mockQuery.onConflict.mockReturnThis();
        mockQuery.merge.mockReturnThis();
        // La última llamada en la cadena es la que resuelve la promesa con el resultado final.
        mockQuery.returning.mockResolvedValue(clienteCreado);

        const response = await request(app).post('/clientes').send(datosCliente);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(clienteCreado);

        // Verificamos que toda la cadena de "upsert" se llamó correctamente
        expect(mockQuery.insert).toHaveBeenCalledWith({ ...datosCliente, correo: null });
        expect(mockQuery.onConflict).toHaveBeenCalledWith('nit');
        expect(mockQuery.merge).toHaveBeenCalled();
        expect(mockQuery.returning).toHaveBeenCalledWith('*');
        });

        it('debería devolver un error 400 si falta el NIT o el nombre', async () => {
        const bodyInvalido = { direccion: 'Algún lugar' }; // Sin nit ni nombre

        const response = await request(app).post('/clientes').send(bodyInvalido);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'nit y nombre requeridos' });
        // Verificamos que no se realizó ninguna operación en la BD
        expect(mockQuery.insert).not.toHaveBeenCalled();
        });
    });
});

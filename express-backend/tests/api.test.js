jest.mock('../services/mailService', () => ({
    ...jest.requireActual('../services/mailService'),
    sendVerificationEmail: jest.fn(() => Promise.resolve()),
}));

const request = require('supertest');
const app = require('../index'); // Asegúrate de exportar `app` desde index.js

describe('Pruebas de la API', () => {
    it('GET / debe responder con 200 y mensaje', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
    });
});

describe('POST /auth/register', () => {
    it('Debería registrar un nuevo usuario', async () => {
        const res = await request(app).post('/auth/register').send({
                nombre: 'Test',
                apellidos: 'Usuario',
                rol_id: 2,
                email: 'marmaajo@gmail.com',
                local: 2,
                contrasena: 'password123',
                fechaNacimiento: '1999-01-01'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
    });
});

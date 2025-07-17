const request = require('supertest');
const express = require('express');
const documentoRouter = require('../services/documentoLocalService'); 
const DocumentoLocal = require('../models/DocumentoLocal');
const path = require('path');

// Mocks y configuración
jest.mock('../models/DocumentoLocal');

const app = express();
app.use(express.json());
app.use('/', documentoRouter); 

describe('Documento Local Service API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

    test('GET / - debe retornar todos los documentos', async () => {
  const mockDocs = [{
    id: 1,
    nombre: 'Doc Prueba',
    archivo: '/uploads/doc1.pdf',
    creacion: '2025-01-01',
    vencimiento: '2026-01-01',
    usuario: { id: 1, nombre: 'Juan', apellidos: 'Pérez', email: 'juan@correo.com', rol_id: 1 },
    local: { id: 1, nombre: 'Sucursal A', direccion: 'Av 1', nit_emisor: '12345678' }
  }];

  DocumentoLocal.query.mockReturnValue({
    modify: jest.fn().mockReturnThis(),
    withGraphFetched: jest.fn().mockReturnThis(),
    modifyGraph: jest.fn().mockReturnThis(),
    then: (cb) => Promise.resolve(cb(mockDocs)) 
  });

  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('nombre', 'Doc Prueba');
});

test('GET /:id - debe retornar un documento por ID', async () => {
  const mockDoc = {
    id: 1,
    nombre: 'Doc 1',
    archivo: '/uploads/doc1.pdf',
    creacion: '2025-01-01',
    vencimiento: '2026-01-01',
    usuario: { id: 1, nombre: 'Juan', apellidos: 'Pérez', email: 'juan@correo.com' },
    local: { id: 1, nombre: 'Sucursal A', direccion: 'Av 1', nit_emisor: '12345678' }
  };

  DocumentoLocal.query.mockReturnValue({
    findById: jest.fn().mockReturnThis(),
    withGraphFetched: jest.fn().mockReturnThis(),
    modifyGraph: jest.fn().mockReturnThis(),
    then: (cb) => Promise.resolve(cb(mockDoc))
  });

  const res = await request(app).get('/1');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('nombre', 'Doc 1');
});


  test('POST / - debe crear un nuevo documento', async () => {
    const nuevoDoc = {
      nombre: 'Nuevo Documento',
      usuario_id: '1',
      local_id: '1'
    };

    const mockResult = {
      id: 10,
      ...nuevoDoc,
      archivo: '/uploads/fake.pdf'
    };

    DocumentoLocal.query.mockReturnValue({
      insert: jest.fn().mockResolvedValue(mockResult)
    });

    const res = await request(app)
      .post('/')
      .field('nombre', nuevoDoc.nombre)
      .field('usuario_id', nuevoDoc.usuario_id)
      .field('local_id', nuevoDoc.local_id)
      .attach('archivo', path.resolve(__dirname, 'mocks/fake.pdf'));

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('nombre', 'Nuevo Documento');
    expect(res.body).toHaveProperty('archivo');
  });

  test('PUT /:id - debe actualizar un documento existente', async () => {
    const updateData = { nombre: 'Doc Actualizado' };
    const mockUpdated = { id: 1, ...updateData };

    DocumentoLocal.query.mockReturnValue({
      patchAndFetchById: jest.fn().mockResolvedValue(mockUpdated)
    });

    const res = await request(app)
      .put('/1')
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nombre', 'Doc Actualizado');
  });

  test('DELETE /:id - debe eliminar un documento', async () => {
    DocumentoLocal.query.mockReturnValue({
      deleteById: jest.fn().mockResolvedValue(1)
    });

    const res = await request(app).delete('/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Documento eliminado correctamente');
  });

  test('DELETE /:id - debe retornar 404 si no encuentra el documento', async () => {
    DocumentoLocal.query.mockReturnValue({
      deleteById: jest.fn().mockResolvedValue(0)
    });

    const res = await request(app).delete('/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Documento no encontrado');
  });

});

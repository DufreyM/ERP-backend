const request = require('supertest');
const express = require('express');
const fileUpload = require('express-fileupload');
const documentoRouter = require('../services/documentoLocalService');
const DocumentoLocal = require('../models/DocumentoLocal');
const cloudinary = require('../services/cloudinary');
const path = require('path');

// Mocks
jest.mock('../models/DocumentoLocal');
jest.mock('../services/cloudinary');
jest.mock('../middlewares/authMiddleware'); // Mock del middleware de auth
jest.mock('../services/notificacionesVencimientoDoc'); // Mock de las notificaciones

const auth = require('../middlewares/authMiddleware');
const { crearNotificacionesDeVencimientoDoc, eliminarNotificacionesDeDocumento } = require('../services/notificacionesVencimientoDoc');

// Mock del middleware de autenticación para simular usuario autenticado
auth.mockImplementation((req, res, next) => {
  req.user = {
    id: 1,
    nombre: 'Usuario',
    apellidos: 'Prueba',
    email: 'usuario@prueba.com',
    rol_id: 1
  };
  next();
});

// Mock de las funciones de notificación
crearNotificacionesDeVencimientoDoc.mockResolvedValue();
eliminarNotificacionesDeDocumento.mockResolvedValue();

const app = express();
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use('/', documentoRouter);

describe('Documento Local Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET / - debe retornar todos los documentos', async () => {
    const mockDocs = [{
      id: 1,
      nombre: 'Doc Prueba',
      archivo: 'https://url.com/doc1.pdf',
      creacion: '2025-01-01',
      vencimiento: '2026-01-01',
      usuario: { id: 1, nombre: 'Juan', apellidos: 'Pérez', email: 'juan@correo.com', rol_id: 1 },
      local: { id: 1, nombre: 'Sucursal A', direccion: 'Av 1', nit_emisor: '12345678' }
    }];

    DocumentoLocal.query.mockReturnValue({
      whereNull: jest.fn().mockReturnThis(),
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
      archivo: 'https://url.com/doc1.pdf',
      creacion: '2025-01-01',
      vencimiento: '2026-01-01',
      usuario: { id: 1, nombre: 'Juan', apellidos: 'Pérez', email: 'juan@correo.com' },
      local: { id: 1, nombre: 'Sucursal A', direccion: 'Av 1', nit_emisor: '12345678' }
    };

    DocumentoLocal.query.mockReturnValue({
      findById: jest.fn().mockReturnThis(),
      whereNull: jest.fn().mockReturnThis(),
      withGraphFetched: jest.fn().mockReturnThis(),
      modifyGraph: jest.fn().mockReturnThis(),
      then: (cb) => Promise.resolve(cb(mockDoc))
    });

    const res = await request(app).get('/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('nombre', 'Doc 1');
  });

  test('POST / - debe crear un nuevo documento con archivo', async () => {
    const nuevoDoc = {
      nombre: 'Nuevo Documento',
      usuario_id: '1',
      local_id: '1',
      vencimiento: '2025-12-31'
    };

    // Simular subida exitosa a Cloudinary
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: 'https://cloudinary.com/fake.pdf'
    });

    const mockResult = {
      id: 10,
      ...nuevoDoc,
      archivo: 'https://cloudinary.com/fake.pdf',
      creacion: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };

    DocumentoLocal.query.mockReturnValue({
      insert: jest.fn().mockResolvedValue(mockResult)
    });

    const res = await request(app)
      .post('/')
      .field('nombre', nuevoDoc.nombre)
      .field('usuario_id', nuevoDoc.usuario_id)
      .field('local_id', nuevoDoc.local_id)
      .field('vencimiento', nuevoDoc.vencimiento)
      .attach('archivo', path.resolve(__dirname, 'mocks/fake.pdf'));

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensaje', 'Documento creado exitosamente');
    expect(res.body.documento).toHaveProperty('nombre', 'Nuevo Documento');
    expect(res.body.documento.archivo).toMatch(/^https:\/\/cloudinary\.com/);
    
    // Verificar que se llamó a la función de notificaciones
    expect(crearNotificacionesDeVencimientoDoc).toHaveBeenCalled();
  });

  test('POST / - debe crear documento sin notificaciones si no hay vencimiento', async () => {
    const nuevoDoc = {
      nombre: 'Documento Sin Vencimiento',
      usuario_id: '1',
      local_id: '1'
      // Sin campo vencimiento
    };

    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: 'https://cloudinary.com/fake.pdf'
    });

    const mockResult = {
      id: 11,
      ...nuevoDoc,
      archivo: 'https://cloudinary.com/fake.pdf',
      creacion: new Date().toISOString(),
      updatedat: new Date().toISOString()
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
    expect(crearNotificacionesDeVencimientoDoc).not.toHaveBeenCalled();
  });

  test('PUT /:id - debe actualizar un documento existente', async () => {
    const updateData = { 
      nombre: 'Doc Actualizado', 
      updatedat: new Date().toISOString() 
    };
    const mockUpdated = { 
      id: 1, 
      ...updateData,
      local_id: 1,
      nombre: 'Doc Actualizado'
    };

    DocumentoLocal.query.mockReturnValue({
      patchAndFetchById: jest.fn().mockResolvedValue(mockUpdated)
    });

    const res = await request(app)
      .put('/1')
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.documento).toHaveProperty('nombre', 'Doc Actualizado');
  });

  test('DELETE /:id - debe eliminar lógicamente un documento', async () => {
    const documentoExistente = {
      id: 1,
      nombre: 'Doc a eliminar',
      local_id: 1
    };

    const eliminado = {
      id: 1,
      deletedat: new Date().toISOString()
    };

    // Mock para encontrar el documento primero
    DocumentoLocal.query.mockReturnValueOnce({
      findById: jest.fn().mockResolvedValue(documentoExistente)
    });

    // Mock para la eliminación lógica
    DocumentoLocal.query.mockReturnValueOnce({
      patchAndFetchById: jest.fn().mockResolvedValue(eliminado)
    });

    const res = await request(app).delete('/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Documento eliminado lógicamente');
    expect(eliminarNotificacionesDeDocumento).toHaveBeenCalledWith('1');
  });

  test('DELETE /:id - debe retornar 404 si no encuentra el documento', async () => {
    // Mock para simular que no encuentra el documento
    DocumentoLocal.query.mockReturnValueOnce({
      findById: jest.fn().mockResolvedValue(null)
    });

    const res = await request(app).delete('/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Documento no encontrado');
    expect(eliminarNotificacionesDeDocumento).not.toHaveBeenCalled();
  });
});

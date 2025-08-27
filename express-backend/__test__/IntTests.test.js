const request = require('supertest');
const express = require('express');

jest.mock('../models/DocumentoLocal', () => ({
  query: jest.fn()
}));
jest.mock('../services/cloudinary', () => ({
  uploader: { upload: jest.fn() }
}));

const DocumentoLocal = require('../models/DocumentoLocal');
const cloudinary = require('../services/cloudinary');
const router = require('../services/documentoLocalService');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/documentos-locales', router);
  return app;
};

describe('Rutas /documentos-locales', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = makeApp();
  });

  // 1) POST /
  test('POST / crea documento con archivo Cloudinary (201)', async () => {
    const body = { nombre: 'nuevo', usuario_id: 1, local_id: 2 };
    const fakeUpload = { secure_url: 'http://cloud/url.jpg' };
    cloudinary.uploader.upload.mockResolvedValueOnce(fakeUpload);

    const created = { id: 10, ...body, archivo: fakeUpload.secure_url };
    const insert = jest.fn().mockResolvedValueOnce(created);
    DocumentoLocal.query.mockReturnValueOnce({ insert });

    // Simulamos que req.files.archivo existe
    const appWithFiles = express();
    appWithFiles.use((req,res,next)=>{ 
      req.files = { archivo: { tempFilePath: '/tmp/fake' } }; 
      next();
    });
    appWithFiles.use(express.json());
    appWithFiles.use('/documentos-locales', router);

    const res = await request(appWithFiles).post('/documentos-locales').send(body);
    expect(res.status).toBe(201);
    expect(res.body.archivo).toBe('http://cloud/url.jpg');
    expect(insert).toHaveBeenCalled();
  });

  // 2) PUT /:id
  test('PUT /:id actualiza documento existente (200)', async () => {
    const body = { nombre: 'editado' };
    const updated = { id: 5, ...body };
    const patchAndFetchById = jest.fn().mockResolvedValueOnce(updated);
    DocumentoLocal.query.mockReturnValueOnce({ patchAndFetchById });

    const res = await request(app).put('/documentos-locales/5').send(body);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
    expect(patchAndFetchById).toHaveBeenCalledWith('5', expect.objectContaining(body));
  });

  // 3) DELETE /:id
  test('DELETE /:id elimina lógicamente documento (200)', async () => {
    const fakeDoc = { id: 7, deletedat: 'fecha' };
    const patchAndFetchById = jest.fn().mockResolvedValueOnce(fakeDoc);
    DocumentoLocal.query.mockReturnValueOnce({ patchAndFetchById });

    const res = await request(app).delete('/documentos-locales/7');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ mensaje: 'Documento eliminado lógicamente' });
    expect(patchAndFetchById).toHaveBeenCalledWith('7', expect.any(Object));
  });
});

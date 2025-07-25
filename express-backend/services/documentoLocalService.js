// Nombre del archivo: documentoLocalService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. router.get('/'): Obtiene todos los documentos locales con sus relaciones (usuario y local).
// 2. router.get('/:id'): Obtiene un solo documento local por ID.
// 3. router.post('/'): Crea un nuevo documento local con los datos del cuerpo de la solicitud.
// 4. router.put('/:id'): Actualiza un documento existente.
// 5. router.delete('/:id'): Elimina un documento local por ID.

// Archivos relacionados:
// - models/DocumentoLocal.js: Define el modelo de datos para los documentos locales.
// - database/knexfile.js: Configuración de base de datos.
// - app.js o index.js: Punto de entrada donde se importa este router.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// Última modificación: 13/07/2025

const express = require('express');
const router = express.Router();
const DocumentoLocal = require('../models/DocumentoLocal');
const path = require('path');
const cloudinary = require('../services/cloudinary');

// Obtener todos los documentos activos
router.get('/', async (req, res) => {
  try {
    const localId = req.query.local_id;

    const docs = await DocumentoLocal
      .query()
      .whereNull('deletedat')
      .modify(query => {
        if (localId) {
          query.where('local_id', localId);
        }
      })
      .withGraphFetched('[usuario, local]')
      .modifyGraph('usuario', builder => {
        builder.select('id', 'rol_id', 'nombre', 'apellidos', 'email');
      })
      .modifyGraph('local', builder => {
        builder.select('id', 'nombre', 'direccion', 'nit_emisor');
      });

    const filtrado = docs.map(doc => ({
      id: doc.id,
      nombre: doc.nombre,
      archivo: doc.archivo,
      creacion: doc.creacion,
      vencimiento: doc.vencimiento,
      updatedat: doc.updatedat,
      deletedat: doc.deletedat,
      usuario: doc.usuario,
      local: doc.local
    }));

    res.json(filtrado);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos', details: err.message });
  }
});

// Obtener un documento por ID (solo si no está eliminado)
router.get('/:id', async (req, res) => {
  try {
    const doc = await DocumentoLocal
      .query()
      .findById(req.params.id)
      .whereNull('deletedat')
      .withGraphFetched('[usuario, local]')
      .modifyGraph('usuario', builder => {
        builder.select('id', 'nombre', 'apellidos', 'email');
      })
      .modifyGraph('local', builder => {
        builder.select('id', 'nombre', 'direccion', 'nit_emisor');
      });

    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    const filtrado = {
      id: doc.id,
      nombre: doc.nombre,
      archivo: doc.archivo,
      creacion: doc.creacion,
      vencimiento: doc.vencimiento,
      updatedat: doc.updatedat,
      deletedat: doc.deletedat,
      usuario: doc.usuario,
      local: doc.local
    };

    res.json(filtrado);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el documento', details: err.message });
  }
});

// Crear nuevo documento (sin multer)
router.post('/', async (req, res) => {
  try {
    let archivoURL = null;

    if (req.files?.archivo) {
      const resultado = await cloudinary.uploader.upload(req.files.archivo.tempFilePath, {
        folder: 'documentos_locales', 
        resource_type: 'auto',
        type: 'upload'
      });
      archivoURL = resultado.secure_url;
    } else if (req.body.archivo) {
      archivoURL = req.body.archivo;
    }

    const nuevo = await DocumentoLocal.query().insert({
      ...req.body,
      usuario_id: parseInt(req.body.usuario_id, 10),
      local_id: parseInt(req.body.local_id, 10),
      archivo: archivoURL,
      creacion: new Date().toISOString(),
      updatedat: new Date().toISOString()
    });

    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el documento', details: err.message });
  }
});


// Actualizar documento
router.put('/:id', async (req, res) => {
  try {
    let archivoURL = req.body.archivo;

    if (req.files?.archivo) {
      const resultado = await cloudinary.uploader.upload(req.files.archivo.tempFilePath, {
        folder: 'documentos_locales', 
        resource_type: 'auto',
        type: 'upload'
      });
      archivoURL = resultado.secure_url;
    }

    const data = {
      ...req.body,
      updatedat: new Date().toISOString()
    };

    if (archivoURL !== undefined) {
      data.archivo = archivoURL;
    }

    const actualizado = await DocumentoLocal.query().patchAndFetchById(req.params.id, data);
    if (!actualizado) return res.status(404).json({ error: 'Documento no encontrado' });

    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el documento', details: err.message });
  }
});


// Eliminar documento (lógicamente)
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await DocumentoLocal.query()
      .patchAndFetchById(req.params.id, {
        deletedat: new Date().toISOString()
      });

    if (!eliminado) return res.status(404).json({ error: 'Documento no encontrado' });

    res.json({ mensaje: 'Documento eliminado lógicamente', documento: eliminado });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el documento', details: err.message });
  }
});

module.exports = router;

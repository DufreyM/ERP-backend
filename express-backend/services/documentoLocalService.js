const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DocumentoLocal = require('../models/DocumentoLocal');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const nombreUnico = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage: storage });

// GET todos los documentos
router.get('/', async (req, res) => {
  try {
    const docs = await DocumentoLocal.query().withGraphFetched('[usuario, local]');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los documentos', details: err.message });
  }
});

// GET documento por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await DocumentoLocal.query().findById(req.params.id).withGraphFetched('[usuario, local]');
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el documento', details: err.message });
  }
});

// POST nuevo documento con archivo
router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    const body = {
      ...req.body,
      archivo: req.file ? `/uploads/${req.file.filename}` : null
    };

    const nuevo = await DocumentoLocal.query().insert(body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el documento', details: err.message });
  }
});

// PUT actualizar documento 
router.put('/:id', upload.single('archivo'), async (req, res) => {
  try {
    const datosActualizados = {
      ...req.body
    };

    if (req.file) {
      datosActualizados.archivo = `/uploads/${req.file.filename}`;
    }

    const actualizado = await DocumentoLocal.query().patchAndFetchById(req.params.id, datosActualizados);
    if (!actualizado) return res.status(404).json({ error: 'Documento no encontrado' });

    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el documento', details: err.message });
  }
});

// DELETE eliminar documento
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await DocumentoLocal.query().deleteById(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Documento no encontrado' });

    res.json({ mensaje: 'Documento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el documento', details: err.message });
  }
});

module.exports = router;

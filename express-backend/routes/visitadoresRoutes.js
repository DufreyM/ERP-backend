const express = require('express');
const router = express.Router();
const VisitadorMedico = require('../models/VisitadorMedico');

// Obtener todos los visitadores médicos
router.get('/', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query().withGraphFetched('[usuario, proveedor]');
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores médicos', details: err.message });
  }
});

// Obtener un visitador médico por ID
router.get('/:id', async (req, res) => {
  try {
    const visitador = await VisitadorMedico.query()
      .findById(req.params.id)
      .withGraphFetched('[usuario, proveedor]');

    if (!visitador) return res.status(404).json({ error: 'Visitador médico no encontrado' });
    res.json(visitador);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitador médico', details: err.message });
  }
});

// Crear un nuevo visitador médico
router.post('/', async (req, res) => {
  try {
    const nuevo = await VisitadorMedico.query().insert(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear visitador médico', details: err.message });
  }
});

// Actualizar un visitador médico por ID
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await VisitadorMedico.query().patchAndFetchById(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Visitador médico no encontrado' });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar visitador médico', details: err.message });
  }
});

// Eliminar un visitador médico por ID
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await VisitadorMedico.query().deleteById(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Visitador médico no encontrado' });
    res.json({ mensaje: 'Visitador médico eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar visitador médico', details: err.message });
  }
});

module.exports = router;

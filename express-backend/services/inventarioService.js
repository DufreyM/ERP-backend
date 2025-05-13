const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');

// Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const inventario = await Inventario.query().withGraphFetched('[lote, tipoMovimiento, venta, compra, local, encargado]');
    res.json(inventario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inventario', details: err.message });
  }
});

// Obtener un registro por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventario.query().findById(req.params.id).withGraphFetched('[lote, tipoMovimiento, venta, compra, local, encargado]');
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el registro', details: err.message });
  }
});

// Crear un nuevo movimiento en inventario
router.post('/', async (req, res) => {
  try {
    const nuevo = await Inventario.query().insert(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el registro', details: err.message });
  }
});

// Actualizar un registro existente
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Inventario.query().patchAndFetchById(req.params.id, req.body);
    if (!actualizado) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el registro', details: err.message });
  }
});

// Eliminar un registro
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await Inventario.query().deleteById(req.params.id);
    if (!filasEliminadas) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el registro', details: err.message });
  }
});

module.exports = router;

// routes/LoteRoutes.js
const express = require('express');
const router = express.Router();
const Lote = require('../models/Lote');

// =============================================
// ✅ Obtener TODOS los lotes
// =============================================
router.get('/', async (req, res) => {
  try {
    const lotes = await Lote.query().withGraphFetched('producto');
    res.json(lotes);
  } catch (err) {
    res.status(500).json({
      error: 'Error al obtener lotes',
      details: err.message
    });
  }
});

// =============================================
// ✅ Obtener lotes por código de producto
// Ej: GET /lotes/producto/123
// =============================================
router.get('/producto/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const lotes = await Lote.query()
      .where('producto_id', codigo)
      .withGraphFetched('producto');

    res.json(lotes);
  } catch (err) {
    res.status(500).json({
      error: 'Error al obtener lotes del producto',
      details: err.message
    });
  }
});

// =============================================
// ✅ Obtener lote por ID
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const lote = await Lote.query()
      .findById(req.params.id)
      .withGraphFetched('producto');

    if (!lote) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    res.json(lote);
  } catch (err) {
    res.status(500).json({
      error: 'Error al obtener el lote',
      details: err.message
    });
  }
});

// =============================================
// ✅ Crear lote
// Body esperado: { producto_id, lote, fecha_vencimiento }
// =============================================
router.post('/', async (req, res) => {
  try {
    const nuevo = await Lote.query().insert(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({
      error: 'Error al crear lote',
      details: err.message
    });
  }
});

// =============================================
// ✅ Actualizar lote
// =============================================
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Lote.query()
      .patchAndFetchById(req.params.id, req.body);

    if (!actualizado) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    res.json(actualizado);
  } catch (err) {
    res.status(400).json({
      error: 'Error al actualizar lote',
      details: err.message
    });
  }
});

// =============================================
// ✅ Eliminar lote
// =============================================
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Lote.query().deleteById(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    res.json({ mensaje: 'Lote eliminado correctamente' });
  } catch (err) {
    res.status(400).json({
      error: 'Error al eliminar lote',
      details: err.message
    });
  }
});

module.exports = router;

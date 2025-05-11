const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const Movimiento = require('../models/MovimientoInventario');
const TipoMovimiento = require('../models/TipoMovimientoInventario');

// Crear producto (inventario)
router.post('/producto', async (req, res) => {
  try {
    const nuevo = await Inventario.query().insert(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error creando producto', detalle: err.message });
  }
});

// Registrar movimiento (entrada/salida)
router.post('/movimiento', async (req, res) => {
  try {
    const movimiento = await Movimiento.query().insert({
      inventario_id: req.body.inventario_id,
      tipo_movimiento_id: req.body.tipo_movimiento_id,
      cantidad: req.body.cantidad,
      observacion: req.body.observacion,
      fecha: new Date()
    });
    res.json({ message: 'Movimiento registrado', movimiento });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar movimiento', detalle: err.message });
  }
});

// Obtener stock actual por producto
router.get('/stock/:idInventario', async (req, res) => {
  try {
    const total = await Movimiento.query()
      .where('inventario_id', req.params.idInventario)
      .sum('cantidad as stock');
    res.json({ inventario_id: req.params.idInventario, stock: total[0].stock || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando stock', detalle: err.message });
  }
});

module.exports = router;

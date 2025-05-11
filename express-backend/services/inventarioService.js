const express = require('express');
const router = express.Router();
const { Inventario, MovimientoInventario } = require('../models'); // Asegúrate de que el modelo combinado exporte ambos modelos

// Crear producto (inventario)
router.post('/producto', async (req, res) => {
  try {
    const nuevo = await Inventario.query().insert(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error creando producto', detalle: err.message });
  }
});

// Registrar movimiento (entrada/salida) y actualizar inventario
router.post('/movimiento', async (req, res) => {
  try {
    const { inventario_id, tipo_movimiento_id, cantidad, observacion } = req.body;

    // Registra el movimiento
    const movimiento = await MovimientoInventario.query().insert({
      inventario_id,
      tipo_movimiento_id,
      cantidad,
      observacion,
      fecha: new Date()
    });

    // Actualiza el inventario según el tipo de movimiento
    const inventario = await Inventario.query().findById(inventario_id);
    let nuevoStock = inventario.cantidad + (movimiento.tipo_movimiento_id === 1 ? cantidad : -cantidad);
    
    // Asegúrate de que el stock no sea negativo
    if (nuevoStock < 0) {
      return res.status(400).json({ error: 'No hay suficiente stock disponible' });
    }

    // Actualiza el inventario con el nuevo stock
    await Inventario.query().patchAndFetchById(inventario_id, { cantidad: nuevoStock });

    res.json({ message: 'Movimiento registrado y stock actualizado', movimiento });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar movimiento', detalle: err.message });
  }
});

// Obtener stock actual por producto
router.get('/stock/:idInventario', async (req, res) => {
  try {
    const total = await MovimientoInventario.query()
      .where('inventario_id', req.params.idInventario)
      .sum('cantidad as stock');
    res.json({ inventario_id: req.params.idInventario, stock: total[0].stock || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error consultando stock', detalle: err.message });
  }
});

module.exports = router;

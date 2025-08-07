const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const { transaction } = require('objection');

router.post('/', async (req, res) => {
  const { cliente_id, tipo_pago, detalles, local_id, encargado_id } = req.body;

  try {
    const trx = await Venta.startTransaction();

    const total = detalles.reduce((acc, item) => acc + item.subtotal, 0);

    const nuevaVenta = await Venta.query(trx).insert({
      cliente_id,
      tipo_pago,
      total
    });

    for (const item of detalles) {
      let cantidadRestante = item.cantidad;

      // 1. Obtener todos los lotes del producto ordenados por vencimiento
      const lotes = await Lote.query(trx)
        .where('producto_id', item.producto_id)
        .orderBy('fecha_vencimiento', 'asc');

      // 2. Filtrar los lotes con stock disponible
      const lotesConStock = [];
      for (const lote of lotes) {
        const stockMovimientos = await Inventario.query(trx)
          .where('lote_id', lote.id)
          .sum('cantidad as stock');

        const stock = parseInt(stockMovimientos[0].stock || 0);
        if (stock > 0) {
          lotesConStock.push({ ...lote, stock });
        }
      }

      // 3. Usar los lotes para cubrir la cantidad solicitada
      for (const lote of lotesConStock) {
        if (cantidadRestante <= 0) break;

        const usarCantidad = Math.min(cantidadRestante, lote.stock);

        await VentaDetalle.query(trx).insert({
          venta_id: nuevaVenta.id,
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: usarCantidad,
          precio_unitario: item.precio_unitario,
          descuento: item.descuento || 0,
          subtotal: usarCantidad * item.precio_unitario
        });

        await Inventario.query(trx).insert({
          lote_id: lote.id,
          cantidad: -usarCantidad,
          tipo_movimiento_id: 2, // salida
          venta_id: nuevaVenta.id,
          precio_venta: item.precio_unitario,
          precio_costo: item.precio_costo || 0,
          local_id,
          encargado_id
        });

        cantidadRestante -= usarCantidad;
      }

    if (cantidadRestante > 0) {
  const producto = await trx.table('productos')
    .select('nombre')
    .where('codigo', item.producto_id)
    .first();

  const nombre = producto?.nombre || `ID ${item.producto_id}`;

  throw new Error(
    `Stock insuficiente para el producto "${nombre}". Solicitado: ${item.cantidad}`
  );
}

    }

    await trx.commit();
    res.status(201).json({ mensaje: 'Venta registrada correctamente', venta_id: nuevaVenta.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la venta', detalles: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const venta = await Venta.query()
      .findById(req.params.id)
      .withGraphFetched('[cliente, detalles.[producto, lote]]'); 

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta', detalles: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.query().withGraphFetched('[cliente, detalles.[producto]]')
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas', detalles: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

/**
 * POST /transferencias
 * Transfiere productos entre locales usando lógica de venta/compra
 * Cuerpo:
 * {
 *   origen_local_id: 1,
 *   destino_local_id: 2,
 *   productos: [
 *     { producto_id: 10, cantidad: 5 },
 *     { producto_id: 12, cantidad: 3 }
 *   ]
 * }
 */
router.post('/', async (req, res) => {
  const { origen_local_id, destino_local_id, productos } = req.body;
  let trx;

  try {
    if (!origen_local_id || !destino_local_id || origen_local_id === destino_local_id) {
      return res.status(400).json({ error: 'Locales inválidos o iguales' });
    }
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debe incluir productos a transferir' });
    }

    trx = await Venta.startTransaction();
    const user = req.user;

    // 1️⃣ Registrar "venta ficticia" en local origen (descuenta stock)
    const ventaOrigen = await Venta.query(trx).insert({
      cliente_id: null,
      tipo_pago: 'transacción',
      total: 0,
      encargado_id: user.id
    });

    // 2️⃣ Registrar "compra ficticia" en local destino (aumenta stock)
    const compraDestino = await Venta.query(trx).insert({
      cliente_id: null,
      tipo_pago: 'transacción',
      total: 0,
      encargado_id: user.id
    });

    for (const item of productos) {
      const cant = Number(item?.cantidad);
      if (!item?.producto_id || !Number.isFinite(cant) || cant <= 0) {
        throw new Error('Cada producto debe tener producto_id y cantidad > 0');
      }

      let restante = cant;

      const lotes = await Lote.query(trx)
        .where('producto_id', item.producto_id)
        .orderBy('fecha_vencimiento', 'asc');

      const lotesConStock = [];
      for (const lote of lotes) {
        const row = await Inventario.query(trx)
          .where('lote_id', lote.id)
          .where('local_id', origen_local_id)
          .sum('cantidad as stock')
          .first();
        const stock = parseInt(row?.stock || 0, 10);
        if (stock > 0) lotesConStock.push({ ...lote, stock });
      }

      for (const lote of lotesConStock) {
        if (restante <= 0) break;
        const usar = Math.min(restante, lote.stock);

        // Venta en local origen (descuento)
        await VentaDetalle.query(trx).insert({
          venta_id: ventaOrigen.id,
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: usar,
          precio_unitario: 0,
          descuento: 0,
          subtotal: 0
        });

        await Inventario.query(trx).insert({
          lote_id: lote.id,
          cantidad: -usar,
          tipo_movimiento_id: 2, // salida por venta
          venta_id: ventaOrigen.id,
          precio_venta: 0,
          precio_costo: 0,
          local_id: origen_local_id,
          encargado_id: user.id
        });

        // Compra en local destino (incremento)
        await VentaDetalle.query(trx).insert({
          venta_id: compraDestino.id,
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: usar,
          precio_unitario: 0,
          descuento: 0,
          subtotal: 0
        });

        await Inventario.query(trx).insert({
          lote_id: lote.id,
          cantidad: usar,
          tipo_movimiento_id: 1, // entrada por compra
          venta_id: compraDestino.id,
          precio_venta: 0,
          precio_costo: 0,
          local_id: destino_local_id,
          encargado_id: user.id
        });

        restante -= usar;
      }

      if (restante > 0) {
        throw new Error(`Stock insuficiente del producto ${item.producto_id} en local ${origen_local_id}`);
      }
    }

    await trx.commit();
    res.status(201).json({ mensaje: 'Transferencia realizada correctamente' });

  } catch (error) {
    if (trx) await trx.rollback();
    console.error('[POST /transferencias] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

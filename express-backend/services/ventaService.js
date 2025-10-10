const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const authenticateToken = require('../middlewares/authMiddleware');

// Requiere usuario autenticado
router.use(authenticateToken);

router.post('/', async (req, res) => {
  console.log('req.user =>', req.user);
  const { cliente_id, tipo_pago, detalles } = req.body;

  let trx;
  try {
    // del JWT (firmado en /login)
    const userId = req.user?.id;
    const userLocalId = req.user?.local_id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    if (!userLocalId) {
      return res.status(400).json({ error: 'El usuario no tiene local asignado (local_id)' });
    }
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'La venta requiere al menos un detalle' });
    }
    if (!['efectivo', 'tarjeta', 'transacción'].includes(tipo_pago)) {
      return res.status(400).json({ error: 'tipo_pago inválido' });
    }

    trx = await Venta.startTransaction();

    let total = 0;

    // Venta con autor (encargado); created_at lo pone la BD
    const nuevaVenta = await Venta.query(trx).insert({
      cliente_id: cliente_id ?? null,
      tipo_pago,
      total: 0,
      encargado_id: userId
    });

    for (const item of detalles) {
      const cant = Number(item?.cantidad);
      if (!item?.producto_id || !Number.isFinite(cant) || cant <= 0) {
        throw new Error('Cada detalle debe tener producto_id y cantidad > 0');
      }

      let cantidadRestante = cant;

      // Precios desde productos
      const producto = await trx.table('productos')
        .select('precioventa', 'preciocosto', 'nombre')
        .where('codigo', item.producto_id)
        .first();

      if (!producto) {
        throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
      }

      const precio_unitario = parseFloat(producto.precioventa);
      const precio_costo = parseFloat(producto.preciocosto);

      // Lotes por vencimiento (FIFO por fecha de vencimiento)
      const lotes = await Lote.query(trx)
        .where('producto_id', item.producto_id)
        .orderBy('fecha_vencimiento', 'asc');

      const lotesConStock = [];
      for (const lote of lotes) {
        const row = await Inventario.query(trx)
          .where('lote_id', lote.id)
          .sum('cantidad as stock')
          .first();
        const s = parseInt(row?.stock || 0, 10);
        if (s > 0) lotesConStock.push({ ...lote, stock: s });
      }

      for (const lote of lotesConStock) {
        if (cantidadRestante <= 0) break;

        const usarCantidad = Math.min(cantidadRestante, lote.stock);

        // Descuento por vencimiento
        const hoy = new Date();
        const vencimiento = new Date(lote.fecha_vencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

        let descuento = 0;
        if (diasRestantes <= 5) descuento = 0.4;
        else if (diasRestantes <= 10) descuento = 0.2;

        const precioFinal = precio_unitario * (1 - descuento);
        const subtotal = usarCantidad * precioFinal;

        await VentaDetalle.query(trx).insert({
          venta_id: nuevaVenta.id,
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: usarCantidad,
          precio_unitario,
          descuento: parseFloat((descuento * 100).toFixed(2)), // porcentaje
          subtotal
        });

        await Inventario.query(trx).insert({
          lote_id: lote.id,
          cantidad: -usarCantidad,
          tipo_movimiento_id: 2,     // salida por venta
          venta_id: nuevaVenta.id,
          precio_venta: precio_unitario,
          precio_costo,
          local_id: userLocalId,     // del token
          encargado_id: userId       // del token
          // fecha: DEFAULT NOW() en BD
        });

        total += subtotal;
        cantidadRestante -= usarCantidad;
      }

      if (cantidadRestante > 0) {
        throw new Error(
          `Stock insuficiente para el producto "${producto.nombre}". Solicitado: ${cant}`
        );
      }
    }

    await Venta.query(trx).findById(nuevaVenta.id).patch({ total });

    await trx.commit();

    return res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      venta_id: nuevaVenta.id
    });
  } catch (error) {
    console.error('[POST /ventas] Error:', error);
    if (trx) {
      try { await trx.rollback(); } catch (_) {}
    }
    return res.status(500).json({ error: 'Error al registrar la venta', detalles: error.message });
  }
});

// GET /ventas/:id (incluye autor y fecha)
router.get('/:id', async (req, res) => {
  try {
    const venta = await Venta.query()
      .findById(req.params.id)
      .withGraphFetched('[cliente, encargado, detalles.[producto, lote]]');

    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta', detalles: error.message });
  }
});

// GET /ventas (opcional por local) incluyendo autor y fecha
router.get('/', async (req, res) => {
  const { local_id } = req.query;

  try {
    let ventas;
    if (local_id) {
      const ventasConLocal = await Inventario.query()
        .where('local_id', local_id)
        .whereNotNull('venta_id')
        .distinct('venta_id');

      const ventaIds = ventasConLocal.map(v => v.venta_id);

      ventas = await Venta.query()
        .whereIn('id', ventaIds)
        .withGraphFetched('[cliente, encargado, detalles.[producto, lote]]');
    } else {
      ventas = await Venta.query()
        .withGraphFetched('[cliente, encargado, detalles.[producto, lote]]');
    }

    res.json(ventas);
  } catch (error) {
    console.error('[GET /ventas] Error:', error);
    res.status(500).json({ error: 'Error al obtener las ventas', detalles: error.message });
  }
});

module.exports = router;

// graficasRoutes.js
const express = require('express');
const router = express.Router();
const { raw } = require('objection');

const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Compra = require('../models/Compra');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Inventario = require('../models/Inventario');

const authenticateToken = require('../middlewares/authMiddleware');



// ---------------------------
// Ventas vs Compras por mes
// ---------------------------
router.get('/ventascompras', async (req, res) => {
  const { local_id } = req.query;

  try {
    // -------------------
    // Compras
    // -------------------
    const compras = await Compra.query()
      .join('pagos_compras', 'pagos_compras.compra_id', 'compras.id')
      .modify(qb => {
        if (local_id) {
          qb.whereExists(
            Compra.relatedQuery('productos')
              .where('local_id', local_id)
          );
        }
      })
      .select(
        raw(`DATE_TRUNC('month', pagos_compras.fecha) AS mes`),
        raw(`SUM(compras.total) AS total_compras`)
      )
      .groupBy('mes')
      .orderBy('mes');

    // -------------------
    // Ventas
    // -------------------
    const ventas = await Venta.query()
      .modify(qb => {
        if(local_id) {
          qb.whereExists(
            Venta.relatedQuery('detalles')
              .join('lotes as l', 'l.id', 'detalles.lote_id')
              .join('inventario as i', 'i.lote_id', 'l.id')
              .where('i.local_id', local_id)
          );
        }
      })
      .select(
        raw(`DATE_TRUNC('month', ventas.created_at) AS mes`),
        raw(`SUM(total) AS total_ventas`)
      )
      .groupBy('mes')
      .orderBy('mes');

    res.json({ compras, ventas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener compras vs ventas', details: err.message });
  }
});

// ---------------------------
// Top productos vendidos
// ---------------------------
router.get('/top-productos', async (req, res) => {
  const { local_id, limit = 10 } = req.query;

  try {
    const topProductos = await VentaDetalle.query()
        .select('venta_detalle.producto_id')
        .sum('venta_detalle.cantidad as total_vendida')
        .join('lotes', 'venta_detalle.lote_id', 'lotes.id')
        .join('inventario as i', 'lotes.id', 'i.lote_id')
        .modify(qb => {
            if (local_id) qb.where('i.local_id', local_id);
        })
        .groupBy('venta_detalle.producto_id')
        .orderBy('total_vendida', 'desc')
        .limit(limit || 10);


    // Obtener info de productos
    const productosIds = topProductos.map(p => p.producto_id);
    const productos = await Producto.query().findByIds(productosIds);

    const resultado = topProductos.map(tp => {
      const producto = productos.find(p => p.codigo === tp.producto_id);
      return {
        producto_id: tp.producto_id,
        nombre: producto?.nombre || 'Desconocido',
        total_vendida: Number(tp.total_vendida)
      };
    });

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener top productos', details: err.message });
  }
});

// ---------------------------
// Top clientes por compras
// ---------------------------
router.get('/top-clientes', async (req, res) => {
  const { local_id, limit = 10 } = req.query;

  try {
    const topClientes = await Venta.query()
      .select('cliente_id')
      .sum('total as total_comprado')
      .modify(qb => {
        if(local_id) qb.whereExists(
          Venta.relatedQuery('detalles')
            .join('inventario as i', 'detalles.lote_id', 'i.lote_id')
            .where('i.local_id', local_id)
        );
      })
      .groupBy('cliente_id')
      .orderBy('total_comprado', 'desc')
      .limit(limit);

    const clientesIds = topClientes.map(c => c.cliente_id);
    const clientes = await Cliente.query().findByIds(clientesIds);

    const resultado = topClientes.map(tc => {
      const cliente = clientes.find(c => c.id === tc.cliente_id);
      return {
        cliente_id: tc.cliente_id,
        nombre: cliente?.nombre || 'Desconocido',
        total_comprado: Number(tc.total_comprado)
      };
    });

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener top clientes', details: err.message });
  }
});

module.exports = router;

// Nombre del archivo: ventasService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. router.post('/'): Registra una nueva venta, distribuyendo la cantidad vendida entre múltiples lotes disponibles del producto.
//    - Se validan existencias por lote (FIFO).
//    - Se insertan detalles de venta y movimientos negativos en el inventario.
//    - Si no hay suficiente stock total, la transacción se cancela.
// 2. router.get('/'): Devuelve todas las ventas registradas con sus detalles, productos, clientes y lotes.
// 3. router.get('/:id'): Devuelve una venta específica por su ID, con detalles anidados.

// Archivos relacionados:
// - models/Venta.js: Define el modelo principal de ventas y sus relaciones.
// - models/VentaDetalle.js: Define los detalles de cada producto vendido, enlazado a lote.
// - models/Inventario.js: Registra cada salida de inventario como parte de la venta.
// - models/Lote.js: Lotes desde donde se descuenta el stock.
// - models/Producto.js: Utilizado para obtener el nombre del producto en caso de error.
// - app.js o index.js: Punto de entrada donde se importa este servicio y se monta en la app principal.

// Autores:
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 06/08/2025

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

    let total = 0;

    const nuevaVenta = await Venta.query(trx).insert({
      cliente_id,
      tipo_pago,
      total: 0 
    });

    for (const item of detalles) {
      let cantidadRestante = item.cantidad;

      const producto = await trx.table('productos')
        .select('precioventa', 'preciocosto', 'nombre')
        .where('codigo', item.producto_id)
        .first();

      if (!producto) {
        throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
      }

      const precio_unitario = parseFloat(producto.precioventa);
      const precio_costo = parseFloat(producto.preciocosto);

      const lotes = await Lote.query(trx)
        .where('producto_id', item.producto_id)
        .orderBy('fecha_vencimiento', 'asc');

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

      for (const lote of lotesConStock) {
        if (cantidadRestante <= 0) break;

        const usarCantidad = Math.min(cantidadRestante, lote.stock);

        // 👇 Calcular descuento basado en vencimiento
        const hoy = new Date();
        const vencimiento = new Date(lote.fecha_vencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

        let descuento = 0;
        if (diasRestantes <= 5) {
          descuento = 0.4; // 40%
        } else if (diasRestantes <= 10) {
          descuento = 0.2; // 20%
        } 

        const precioFinal = precio_unitario * (1 - descuento);
        const subtotal = usarCantidad * precioFinal;

        await VentaDetalle.query(trx).insert({
          venta_id: nuevaVenta.id,
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: usarCantidad,
          precio_unitario,
          descuento: parseFloat((descuento * 100).toFixed(2)), // guardar como porcentaje
          subtotal
        });

        await Inventario.query(trx).insert({
          lote_id: lote.id,
          cantidad: -usarCantidad,
          tipo_movimiento_id: 2,
          venta_id: nuevaVenta.id,
          precio_venta: precio_unitario,
          precio_costo,
          local_id,
          encargado_id
        });

        total += subtotal;
        cantidadRestante -= usarCantidad;
      }

      if (cantidadRestante > 0) {
        throw new Error(
          `Stock insuficiente para el producto "${producto.nombre}". Solicitado: ${item.cantidad}`
        );
      }
    }

    await Venta.query(trx)
      .findById(nuevaVenta.id)
      .patch({ total });

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
      .withGraphFetched('[cliente, detalles.[producto, lote],inventario]')
      .modifyGraph('inventario', (builder) => {
        builder.select('fecha')
      });

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    const ventaSinInventarios = { ...venta };
    delete ventaSinInventarios.inventario;

    res.json({
      ...ventaSinInventarios,
      fecha_venta: venta.inventario?.[0]?.fecha || null
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta', detalles: error.message });
  }
});

router.get('/', async (req, res) => {
  const { local_id } = req.query;

  try {
    let ventas;

    if (local_id) {
      // Obtener IDs de ventas que tengan inventario asociado al local
      const ventasConLocal = await Inventario.query()
        .where('local_id', local_id)
        .whereNotNull('venta_id')
        .distinct('venta_id');

      const ventaIds = ventasConLocal.map(v => v.venta_id);

      ventas = await Venta.query()
        .whereIn('id', ventaIds)
        .withGraphFetched('[cliente, detalles.[producto, lote],inventario]')
        .modifyGraph('inventario', (builder) => {
          builder.select('fecha');
        });

    } else {
      ventas = await Venta.query().withGraphFetched('[cliente, detalles.[producto, lote],inventario]').modifyGraph('inventario', (builder) => {
          builder.select('fecha');
        });;
    }

     const ventasConFecha = ventas.map(v => {
  const ventaSinInventarios = { ...v };
  delete ventaSinInventarios.inventario;

  return {
    ...ventaSinInventarios,
    fecha_venta: v.inventario?.[0]?.fecha || null
  };
});

res.json(ventasConFecha);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ventas', detalles: error.message });
  }
});


module.exports = router;

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
// modificado: Renato R.
// Última modificación: 26/10/2025

const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const authenticateToken = require('../middlewares/authMiddleware');
const { resolveClienteId } = require('../helpers/resolveCliente');
const { formatVentas } = require('../helpers/formatters/ventasFormatter');

router.use(authenticateToken);
router.post('/', async (req, res) => {
  const { cliente_id, cliente, tipo_pago, detalles } = req.body;
  let trx;
  try {
    const user = req.user;
    const userId = user?.id;
    const userRol = user?.rol_id;
    const userLocalId = user?.local_id;

    const localIdFinal = userRol === 1
      ? req.body.local_id || userLocalId
      : userLocalId;

    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });
    if (!localIdFinal) return res.status(400).json({ error: 'El usuario no tiene local asignado (local_id)' });
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'La venta requiere al menos un detalle' });
    }
    if (!['efectivo', 'tarjeta', 'transacción'].includes(tipo_pago)) {
      return res.status(400).json({ error: 'tipo_pago inválido' });
    }

    trx = await Venta.startTransaction();

    const clienteIdFinal = await resolveClienteId(trx, { cliente_id, cliente });

    let total = 0;
    const nuevaVenta = await Venta.query(trx).insert({
      cliente_id: clienteIdFinal,
      tipo_pago,
      total: 0,
      encargado_id: userId
    });

    // --- Calcular total y registrar detalles ---
    for (const item of detalles) {
      const cant = Number(item?.cantidad);
      if (!item?.producto_id || !Number.isFinite(cant) || cant <= 0) {
        throw new Error('Cada detalle debe tener producto_id y cantidad > 0');
      }

            // --- inicio del bloque reemplazado por producto --
      const producto = await trx('productos')
        .select('precioventa', 'preciocosto', 'nombre', 'codigo')
        .where('codigo', item.producto_id)
        .first();

      if (!producto) throw new Error(`Producto con ID ${item.producto_id} no encontrado`);

      const precioPorDefecto = producto.precioventa ? parseFloat(producto.precioventa) : 0;
      const precioCostoPorDefecto = producto.preciocosto ? parseFloat(producto.preciocosto) : 0;

      let cantidadRestante = cant;

      // Obtener lotes del producto ordenados por fecha_vencimiento asc (más próximos primero)
      const lotes = await Lote.query(trx)
        .where('producto_id', item.producto_id)
        .orderBy('fecha_vencimiento', 'asc');

      // Construir lista de lotes que tienen stock > 0
      const lotesConStock = [];
      for (const lote of lotes) {
        const row = await Inventario.query(trx)
          .where('lote_id', lote.id)
          .sum('cantidad as stock')
          .first();
        const s = parseInt(row?.stock || 0, 10);
        if (s > 0) lotesConStock.push({ ...lote, stock: s });
      }

      // == Nueva parte: determinar el precio más alto entre lotes con stock ==
      // Además, guardamos la "última compra con precio" por lote para reutilizarla.
      let precioUnitarioMasAlto = precioPorDefecto;
      const ultimaPorLote = {}; // { [loteId]: { precio_venta, precio_costo, ... } | null }
      for (const lote of lotesConStock) {
        const ultimaCompraConPrecio = await trx('inventario')
          .where({ lote_id: lote.id })
          .whereNotNull('precio_venta')
          .orderBy('fecha', 'desc') // si tienes created_at, usa created_at desc
          .first();
        ultimaPorLote[lote.id] = ultimaCompraConPrecio || null;

        const p = ultimaCompraConPrecio && ultimaCompraConPrecio.precio_venta != null
          ? parseFloat(ultimaCompraConPrecio.precio_venta)
          : null;

        if (p != null && p > precioUnitarioMasAlto) {
          precioUnitarioMasAlto = p;
        }
      }

      for (const lote of lotesConStock) {
        if (cantidadRestante <= 0) break;

        const usarCantidad = Math.min(cantidadRestante, lote.stock);

        const ultimaCompraConPrecio = ultimaPorLote[lote.id];
        const precio_costo_lote = ultimaCompraConPrecio && ultimaCompraConPrecio.precio_costo != null
          ? parseFloat(ultimaCompraConPrecio.precio_costo)
          : precioCostoPorDefecto;

        const precio_unitario_aplicado = precioUnitarioMasAlto;

        const subtotal = usarCantidad * precio_unitario_aplicado;

        await VentaDetalle.query(trx).insert({
          venta_id: nuevaVenta.id,
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: usarCantidad,
          precio_unitario: precio_unitario_aplicado,
          descuento: 0,
          subtotal
        });

        await Inventario.query(trx).insert({
          lote_id: lote.id,
          cantidad: -usarCantidad,
          tipo_movimiento_id: 2,
          venta_id: nuevaVenta.id,
          precio_venta: precio_unitario_aplicado, // precio que se cobró
          precio_costo: precio_costo_lote,
          local_id: localIdFinal,
          encargado_id: userId
        });

        total += subtotal;
        cantidadRestante -= usarCantidad;
      }

      if (cantidadRestante > 0) {
        throw new Error(`Stock insuficiente para el producto "${producto.nombre}". Solicitado: ${cant}, disponible: ${cant - cantidadRestante}`);
      }

    // --- 🚨 Validaciones fiscales ---
    const nit = cliente?.nit?.trim() || null;

    // Si total > Q2500 → NIT requerido y no puede ser CF
    if (total > 2500 && (!nit || nit.toUpperCase() === 'CF')) {
      await trx.rollback();
      return res.status(400).json({
        error: 'Para ventas mayores a Q2500 se requiere un NIT válido (no se permite CF).'
      });
    }

    // Si hay NIT, validar formato (solo números o con guion + K/k)
    if (nit && nit.toUpperCase() !== 'CF') {
      const limpio = nit.replace(/-/g, '');
      if (!/^[0-9]+[0-9kK]$/.test(limpio)) {
        await trx.rollback();
        return res.status(400).json({ error: 'El NIT ingresado no tiene un formato válido.' });
      }
    }

    // --- Guardar total final ---
    await Venta.query(trx).findById(nuevaVenta.id).patch({ total });
    await trx.commit();

    return res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      venta_id: nuevaVenta.id
    });
  }} catch (error) {
    console.error('[POST /ventas] Error:', error);
    if (trx) {
      try { await trx.rollback(); } catch (_) {}
    }
    return res.status(500).json({
      error: 'Error al registrar la venta',
      detalles: error.message
    });
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

    //datos filtrados
    const formatted = ventas.map(formatVentas);

    //Datos completos
    //res.json(ventas);

    //Datos filtrados
    res.json(formatted);
   
  } catch (error) {
    console.error('[GET /ventas] Error:', error);
    res.status(500).json({ error: 'Error al obtener las ventas', detalles: error.message });
  }
});

module.exports = router;

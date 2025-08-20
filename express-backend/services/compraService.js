// compraService.js

// Principales funciones y descripción de las mismas:
// 1. router.post('/'): Registra una nueva compra con sus productos y genera movimientos de entrada en el inventario.
//    - Crea la compra con total inicial en cero.
//    - Por cada producto, busca o crea un lote según su fecha de vencimiento.
//    - Se insertan movimientos de entrada (tipo_movimiento_id = 1) en inventario.
//    - Se calcula el total de la compra y se actualiza.
//    - Se registra un único pago asociado (al contado o a crédito, según se indique).

// 2. router.get('/'): Devuelve todas las compras registradas.
//    - Si se especifica `local_id`, filtra compras relacionadas con dicho local según el inventario.
//    - Devuelve relaciones con usuario, proveedor y pagos.

// 3. router.get('/:id'): Devuelve una compra específica por su ID.
//    - Incluye información del usuario, proveedor, pagos y los movimientos de inventario relacionados.
//    - Para cada movimiento muestra el producto, lote, local y encargado.

// Archivos relacionados:
// - models/Compra.js: Define el modelo principal de compras y sus relaciones (usuario, proveedor, pagos).
// - models/PagoCompra.js: Define el pago asociado a una compra, con soporte para crédito o contado.
// - models/Inventario.js: Registra cada entrada de productos como parte de la compra.
// - models/Lote.js: Lotes asociados a productos con control de vencimiento.
// - models/Producto.js: Utilizado para obtener información del producto (ej. precio de costo).
// - models/Usuario.js: El mismo usuario registra la compra y figura como encargado del inventario.
// - app.js o index.js: Punto de entrada donde se importa este módulo y se monta en la app principal.


// Por: Renato Rojas. Creado: 20/08/2025
// Última modificación: 20/05/2025


const express = require('express')
const router = express.Router()
const Compra = require('../models/Compra')
const PagoCompra = require('../models/PagoCompra')
const Inventario = require('../models/Inventario')
const Lote = require('../models/Lote')
const Producto = require('../models/Producto');

router.post('/', async (req, res) => {
  const {
    no_factura,
    usuario_id,
    proveedor_id,
    descripcion,
    detalles, // [{ producto_id, cantidad, fecha_vencimiento }]
    local_id,
    credito,
    cuotas,
    detalles_pago
  } = req.body;

  try {
    const trx = await Compra.startTransaction();

    let total = 0;

    const nuevaCompra = await Compra.query(trx).insert({
      no_factura,
      usuario_id,
      proveedor_id: proveedor_id || null,
      descripcion: descripcion || null,
      total: 0,
      credito
    });

    for (const item of detalles) {
      const producto = await Producto.query(trx)
        .findById(item.producto_id);

      if (!producto) {
        throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
      }

      const precio_costo = parseFloat(producto.preciocosto);
      const subtotal = precio_costo * item.cantidad;

      // Buscar o crear lote
      let lote = await Lote.query(trx)
        .findOne({ producto_id: item.producto_id, fecha_vencimiento: item.fecha_vencimiento });

      if (!lote) {
        lote = await Lote.query(trx).insert({
          producto_id: item.producto_id,
          fecha_vencimiento: item.fecha_vencimiento
        });
      }

      await Inventario.query(trx).insert({
        lote_id: lote.id,
        cantidad: item.cantidad,
        tipo_movimiento_id: 1, // entrada
        compra_id: nuevaCompra.id,
        precio_costo,
        local_id,
        encargado_id:usuario_id,
        fecha: new Date()
      });

      total += subtotal;
    }

    // Actualiza total de la compra
    await Compra.query(trx)
      .findById(nuevaCompra.id)
      .patch({ total });

    // Registra el pago
    await PagoCompra.query(trx).insert({
      compra_id: nuevaCompra.id,
      cuotas: cuotas || 1,
      estado: credito ? 'pendiente' : 'pagado',
      total,
      fecha: new Date(),
      detalles: detalles_pago || (credito
            ? `Compra a crédito con ${cuotas || 1} cuota(s)`
            : 'Compra al contado')    
    });

    await trx.commit();

    res.status(201).json({
      mensaje: 'Compra registrada correctamente',
      compra_id: nuevaCompra.id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al registrar la compra',
      detalles: error.message
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const compra = await Compra.query()
      .findById(req.params.id)
      .withGraphFetched('[usuario, proveedor, pagos]');

    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    const inventario = await Inventario.query()
      .where('compra_id', compra.id)
      .withGraphFetched('[lote.producto, local, encargado]');

    res.json({
      ...compra,
      inventario
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la compra', detalles: error.message });
  }
});


router.get('/', async (req, res) => {
  const { local_id } = req.query;

  try {
    let compras;

    if (local_id) {
      const comprasConLocal = await Inventario.query()
        .where('local_id', local_id)
        .whereNotNull('compra_id')
        .distinct('compra_id');

      const compraIds = comprasConLocal.map(c => c.compra_id);

      compras = await Compra.query()
        .whereIn('id', compraIds)
        .withGraphFetched('[usuario, proveedor, pagos]');
    } else {
      compras = await Compra.query().withGraphFetched('[usuario, proveedor, pagos]');
    }

    res.json(compras);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las compras', detalles: error.message });
  }
});

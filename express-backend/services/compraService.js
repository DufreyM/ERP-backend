const express = require('express')
const router = express.Router()
const Compra = require('../models/Compra')
const PagoCompra = require('../models/PagoCompra')
const Inventario = require('../models/Inventario')
const Lote = require('../models/Lote')
const Producto = require('../models/Producto');
const authenticateToken = require('../middlewares/authMiddleware');
const { formatCompra } = require('../helpers/formatters/compraFormatter')

router.use(authenticateToken);

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
        .withGraphFetched('[usuario, proveedor, pagos, productos.lote.producto]')
    } else {
      compras = await Compra.query().withGraphFetched('[usuario, proveedor, pagos, productos.lote.producto]')

    }
    //datos filtrados
    const formatted = compras.map(formatCompra);

    //Datos completos
    //res.json(compras); 

    //Datos filtrados
    res.json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las compras', detalles: error.message });
  }
});

router.post('/', async (req, res) => {
  const {
    no_factura, proveedor_id, nuevo_proveedor,
    descripcion, credito, cuotas, detalles
  } = req.body;
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
      return res.status(400).json({ error: 'La compra requiere al menos un detalle' });
    }

    trx = await Compra.startTransaction();

    let proveedorIdFinal = proveedor_id || null;

    if (!proveedor_id && nuevo_proveedor) {
      try {
        const proveedorCreado = await Proveedor.query(trx).insertGraph(nuevo_proveedor);
        proveedorIdFinal = proveedorCreado.id;
      } catch (err) {
        throw new Error('Error al crear nuevo proveedor: ' + err.message);
      }
    }

    if (!proveedorIdFinal) {
      throw new Error('Se requiere un proveedor válido para registrar la compra');
    }

    let total = 0;
    const nuevaCompra = await Compra.query(trx).insert({
      no_factura,
      proveedor_id: proveedorIdFinal,
      descripcion: descripcion || null,
      usuario_id: userId,
      credito,
      total: 0
    });

    for (const item of detalles) {
      const { producto_id, cantidad, precio_costo, precio_venta, lote, fecha_vencimiento } = item;

      if (!producto_id || !cantidad || cantidad <= 0 || !precio_costo || !precio_venta || !lote || !fecha_vencimiento) {
        throw new Error('Cada detalle debe tener producto_id, cantidad, precios, lote y fecha_vencimiento');
      }

      let loteExistente = await trx('lotes')
        .where({ lote, producto_id })
        .first();

      if (!loteExistente) {
        const nuevoLote = await trx('lotes')
          .insert({ lote, producto_id, fecha_vencimiento })
          .returning('*');
        loteExistente = Array.isArray(nuevoLote) ? nuevoLote[0] : nuevoLote;
      }

      await trx('inventario').insert({
        lote_id: loteExistente.id,
        cantidad,
        tipo_movimiento_id: 1,
        compra_id: nuevaCompra.id,
        precio_costo,
        precio_venta,
        local_id: localIdFinal, 
        encargado_id: userId
      });

      total += cantidad * precio_costo;
    }

    await Compra.query(trx).findById(nuevaCompra.id).patch({ total });

    const cuotasFinal = credito ? cuotas : 0;
    const estadoFinal = credito ? 'pendiente' : 'pagado';

    if (credito && (!cuotas || cuotas <= 0)) {
      throw new Error('Número de cuotas requerido para compras a crédito');
    }

    await trx('pagos_compras').insert({
      compra_id: nuevaCompra.id,
      cuotas: cuotasFinal,
      estado: estadoFinal,
      total,
      fecha: new Date().toISOString()
    });

    await trx.commit();
    return res.status(201).json({ mensaje: 'Compra registrada correctamente', compra_id: nuevaCompra.id });

  } catch (error) {
    console.error('[POST /compras] Error:', error);
    if (trx) {
      try { await trx.rollback(); } catch (_) {}
    }
    return res.status(500).json({ error: 'Error al registrar la compra', detalles: error.message });
  }
});



module.exports = router
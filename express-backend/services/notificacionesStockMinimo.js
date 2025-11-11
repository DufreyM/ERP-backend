const Calendario = require('../models/Calendario');
const Producto = require('../models/Producto');
const Lote = require('../models/Lote');
const Inventario = require('../models/Inventario');
const { raw } = require('objection');

async function crearNotificacionesDeStockMinimo(usuario, localId) {
  try {
    // 🔹 Obtener la suma total del stock por producto en el local
    const productosConStock = await Inventario.query()
      .select('lotes.producto_id')
      .sum('inventario.cantidad as total_stock')
      .join('lotes', 'inventario.lote_id', 'lotes.id')
      .where('inventario.local_id', localId)
      .groupBy('lotes.producto_id');

    // 🔹 Recorremos cada producto para comparar stock actual vs stock mínimo
    for (const item of productosConStock) {
      const producto = await Producto.query().findById(item.producto_id);

      if (!producto) continue;

      const stockActual = item.total_stock || 0;
      const stockMinimo = producto.stock_minimo || 0;

      if (stockActual <= stockMinimo) {
        // Comprobar si ya existe una notificación activa para evitar duplicados
        const notificacionExistente = await Calendario.query()
          .where({
            local_id: localId,
            tipo_evento_id: 3, // Tipo 3: Notificación de stock mínimo
            titulo: `Stock bajo: ${producto.nombre}`,
            estado_id: 1, // Activo
          })
          .first();

        if (!notificacionExistente) {
          await Calendario.query().insert({
            usuario_id: usuario.id,
            local_id: localId,
            tipo_evento_id: 3,
            titulo: `Stock bajo: ${producto.nombre}`,
            detalles: `El producto ${producto.nombre} tiene solo ${stockActual} unidades disponibles (mínimo: ${stockMinimo}).`,
            estado_id: 1,
            fecha: new Date().toISOString(),
          });

          console.log(`🔔 Notificación creada para producto con stock bajo: ${producto.nombre}`);
        }
      }
    }
  } catch (error) {
    console.error('Error creando notificaciones de stock mínimo:', error.message);
  }
}

module.exports = crearNotificacionesDeStockMinimo;

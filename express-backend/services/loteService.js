// services/loteService.js
const Lote = require('../models/Lote');
const { raw } = require('objection');

async function obtenerLotesConStock(producto_id, local_id) {
  const lotes = await Lote.query()
    .where('producto_id', producto_id)
    .withGraphFetched('producto')
    .modifyGraph('producto', builder => builder.select('codigo', 'nombre', 'precioventa', 'preciocosto'))
    .select(
      'lotes.*',
      raw(`COALESCE((
        SELECT SUM(i.cantidad)
        FROM inventario i
        WHERE i.lote_id = lotes.id
        ${local_id ? `AND i.local_id = ${local_id}` : ''}
      ), 0) AS stock_actual`)
    )
    .orderBy('fecha_vencimiento', 'asc');

  // Filtrar solo lotes con stock > 0
  return lotes.filter(l => Number(l.stock_actual) > 0).map(l => ({
    id: l.id,
    lote: l.lote,
    fecha_vencimiento: l.fecha_vencimiento,
    stock_actual: Number(l.stock_actual),
    preciocosto: l.producto.preciocosto,
    precioventa: l.producto.precioventa
  }));
}

module.exports = {
  obtenerLotesConStock
};

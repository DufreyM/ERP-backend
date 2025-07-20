const Producto = require('../models/Producto');
const { raw } = require('objection');

async function obtenerProductosConStock(local_id) {
  const productos = await Producto.query()
    .select('productos.*')
    .withGraphFetched('proveedor')
    .modifyGraph('proveedor', builder => {
      builder.select('id', 'nombre');
    })
    .select(
      raw(`
        COALESCE((
          SELECT SUM(
            CASE
              WHEN i.tipo_movimiento_id = 1 THEN i.cantidad
              WHEN i.tipo_movimiento_id = 2 THEN -i.cantidad
              ELSE 0
            END
          )
          FROM inventario i
          JOIN lotes l ON l.id = i.lote_id
          WHERE l.producto_id = productos.codigo
          ${local_id ? `AND i.local_id = ${local_id}` : ''}
        ), 0) AS stock_actual
      `)
    );

  return productos;
}

module.exports = {
  obtenerProductosConStock,
};

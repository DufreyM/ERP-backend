const Producto = require('../models/Producto');
const Inventario = require('../models/Inventario');
const Lote = require('../models/Lote');
const { raw } = require('objection');

async function obtenerProductosConStock(local_id) {
  const productos = await Producto.query()
    .withGraphFetched('proveedor')
    .modifyGraph('proveedor', builder => {
      builder.select('id', 'nombre');
    });

  for (let producto of productos) {
    const stock = await Inventario.query()
      .joinRelated('lote') // crea alias 'lote'
      .where('lote.producto_id', producto.codigo) // <-- usar 'lote' no 'lotes'
      .modify(query => {
        if (local_id) query.where('inventario.local_id', local_id);
      })
      .sum('cantidad as stock');

    producto.stock_actual = stock[0].stock || 0;
  }

  return productos;
}


module.exports = {
  obtenerProductosConStock,
};

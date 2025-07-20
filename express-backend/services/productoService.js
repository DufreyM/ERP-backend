// Nombre del archivo: productoService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. obtenerProductosConStock(local_id): Obtiene todos los productos con su información completa, incluyendo el proveedor y el stock actual calculado como la suma de movimientos de entrada menos salida, filtrando por local si se indica.

// Archivos relacionados:
// - models/Producto.js: Modelo que representa la tabla productos.
// - models/Lote.js: Modelo que representa los lotes vinculados a productos.
// - models/Inventario.js: Modelo que representa los movimientos de inventario.
// - routes/productoRoutes.js: Define rutas que utilizan esta función para exponer la información vía API.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// Última modificación: 20/07/2025

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

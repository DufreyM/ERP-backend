// Nombre del archivo: productoService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. obtenerProductosConStock(local_id): Obtiene todos los productos con su información completa, incluyendo el proveedor y el stock actual calculado como la suma de movimientos ya firmados (positivos para entradas, negativos para salidas).

// Archivos relacionados:
// - models/Producto.js: Modelo que representa la tabla productos.
// - models/Lote.js: Modelo que representa los lotes vinculados a productos.
// - models/Inventario.js: Modelo que representa los movimientos de inventario.
// - routes/productoRoutes.js: Define rutas que utilizan esta función para exponer la información vía API.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// Última modificación: 06/08/2025

const Producto = require('../models/Producto');
const { raw } = require('objection');
const authenticateToken = require('../middlewares/authMiddleware');
router.use(authenticateToken);

async function obtenerProductosConStock(local_id) {
  const productos = await Producto.query()
    .select('productos.*')
    .withGraphFetched('proveedor')
    .modifyGraph('proveedor', builder => {
      builder.select('id', 'nombre');
    })
    // Agregamos subconsulta para stock actual
    .select(
      raw(`COALESCE((
        SELECT SUM(i.cantidad)
        FROM inventario i
        JOIN lotes l ON l.id = i.lote_id
        WHERE l.producto_id = productos.codigo
        ${local_id ? `AND i.local_id = ${local_id}` : ''}
      ), 0) AS stock_actual`)
    )
    // Agregamos subconsulta para fecha de vencimiento más cercana
    .select(
      raw(`(
        SELECT MIN(l.fecha_vencimiento)
        FROM lotes l
        WHERE l.producto_id = productos.codigo
      ) AS fecha_vencimiento_mas_cercana`)
    )
    // Ordenamos por esa fecha
    .orderByRaw('fecha_vencimiento_mas_cercana ASC NULLS LAST');

  return productos;
}

async function buscarProductosConStock({ query, local_id }) {
  const productos = await obtenerProductosConStock(local_id);

  const filtro = query ? query.toLowerCase() : '';

  return productos
    .filter(p => p.stock_actual > 0)
    .filter(p =>
      p.nombre.toLowerCase().includes(filtro) ||
      String(p.codigo).includes(filtro)
    )
    .map(p => ({
      id: p.codigo,
      nombre: p.nombre,
      presentacion: p.presentacion,
      precio: p.precioventa,
      stock: p.stock_actual
    }));
}


module.exports = {
  obtenerProductosConStock,
  buscarProductosConStock
};

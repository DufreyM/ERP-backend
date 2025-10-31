// Nombre del archivo: productoService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. obtenerProductosConStock(local_id): Obtiene todos los productos con su información completa, incluyendo el proveedor y el stock actual calculado como la suma de movimientos ya firmados (positivos para entradas, negativos para salidas).

// Archivos relacionados:
// - models/Producto.js: Modelo que representa la tabla productos.
// - models/Lote.js: Modelo que representa los lotes vinculados a productos.
// - models/Inventario.js: Modelo que representa los movimientos de inventario.
// - routes/productoRoutes.js: Define rutas que utilizan esta función para exponer la información vía API.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// modificado: Renato R.
// Última modificación: 26/10/2025

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
      raw(`COALESCE((
        SELECT SUM(i.cantidad)
        FROM inventario i
        JOIN lotes l ON l.id = i.lote_id
        WHERE l.producto_id = productos.codigo
        ${local_id ? `AND i.local_id = ${local_id}` : ''}
      ), 0) AS stock_actual`)
    )
    .select(
      raw(`(
        SELECT MIN(l.fecha_vencimiento)
        FROM lotes l
        WHERE l.producto_id = productos.codigo
      ) AS fecha_vencimiento_mas_cercana`)
    )
    .select(
      raw(`COALESCE((
        SELECT MAX(t.precio_venta) FROM (
          SELECT l.id as lote_id,
                 MAX(inv.precio_venta) AS precio_venta,
                 SUM(inv2.cantidad) AS stock_lote
          FROM lotes l
          JOIN inventario inv ON inv.lote_id = l.id
          JOIN inventario inv2 ON inv2.lote_id = l.id
          WHERE l.producto_id = productos.codigo
          ${local_id ? `AND inv2.local_id = ${local_id}` : ''}
          GROUP BY l.id
          HAVING SUM(inv2.cantidad) > 0
        ) t
      ), 0) AS precio_a_cobrar`)
    )
    .orderByRaw('fecha_vencimiento_mas_cercana ASC NULLS LAST');

  const productosNormalizados = productos.map(p => {
    const stock = Number(p.stock_actual || 0);
    const precio_a = p.precio_a_cobrar != null ? parseFloat(p.precio_a_cobrar) : 0;
    const precioProducto = p.precioventa != null ? parseFloat(p.precioventa) : 0;
    const precioFinal = precio_a > 0 ? precio_a : precioProducto;

    return {
      ...p,
      stock_actual: stock,
      precio_a_cobrar: precio_a,
      precioventa: precioFinal,
      precio: precioFinal
    };
  });

  return productosNormalizados;
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
      // si precio_a_cobrar tiene valor > 0 lo usamos; si no usamos precioventa
      precio: (p.precio_a_cobrar && Number(p.precio_a_cobrar) > 0) ? Number(p.precio_a_cobrar) : p.precioventa,
      stock: p.stock_actual,
      fecha_vencimiento_mas_cercana: p.fecha_vencimiento_mas_cercana
    }));
}

module.exports = {
  obtenerProductosConStock,
  buscarProductosConStock
};

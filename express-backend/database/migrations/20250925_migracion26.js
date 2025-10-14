const fs = require('fs')
const path = require('path')

exports.up = function (knex) {
  const sql = fs.readFileSync(
    path.join(__dirname, 'sqls', '2025_09_25_migracion26.sql'),
    'utf8'
  )
  return knex.raw(sql)
}


exports.down = async function(knex) {
  await knex('inventario')
    .where('id', 1)
    .update({
      tipo_movimiento_id: 2,
      precio_venta: 50.00,
      compra_id: null
    });

  await knex('inventario')
    .where('id', 2)
    .update({
      tipo_movimiento_id: 3,
      precio_venta: 75.00,
      compra_id: null
    });

  await knex('inventario')
    .where('id', 3)
    .update({
      tipo_movimiento_id: 2,
      precio_venta: 60.00,
      compra_id: null
    });

  await knex('inventario')
    .where('id', 4)
    .update({
      tipo_movimiento_id: 4,
      precio_venta: 100.00,
      compra_id: null
    });
};

const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_08_27_migracion24.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  await knex('inventario')
    .whereIn('venta_id', [18, 19, 20, 21, 22, 23])
    .del()

  await knex('venta_detalle')
    .whereIn('venta_id', [18, 19, 20, 21, 22, 23])
    .del()

  await knex('ventas')
    .whereIn('id', [18, 19, 20, 21, 22, 23])
    .del()
}

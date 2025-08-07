const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_08_07_migracion22.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  await knex('inventario')
    .where({ id: 3 })
    .update({ venta_id: null })

  await knex('inventario')
    .where({ id: 4 })
    .update({ venta_id: null })
}


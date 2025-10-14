const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_07_13_migracion13.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  await knex.schema.table('productos', table => {
    table.dropColumn('imagen')
  })

  await knex.schema.alterTable('inventario', table => {
    table.decimal('precio_venta').notNullable().alter()
    table.decimal('precio_costo').notNullable().alter()
  })

  await knex('inventario')
    .where({
      lote_id: 10,
      cantidad: -10,
      tipo_movimiento_id: 6,
      venta_id: 11,
      precio_venta: 40.00,
      local_id: 1,
      encargado_id: 13
    })
    .del()

  await knex('ventas')
    .where({
      cliente_id: 5,
      total: 400.00,
      tipo_pago: 'efectivo'
    })
    .del()

  await knex('tipos_movimientos_inventario')
    .where({ nombre: 'Venta' })
    .del()
}

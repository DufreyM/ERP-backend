const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_07_13_migracion14.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  await knex('documentos_locales')
    .whereIn('nombre', [
      'Estado de cuenta julio 2025',
      'Contaduría julio 2025',
      'Encargo de 3kg de piscina',
      'Pedido de paracetamol',
      'Factura compra de estanterías',
      'Registro de ingreso de jeringas',
      'Promocion de vitaminas 2x1',
      'Encargo de yeso',
      'Aviso SAT',
      'Recibo de luz'
    ])
    .del()

  await knex('visitadores_medicos').where('id', '<', 3).update('usuario_id', null)
  await knex('visitadores_medicos').where('id', '>=', 3).andWhere('id', '<', 6).update('usuario_id', null)
  await knex('visitadores_medicos').where('id', 6).update('usuario_id', null)
  await knex('visitadores_medicos').where('id', 7).update('usuario_id', null)
  await knex('visitadores_medicos').where('id', 8).update('usuario_id', null)
  await knex('visitadores_medicos').where('id', 9).update('usuario_id', null)
  await knex('visitadores_medicos').where('id', 10).update('usuario_id', null)
}

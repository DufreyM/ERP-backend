const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_07_21_migracion18.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  await knex('calendario')
    .where('id', '<=', 5)
    .update({ local_id: null })

  await knex('calendario')
    .where('id', '>', 5)
    .andWhere('id', '<=', 10)
    .update({ local_id: null })

  await knex('calendario')
    .whereIn(['usuario_id', 'titulo', 'fecha'], [
      [15, 'Conferencia sobre existencia de kilogramos de piscina', '2025-07-25 03:33:33'],
      [12, 'Comprar USB', '2025-07-25 14:00:00'],
      [14, 'Comprar decoración de oficina', '2025-07-19'],
      [10, 'Muestra de contaduría', '2025-08-20'],
      [2,  'Entregar facturas del mes al contador', '2025-08-31 12:00:00'],
      [3,  'Venta al por mayor para hospital', '2025-06-06 10:00:00'],
    ])
    .del()

  await knex('calendario')
    .whereIn(['usuario_id', 'visitador_id', 'titulo', 'fecha'], [
      [1, 3, 'Promoción de acetaminofén', '2025-06-21'],
      [11, 11, 'Promoción del clan', '2025-07-25 19:30:00'],
    ])
    .del()
}

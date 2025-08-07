const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_08_05_migracion20.sql'), 'utf8')
  return knex.raw(sql)
}



exports.down = async function(knex) {
  await knex('productos')
    .whereIn('codigo', [1,2,3,4,5,6,7,8,9,10])
    .update('imagen', null)
}

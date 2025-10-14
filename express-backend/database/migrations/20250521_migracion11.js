const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_05_21_migracion11.sql'), 'utf8')
  return knex.raw(sql)
}  


exports.down = function(knex) {
  return knex('usuarios')
    .whereIn('email', [
      'leomejia646@gmail.com',
      'dannyramirez21546@gmail.com',
      'mariajosegironisidro@gmail.com',
      'melisadmendizabal@gmail.com',
      'dartarojas@gmail.com'
    ])
    .del();
}

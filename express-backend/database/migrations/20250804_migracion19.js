const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_08_04_migracion19.sql'), 'utf8')
  return knex.raw(sql)
}


exports.down = async function(knex) {
  await knex('documentos_locales')
    .whereIn('nombre', [
      'Documento normal1',
      'Documento anormal',
      'Documento normal2',
      'Documento normal3',
      'Documento normal4',
      'Documento normal5',
      'Documento normal6',
      'Documento normal7',
      'Documento normal8',
      'Documento normal9'
    ])
    .del();
};

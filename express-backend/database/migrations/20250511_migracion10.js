const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_05_11_migracion10.sql'), 'utf8')
  return knex.raw(sql)
}  

exports.down = async function(knex) {
  await knex.schema.table('visitadores_medicos', (table) => {
    table.dropForeign('usuario_id');
  });

  await knex.schema.table('visitadores_medicos', (table) => {
    table.dropColumn('usuario_id');
  });

  await knex.schema.table('visitadores_medicos', (table) => {
    table.string('nombre');
    table.string('correo');
  });
};

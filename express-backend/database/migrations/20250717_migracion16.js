const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_07_17_migracion16.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  // Eliminar columna updatedAt de documentos_locales
  await knex.schema.table('documentos_locales', (table) => {
    table.dropColumn('updatedAt');
  });

  // Eliminar columna deletedAt de documentos_locales
  await knex.schema.table('documentos_locales', (table) => {
    table.dropColumn('deletedAt');
  });
};

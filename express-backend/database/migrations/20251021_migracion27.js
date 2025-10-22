const path = require('path');
const fs = require('fs');

exports.up = async function (knex) {
  const sqlPath = path.join(__dirname, 'sqls', '2025_10_21_migracion27.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  return knex.raw(sql);
};

exports.down = async function (knex) {
  await knex.schema.alterTable('permisos', (table) => {
    table.dropForeign('modulo_id');
    table.dropColumn('modulo_id');
    table.string('modulo', 50);
  });

  await knex.schema.dropTableIfExists('modulos');
};

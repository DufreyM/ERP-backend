const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_08_22_migracion22.sql'), 'utf8');
  return knex.raw(sql);
};

exports.down = async function(knex) {
  await knex.schema.alterTable('ventas', table => {
    table.dropColumn('encargado_id');
    table.dropColumn('created_at');
  });

  await knex.schema.alterTable('inventario', table => {
    table.dropColumn('fecha');
  });
};

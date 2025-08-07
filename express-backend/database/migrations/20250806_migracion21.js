const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_08_06_migracion21.sql'), 'utf8');
  return knex.raw(sql);
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('venta_detalle');
};

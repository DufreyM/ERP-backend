const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_05_02_migracion7.sql'), 'utf8');
  return knex.raw(sql);
};

exports.down = async function(knex) {
    await knex.schema.table('usuarios', function(table) {
      table.dropColumn('token');
      table.dropColumn('verificado');
    });
  };
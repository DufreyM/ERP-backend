const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_03_17_00_migracion_inicial.sql'), 'utf8');
  return knex.raw(sql);
};


exports.down = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_03_19_migracion4.sql'), 'utf8');
  return knex.raw(sql);     
};

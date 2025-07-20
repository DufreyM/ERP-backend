const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  // Lee el archivo SQL que contiene las instrucciones para la migración
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_07_20_migracion17.sql'), 'utf8');
  return knex.raw(sql);
};

exports.down = async function(knex) {
  // Revertir inserciones de tipos de movimientos
  await knex('inventario').del();
  await knex('lotes').whereIn('id', [1, 2]).del();
  await knex('Tipos_Movimientos_Inventario')
    .whereIn('nombre', ['entrada', 'salida'])
    .del();

  // Reiniciar secuencia para Tipos_Movimientos_Inventario
  await knex.raw('ALTER SEQUENCE tipos_movimientos_inventario_id_seq RESTART WITH 1');
};

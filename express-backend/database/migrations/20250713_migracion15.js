const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
    const sql = fs.readFileSync(path.join(__dirname, '../sqls/2025_07_17_migracion15.sql'), 'utf8');
    return knex.raw(sql);
};

exports.down = async function(knex) {
  // Eliminar la VIEW primero
    await knex.raw('DROP VIEW IF EXISTS vw_notificaciones_recientes;');
    
  // Eliminar la constraint y luego la columna
    await knex.raw('ALTER TABLE Calendario DROP CONSTRAINT IF EXISTS chk_tipo_evento;');
    await knex.raw('ALTER TABLE Calendario DROP COLUMN IF EXISTS tipo_evento;');
};

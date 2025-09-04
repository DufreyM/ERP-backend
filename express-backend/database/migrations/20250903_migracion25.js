const fs = require('fs');
const path = require('path');

exports.up = function (knex) {
  const sql = fs.readFileSync(
    path.join(__dirname, 'sqls', '2025_09_03_migracion25.sql'),
    'utf8'
  );
  return knex.raw(sql);
};

exports.down = async function (knex) {
  // Quitar datos de prueba (si los insertaste en la migración SQL)
  await knex('visitadores_medicos')
    .whereNotNull('documento_url')
    .update({
      telefonos: null,
      documento_url: null,
      documento_public_id: null,
      documento_nombre: null,
      documento_mime: null,
      documento_bytes: null,
      documento_updated_at: null,
    });

  // Opcional: eliminar columnas
  await knex.schema.alterTable('visitadores_medicos', (t) => {
    t.dropColumn('telefonos');
    t.dropColumn('documento_url');
    t.dropColumn('documento_public_id');
    t.dropColumn('documento_nombre');
    t.dropColumn('documento_mime');
    t.dropColumn('documento_bytes');
    t.dropColumn('documento_updated_at');
  });
};

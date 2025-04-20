const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_03_18_migracion_2.sql'), 'utf8');
  return knex.raw(sql);
};


exports.down = async function(knex) {
  // Eliminar las claves foráneas en la tabla Telefonos (si existen)
  await knex.schema.alterTable('Telefonos', function (table) {
    table.dropForeign('usuario_id');
    table.dropForeign('proveedor_id');
    table.dropForeign('visitador_id');
    table.dropForeign('cliente_id');
  });

  // Eliminar tabla Telefonos
  await knex.schema.dropTableIfExists('Telefonos');

  // Restaurar columna telefono en las tablas originales
  await knex.schema.alterTable('Clientes', function (table) {
    table.string('telefono');
  });

  await knex.schema.alterTable('Visitadores_Medicos', function (table) {
    table.string('telefono');
  });

  await knex.schema.alterTable('Proveedores', function (table) {
    table.string('telefono');
  });

  await knex.schema.alterTable('Usuarios', function (table) {
    table.string('telefono');
  });

  // Restaurar la FK original en Visitadores_Medicos, si aplica
  await knex.schema.alterTable('Visitadores_Medicos', function (table) {
    table.dropForeign('proveedor_id'); 
    table.foreign('proveedor_id').references('Proveedores.id');
  });
};

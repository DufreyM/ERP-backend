const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_07_17_migracion15.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  // Primero eliminamos la restricción de clave foránea de la tabla Calendario
  await knex.schema.alterTable('Calendario', function(table) {
    table.dropForeign('tipo_evento_calendario_id', 'fk_tipo_evento')
  })

  // Luego eliminamos las columnas agregadas
  await knex.schema.alterTable('Calendario', function(table) {
    table.dropColumn('tipo_evento_calendario_id')
    table.dropColumn('fecha_eliminado')
  })

  // Finalmente eliminamos la tabla Tipos_Evento_Calendario
  await knex.schema.dropTableIfExists('Tipos_Evento_Calendario')
}

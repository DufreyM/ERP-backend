const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls', '2025_07_17_migracion15.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
  // 1. Eliminar la tabla de tipos de evento
  await knex.schema.dropTableIfExists('Tipos_Evento_Calendario')

  // 2. Eliminar las columnas añadidas a la tabla Calendario
  const hasTipoEvento = await knex.schema.hasColumn('Calendario', 'tipo_evento')
  if (hasTipoEvento) {
    await knex.schema.table('Calendario', (table) => {
      table.dropColumn('tipo_evento')
    })
  }

  const hasFechaEliminado = await knex.schema.hasColumn('Calendario', 'fecha_eliminado')
  if (hasFechaEliminado) {
    await knex.schema.table('Calendario', (table) => {
      table.dropColumn('fecha_eliminado')
    })
  }
}

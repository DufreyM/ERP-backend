const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_05_11_migracion9.sql'), 'utf8')
  return knex.raw(sql)
}  

exports.down = async function(knex) {
  await knex('permisos_roles').del();
  await knex('roles').where('nombre', 'Química Farmacéutica').del();
  await knex('permisos').del();

  const hasColumn = await knex.schema.hasColumn('permisos', 'modulo');
  if (hasColumn) {
    await knex.schema.alterTable('permisos', table => {
      table.dropColumn('modulo');
    });
  }
};

const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_04_19_migracion6.sql'), 'utf8');
  return knex.raw(sql);
};

exports.down = async function(knex) {
  // Eliminar la foreign key
  await knex.schema.alterTable('usuarios', (table) => {
    table.dropForeign('id_local', 'usuarios_id_local_fkey');
  });

  // Renombrar la columna de nuevo a 'local'
  await knex.schema.alterTable('usuarios', (table) => {
    table.renameColumn('id_local', 'local');
  });

  // Restaurar los valores originales (1:1 con el id del usuario)
  await knex('usuarios').where({ id: 3 }).update({ local: 3 });
  await knex('usuarios').where({ id: 4 }).update({ local: 4 });
  await knex('usuarios').where({ id: 5 }).update({ local: 5 });
  await knex('usuarios').where({ id: 6 }).update({ local: 6 });
  await knex('usuarios').where({ id: 7 }).update({ local: 7 });
  await knex('usuarios').where({ id: 8 }).update({ local: 8 });
  await knex('usuarios').where({ id: 9 }).update({ local: 9 });
  await knex('usuarios').where({ id: 10 }).update({ local: 10 });
};

const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_07_08_migracion12.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = function(knex) {
  const sql = `
    ALTER TABLE promociones_producto
    DROP CONSTRAINT IF EXISTS promociones_producto_localid_fkey,
    DROP COLUMN IF EXISTS local_id;

    ALTER TABLE calendario
    DROP CONSTRAINT IF EXISTS calendario_localid_fkey,
    DROP COLUMN IF EXISTS local_id;
  `;
  return knex.raw(sql)
}

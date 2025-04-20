const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_04_18_migracion5.sql'), 'utf8')
  return knex.raw(sql)
}

exports.down = async function(knex) {
    await knex.transaction(async trx => {

    await knex('Calendario').del();
    await knex('Estados_Calendarios').del();
  
    await knex('Categorias_Productos').del();
    await knex('Categorias').del();
  
    await knex('Pagos_Compras').del();
    await knex('Inventario').del();
    await knex('Compras').del();
  
    await knex('Facturas').del();
    await knex('Ventas').del();
  
    await knex('Tipos_Movimientos_Inventario').del();
    await knex('Lotes').del();
  
    await knex('Productos').del();
  
    await knex('Clientes').del();
  
    await knex('Telefonos').del();
  
    await knex('Visitadores_Medicos').del();
  
    await knex('Proveedores').del();
  
    await knex('Permisos_Roles').del();
    await knex('Permisos').del();
  
    await knex('Documentos_Locales').del();
  
    await knex('Locales').del();
  
    await knex('Usuarios').del();
  
    await knex('Roles').del();
  })
}
  
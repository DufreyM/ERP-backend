const fs = require('fs')
const path = require('path')

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_05_07_migracion8.sql'), 'utf8')
  return knex.raw(sql)
}  

exports.down = async function(knex) {
    await knex('inventario').where({ id: 1 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 2 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 3 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 4 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 5 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 6 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 7 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 8 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 9 }).update({ venta_id: null, compra_id: null })  
    await knex('inventario').where({ id: 10 }).update({ venta_id: null, compra_id: null })  
}

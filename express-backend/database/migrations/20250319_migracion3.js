const fs = require('fs');
const path = require('path');

exports.up = function(knex) {
  const sql = fs.readFileSync(path.join(__dirname, 'sqls','2025_03_19_migracion3.sql'), 'utf8');
  return knex.raw(sql);
};

exports.down = async function(knex) {
  // Eliminar constraints que agregaste manualmente (en orden inverso)
  await knex.schema.alterTable('telefonos', (table) => {
    table.dropForeign('usuario_id');
    table.dropForeign('proveedor_id');
    table.dropForeign('visitador_id');
    table.dropForeign('cliente_id');
  });

  await knex.schema.alterTable('visitadores_medicos', (table) => {
    table.dropForeign('proveedor_id');
  });

  // Eliminar la tabla telefonos
  await knex.schema.dropTableIfExists('telefonos');

  // Restaurar columnas 'telefono' eliminadas
  await knex.schema.alterTable('usuarios', (table) => {
    table.string('telefono', 50);
  });

  await knex.schema.alterTable('proveedores', (table) => {
    table.string('telefono', 50);
  });

  await knex.schema.alterTable('visitadores_medicos', (table) => {
    table.string('telefono', 50);
  });

  await knex.schema.alterTable('clientes', (table) => {
    table.string('telefono', 50);
  });

  // Eliminar constraints de todas las relaciones (en orden inverso de creación)
  await knex.schema.alterTable('inventario', (table) => {
    table.dropForeign('compra_id');
    table.dropForeign('venta_id');
    table.dropForeign('tipo_movimiento_id');
    table.dropForeign('lote_id');
    table.dropForeign('local_id');
    table.dropForeign('encargado_id');
  });

  await knex.schema.alterTable('calendario', (table) => {
    table.dropForeign('estado_id');
    table.dropForeign('visitador_id');
    table.dropForeign('usuario_id');
  });

  await knex.schema.alterTable('promociones_producto', (table) => {
    table.dropForeign('promocion_id');
    table.dropForeign('producto_id');
  });

  await knex.schema.alterTable('ventas', (table) => {
    table.dropForeign('cliente_id');
  });

  await knex.schema.alterTable('categorias_productos', (table) => {
    table.dropForeign('producto_id');
    table.dropForeign('categoria_id');
  });

  await knex.schema.alterTable('documentos_locales', (table) => {
    table.dropForeign('local_id');
    table.dropForeign('usuario_id');
  });

  await knex.schema.alterTable('recetas', (table) => {
    table.dropForeign('venta_id');
    table.dropForeign('producto_id');
  });

  await knex.schema.alterTable('compras', (table) => {
    table.dropForeign('usuario_id');
    table.dropForeign('proveedor_id');
  });

  await knex.schema.alterTable('catalogos_visitadores', (table) => {
    table.dropForeign('visitador_id');
  });

  await knex.schema.alterTable('permisos_roles', (table) => {
    table.dropForeign('permiso_id');
  });

  await knex.schema.alterTable('locales', (table) => {
    table.dropForeign('administrador_id');
  });

  await knex.schema.alterTable('pagos_compras', (table) => {
    table.dropForeign('compra_id');
  });

  await knex.schema.alterTable('facturas', (table) => {
    table.dropForeign('local_id');
    table.dropForeign('venta_id');
  });

  await knex.schema.alterTable('productos', (table) => {
    table.dropForeign('proveedor_id');
  });

  await knex.schema.alterTable('lotes', (table) => {
    table.dropForeign('producto_id');
  });

  await knex.schema.alterTable('usuarios', (table) => {
    table.dropForeign('rol_id');
  });

  // Eliminar tablas (en orden inverso al de creación)
  await knex.schema.dropTableIfExists('telefonos');
  await knex.schema.dropTableIfExists('calendario');
  await knex.schema.dropTableIfExists('catalogos_visitadores');
  await knex.schema.dropTableIfExists('categorias_productos');
  await knex.schema.dropTableIfExists('promociones_producto');
  await knex.schema.dropTableIfExists('documentos_locales');
  await knex.schema.dropTableIfExists('recetas');
  await knex.schema.dropTableIfExists('facturas');
  await knex.schema.dropTableIfExists('inventario');
  await knex.schema.dropTableIfExists('pagos_compras');
  await knex.schema.dropTableIfExists('compras');
  await knex.schema.dropTableIfExists('ventas');
  await knex.schema.dropTableIfExists('lotes');
  await knex.schema.dropTableIfExists('visitadores_medicos');
  await knex.schema.dropTableIfExists('promociones');
  await knex.schema.dropTableIfExists('productos');
  await knex.schema.dropTableIfExists('clientes');
  await knex.schema.dropTableIfExists('locales');
  await knex.schema.dropTableIfExists('usuarios');
  await knex.schema.dropTableIfExists('estados_calendarios');
  await knex.schema.dropTableIfExists('proveedores');
  await knex.schema.dropTableIfExists('categorias');
  await knex.schema.dropTableIfExists('tipos_movimientos_inventario');
  await knex.schema.dropTableIfExists('permisos_roles');
  await knex.schema.dropTableIfExists('permisos');
  await knex.schema.dropTableIfExists('roles');
};


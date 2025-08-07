const { Model } = require('objection');

class Inventario extends Model {
  static get tableName() {
    return 'inventario';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'lote_id',
        'cantidad',
        'tipo_movimiento_id',
        'local_id',
        'encargado_id'
      ],

      properties: {
        id: { type: 'integer' },
        lote_id: { type: 'integer' },
        cantidad: { type: 'integer'},
        tipo_movimiento_id: { type: 'integer' },
        venta_id: { type: ['integer', 'null'] },
        compra_id: { type: ['integer', 'null'] },
        precio_venta: { type: ['number' , 'null']},
        precio_costo: { type: ['number','null'] },
        local_id: { type: 'integer' },
        encargado_id: { type: 'integer' },
        fecha: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Lote = require('./Lote');
    const TipoMovimiento = require('./Tipo_Movimiento_Inventario');
    const Venta = require('./Venta');
    const Compra = require('./Compra');
    const Local = require('./Local');
    const Usuario = require('./Usuario');

    return {
      lote: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lote,
        join: {
          from: 'inventario.lote_id',
          to: 'lotes.id'
        }
      },
      tipoMovimiento: {
        relation: Model.BelongsToOneRelation,
        modelClass: TipoMovimiento,
        join: {
          from: 'inventario.tipo_movimiento_id',
          to: 'tipos_movimientos_inventario.id'
        }
      },
      venta: {
        relation: Model.BelongsToOneRelation,
        modelClass: Venta,
        join: {
          from: 'inventario.venta_id',
          to: 'ventas.id'
        }
      },
      compra: {
        relation: Model.BelongsToOneRelation,
        modelClass: Compra,
        join: {
          from: 'inventario.compra_id',
          to: 'compras.id'
        }
      },
      local: {
        relation: Model.BelongsToOneRelation,
        modelClass: Local,
        join: {
          from: 'inventario.local_id',
          to: 'locales.id'
        }
      },
      encargado: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: 'inventario.encargado_id',
          to: 'usuarios.id'
        }
      }
    };
  }
}

module.exports = Inventario


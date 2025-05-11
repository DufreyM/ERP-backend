const { Model } = require('objection');

class MovimientoInventario extends Model {
  static get tableName() {
    return 'movimientos_inventario';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['inventario_id', 'cantidad', 'tipo_movimiento_id'],
      properties: {
        id: { type: 'integer' },
        inventario_id: { type: 'integer' },
        tipo_movimiento_id: { type: 'integer' },
        cantidad: { type: 'number' },
        fecha: { type: 'string', format: 'date-time' },
        observacion: { type: ['string', 'null'], maxLength: 255 }
      }
    };
  }

  static get relationMappings() {
    const Inventario = require('./Inventario');
    const TipoMovimiento = require('./TipoMovimientoInventario');

    return {
      inventario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Inventario,
        join: {
          from: 'movimientos_inventario.inventario_id',
          to: 'inventario.id'
        }
      },
      tipoMovimiento: {
        relation: Model.BelongsToOneRelation,
        modelClass: TipoMovimiento,
        join: {
          from: 'movimientos_inventario.tipo_movimiento_id',
          to: 'tipos_movimientos_inventario.id'
        }
      }
    };
  }
}

module.exports = MovimientoInventario;

const { Model } = require('objection');

class Lote extends Model {
  static get tableName() {
    return 'lotes';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['producto_id', 'lote', 'fecha_vencimiento'],

      properties: {
        id: { type: 'integer' },
        producto_id: { type: 'integer' },
        lote: { type: 'string', maxLength: 255 },
        fecha_vencimiento: { type: 'string', format: 'date' }
      }
    };
  }

  static get relationMappings() {
    const Producto = require('./Producto');

    return {
      producto: {
        relation: Model.BelongsToOneRelation,
        modelClass: Producto,
        join: {
          from: 'lotes.producto_id',
          to: 'productos.codigo'
        }
      }
    };
  }
}

module.exports = Lote
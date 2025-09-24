const { Model } = require('objection');

class PagoCompra extends Model {
  static get tableName() {
    return 'pagos_compras';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['compra_id', 'cuotas', 'estado', 'total', 'fecha'],

      properties: {
        id: { type: 'integer' },
        compra_id: { type: 'integer' },
        cuotas: { type: 'integer' },
        estado: { type: 'string', enum: ['pendiente', 'pagado'] },
        total: { type: 'number' },
        fecha: { type: 'string', format: 'date-time' },
        detalles: { type: ['string', 'null'] },
      }
    };
  }

  static get relationMappings() {
    const Compra = require('./Compra');

    return {
      compra: {
        relation: Model.BelongsToOneRelation,
        modelClass: Compra,
        join: {
          from: 'pagos_compras.compra_id',
          to: 'compras.id'
        }
      }
    };
  }
}

module.exports = PagoCompra;
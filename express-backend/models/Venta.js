const { Model } = require('objection');

class Venta extends Model {
  static get tableName() {
    return 'ventas';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['cliente_id', 'total', 'tipo_pago'],

      properties: {
        id: { type: 'integer' },
        cliente_id: { type: 'integer' },
        total: { type: 'number', minimum: 0 },
        tipo_pago: { type: 'string', enum: ['efectivo', 'tarjeta', 'transacción'] }
      }
    };
  }

  static get relationMappings() {
    const Cliente = require('./Cliente');

    return {
      cliente: {
        relation: Model.BelongsToOneRelation,
        modelClass: Cliente,
        join: {
          from: 'ventas.cliente_id',
          to: 'clientes.id'
        }
      }
    };
  }
}

module.exports = Venta
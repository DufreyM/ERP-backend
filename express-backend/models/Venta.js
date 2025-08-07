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
      required: ['total', 'tipo_pago'],
      properties: {
        id: { type: 'integer' },
        cliente_id: { type: ['integer', 'null']},
        total: { type: 'number', minimum: 0 },
        tipo_pago: { type: 'string', enum: ['efectivo', 'tarjeta', 'transacción'] }
      }
    };
  }

  static get relationMappings() {
  const Cliente = require('./Cliente');
  const VentaDetalle = require('./VentaDetalle');

  return {
    cliente: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cliente,
      join: {
        from: 'ventas.cliente_id',
        to: 'clientes.id'
      }
    },
    detalles: {
      relation: Model.HasManyRelation,
      modelClass: VentaDetalle,
      join: {
        from: 'ventas.id',
        to: 'venta_detalle.venta_id' // ← ¡esta línea es clave!
      }
    }
  };
}

}

module.exports = Venta;

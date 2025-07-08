const { Model } = require('objection');

class Promocion extends Model {
  static get tableName() {
    return 'promociones';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['descripcion', 'descuento', 'fecha_inicio', 'fecha_final'],

      properties: {
        id: { type: 'integer' },
        descripcion: { type: 'string' },
        descuento: { type: 'number' },
        fecha_inicio: { type: 'string', format: 'date-time' },
        fecha_final: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const PromocionProducto = require('./Promocion_Producto');

    return {
      productos: {
        relation: Model.HasManyRelation,
        modelClass: PromocionProducto,
        join: {
          from: 'promociones.id',
          to: 'promociones_producto.promocion_id'
        }
      }
    };
  }
}

module.exports = Promocion;

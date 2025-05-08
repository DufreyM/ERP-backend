const { Model } = require('objection');

class Producto extends Model {
  static get tableName() {
    return 'productos';
  }

  static get idColumn() {
    return 'codigo';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'nombre',
        'presentacion',
        'proveedor_id',
        'precioventa',
        'preciocosto',
        'receta',
        'stock_minimo'
      ],

      properties: {
        codigo: { type: 'integer' },
        nombre: { type: 'string', minLength: 1 },
        presentacion: { type: 'string', maxLength: 255 },
        proveedor_id: { type: 'integer' },
        precioventa: { type: 'number' },
        preciocosto: { type: 'number' },
        receta: { type: 'boolean' },
        stock_minimo: { type: 'integer', minimum: 0 },
        detalles: { type: ['string', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Proveedor = require('./Proveedor');

    return {
      proveedor: {
        relation: Model.BelongsToOneRelation,
        modelClass: Proveedor,
        join: {
          from: 'productos.proveedor_id',
          to: 'proveedores.id'
        }
      }
    };
  }
}

module.exports = Producto
const { Model } = require('objection');

class PromocionProducto extends Model {
  static get tableName() {
    return 'promociones_producto';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['producto_id', 'promocion_id'],

      properties: {
        id: { type: 'integer' },
        producto_id: { type: 'integer' },
        promocion_id: { type: 'integer' },
        local_id: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Producto = require('./Producto');
    const Promocion = require('./Promocion');
    const Local = require('./Local');

    return {
      producto: {
        relation: Model.BelongsToOneRelation,
        modelClass: Producto,
        join: {
          from: 'promociones_producto.producto_id',
          to: 'productos.codigo'
        }
      },
      promocion: {
        relation: Model.BelongsToOneRelation,
        modelClass: Promocion,
        join: {
          from: 'promociones_producto.promocion_id',
          to: 'promociones.id'
        }
      },
      local: {
        relation: Model.BelongsToOneRelation,
        modelClass: Local,
        join: {
          from: 'promociones_producto.local_id',
          to: 'locales.id'
        }
      }
    };
  }
}

module.exports = PromocionProducto;

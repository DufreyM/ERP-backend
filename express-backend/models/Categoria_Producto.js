const { Model } = require('objection');

class CategoriaProducto extends Model {
  static get tableName() {
    return 'categorias_productos';
  }

  static get idColumn() {
    return 'id'; 
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['categoria_id', 'producto_id'],

      properties: {
        id: { type: 'integer' },
        categoria_id: { type: 'integer' },
        producto_id: { type: 'integer' },
      }
    };
  }

  static get relationMappings() {
    const Categoria = require('./Categoria');
    const Producto = require('./Producto');

    return {
      categoria: {
        relation: Model.BelongsToOneRelation,
        modelClass: Categoria,
        join: {
          from: 'categorias_productos.categoria_id',
          to: 'categorias.id',
        },
      },
      producto: {
        relation: Model.BelongsToOneRelation,
        modelClass: Producto,
        join: {
          from: 'categorias_productos.producto_id',
          to: 'productos.codigo',
        },
      },
    };
  }
}

module.exports = CategoriaProducto;

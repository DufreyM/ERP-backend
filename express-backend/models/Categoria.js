const { Model } = require('objection');

class Categoria extends Model {
  static get tableName() {
    return 'categorias';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre'],

      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string', maxLength: 100 },
      }
    };
  }

  static get relationMappings() {
    const Producto = require('./Producto');
    const CategoriaProducto = require('./Categoria_Producto');

    return {
      productos: {
        relation: Model.ManyToManyRelation,
        modelClass: Producto,
        join: {
          from: 'categorias.id',
          through: {
            from: 'categorias_productos.categoria_id',
            to: 'categorias_productos.producto_id',
            modelClass: CategoriaProducto,
          },
          to: 'productos.codigo',
        },
      }
    };
  }
}

module.exports = Categoria;

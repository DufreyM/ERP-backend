const { Model } = require('objection');

class TipoMovimientoInventario extends Model {
  static get tableName() {
    return 'tipos_movimientos_inventario';
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
        nombre: { type: 'string', minLength: 1 }
      }
    };
  }
}

module.exports = TipoMovimientoInventario
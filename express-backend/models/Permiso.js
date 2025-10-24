const { Model } = require('objection');

class Permiso extends Model {
  static get tableName() {
    return 'permisos';
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
        nombre: { type: 'string', maxLength: 255 },
        descripcion: { type: ['string', 'null'] },
        modulo: { type: ['string', 'null'], maxLength: 50 } // Agregar esta línea
      }
    };
  }
}

module.exports = Permiso;

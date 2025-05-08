const { Model } = require('objection');

class Proveedor extends Model {
  static get tableName() {
    return 'proveedores';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre', 'direccion'],

      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string', minLength: 1, maxLength: 255 },
        direccion: { type: 'string', minLength: 1, maxLength: 255 },
        correo: { type: ['string', 'null'], format: 'email', maxLength: 255 }
      }
    };
  }
}

module.exports = Proveedor
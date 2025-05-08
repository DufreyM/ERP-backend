const { Model } = require('objection');

class Cliente extends Model {
  static get tableName() {
    return 'clientes';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre', 'nit'],

      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string', minLength: 1, maxLength: 255 },
        nit: { type: 'string', minLength: 1, maxLength: 50 },
        direccion: { type: ['string', 'null'], maxLength: 255 },
        correo: { type: ['string', 'null'], format: 'email', maxLength: 255 }
      }
    };
  }
}

module.exports = Cliente

const { Model } = require('objection');

class TipoEventoCalendario extends Model {
  static get tableName() {
    return 'tipos_evento_calendario';
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
        nombre: { type: 'string', maxLength: 50 }
      }
    };
  }
}

module.exports = TipoEventoCalendario;
const { Model } = require('objection');

class EstadoCalendario extends Model {
  static get tableName() {
    return 'estados_calendarios';
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

  static get relationMappings() {
    const Calendario = require('./Calendario');

    return {
      calendarios: {
        relation: Model.HasManyRelation,
        modelClass: Calendario,
        join: {
          from: 'estados_calendarios.id',
          to: 'calendario.estado_id'
        }
      }
    };
  }
}

module.exports = EstadoCalendario;

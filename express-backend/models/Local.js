const { Model } = require('objection');

class Local extends Model {
  static get tableName() {
    return 'locales';
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
        administrador_id: { type: ['integer', 'null'] },
        nombre: { type: 'string', maxLength: 255 },
        direccion: { type: ['string', 'null'], maxLength: 255 },
        nit_emisor: { type: ['string', 'null'], maxLength: 255 }
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    return {
      administrador: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: 'locales.administrador_id',
          to: 'usuarios.id'
        }
      },
      empleados: {
        relation: Model.HasManyRelation,
        modelClass: Usuario,
        join: {
          from: 'locales.id',
          to: 'usuarios.id_local'
        }
      }
    };
  }
}

module.exports = Local;

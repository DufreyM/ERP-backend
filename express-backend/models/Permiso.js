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
        modulo_id: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Modulo = require('./Modulo');
    return {
      modulo: {
        relation: Model.BelongsToOneRelation,
        modelClass: Modulo,
        join: {
          from: 'permisos.modulo_id',
          to: 'modulos.id'
        }
      }
    };
  }
}

module.exports = Permiso;

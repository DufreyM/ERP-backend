const { Model } = require('objection');

class Modulo extends Model {
  static get tableName() {
    return 'modulos';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre', 'ruta'],
      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string', maxLength: 100 },
        ruta: { type: 'string', maxLength: 255 },
        descripcion: { type: ['string', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Permiso = require('./Permiso');
    return {
      permisos: {
        relation: Model.HasManyRelation,
        modelClass: Permiso,
        join: {
          from: 'modulos.id',
          to: 'permisos.modulo_id'
        }
      }
    };
  }
}

module.exports = Modulo;

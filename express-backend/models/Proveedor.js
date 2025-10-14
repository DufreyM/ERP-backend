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

  static get relationMappings() {
  const Telefono = require('./Telefono');
  const VisitadorMedico = require('./VisitadorMedico');

  return {
    telefonos: {
      relation: Model.HasManyRelation,
      modelClass: Telefono,
      join: {
        from: 'proveedores.id',
        to: 'telefonos.proveedor_id'
      }
    },
    visitadores: {
      relation: Model.HasManyRelation,
      modelClass: VisitadorMedico,
      join: {
        from: 'proveedores.id',
        to: 'visitadores_medicos.proveedor_id'
      }
    }
  };
}
}

module.exports = Proveedor
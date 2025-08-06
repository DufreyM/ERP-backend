const { Model } = require('objection');

class VisitadorMedico extends Model {
  static get tableName() {
    return 'visitadores_medicos';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],

      properties: {
        id: { type: 'integer' },
        proveedor_id: { type: ['integer', 'null'] },
        usuario_id: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    const Proveedor = require('./Proveedor');

    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: 'visitadores_medicos.usuario_id',
          to: 'usuarios.id'
        }
      },
      proveedor: {
        relation: Model.BelongsToOneRelation,
        modelClass: Proveedor,
        join: {
          from: 'visitadores_medicos.proveedor_id',
          to: 'proveedores.id'
        }
      }
    };
  }
}

module.exports = VisitadorMedico;

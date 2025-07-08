const { Model } = require('objection');

class Calendario extends Model {
  static get tableName() {
    return 'calendario';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['usuario_id', 'titulo', 'estado_id', 'fecha'],

      properties: {
        id: { type: 'integer' },
        usuario_id: { type: 'integer' },
        visitador_id: { type: ['integer', 'null'] },
        titulo: { type: 'string', maxLength: 250 },
        estado_id: { type: 'integer' },
        detalles: { type: ['string', 'null'] },
        fecha: { type: 'string', format: 'date-time' },
        local_id: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    const VisitadorMedico = require('./Visitador_Medico')
    const EstadoCalendario = require('./Estado_Calendario')
    const Local = require('./Local')

    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: 'calendario.usuario_id',
          to: 'usuarios.id'
        }
      },
      visitador: {
        relation: Model.BelongsToOneRelation,
        modelClass: VisitadorMedico,
        join: {
          from: 'calendario.visitador_id',
          to: 'visitadores_medicos.id'
        }
      },
      estado: {
        relation: Model.BelongsToOneRelation,
        modelClass: EstadoCalendario,
        join: {
          from: 'calendario.estado_id',
          to: 'estados_calendarios.id'
        }
      },
      local: {
        relation: Model.BelongsToOneRelation,
        modelClass: Local,
        join: {
          from: 'calendario.local_id',
          to: 'locales.id'
        }
      }
    };
  }
}

module.exports = Calendario;

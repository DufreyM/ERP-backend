const { Model } = require('objection');

class DocumentoLocal extends Model {
  static get tableName() {
    return 'documentos_locales';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre', 'usuario_id', 'archivo', 'local_id'],

      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string', maxLength: 255 },
        usuario_id: { type: 'integer' },
        archivo: { type: 'string' }, 
        local_id: { type: 'integer' },
        creacion: { type: 'string', format: 'date-time' },
        vencimiento: { type: ['string', 'null'], format: 'date' },
        updatedat: { type: ['string', 'null'], format: 'date-time' },
        deletedat: { type: ['string', 'null'], format: 'date-time' },
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    const Local = require('./Local');

    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: 'documentos_locales.usuario_id',
          to: 'usuarios.id'
        }
      },
      local: {
        relation: Model.BelongsToOneRelation,
        modelClass: Local,
        join: {
          from: 'documentos_locales.local_id',
          to: 'locales.id'
        }
      }
    };
  }
}

module.exports = DocumentoLocal;

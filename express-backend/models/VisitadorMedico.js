const { Model, raw } = require('objection');

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
      properties: {
        id: { type: 'integer' },
        proveedor_id: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        usuario_id: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        telefonos: {
          anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }]
        },
        documento_url: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        documento_public_id: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        documento_nombre: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        documento_mime: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        documento_bytes: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        documento_updated_at: { anyOf: [{ type: 'string' }, { type: 'null' }] }
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    const Proveedor = require('./Proveedor');
    const Telefono = require('./Telefono');

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
      },
      telefonos: {
        relation: Model.HasManyRelation,
        modelClass: Telefono,
        join: {
          from: 'visitadores_medicos.id',
          to: 'telefonos.visitador_id'
        }
      }
    };
  }

  // Opcional: un modifier para traer solo los campos que necesitas del usuario
  static get modifiers() {
    return {
      selectUsuarioDatos(builder) {
        builder.select(
          'id',
          'nombre',
          'apellidos',
          'correo',
          'telefono_fijo',
          'telefono_movil',
          'fecha_nacimientoISO'
        );
      }
    };
  }
}

module.exports = VisitadorMedico;

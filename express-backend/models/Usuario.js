const { Model } = require('objection');

class Usuario extends Model {
  static get tableName() {
    return 'usuarios';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre', 'apellidos', 'rol_id', 'email', 'status', 'contrasena', 'fechanacimiento'],
      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string' },
        apellidos: { type: 'string' },
        rol_id: { type: 'integer' },
        email: { type: 'string' },
        status: { type: 'string', enum: ['activo', 'inactivo'] },
        id_local: { type: ['integer', 'null'] }, 
        contrasena: { type: 'string' },
        fechanacimiento: { type: 'string', format: 'date' },
        creacion: { type: 'string', format: 'date-time' },
        token: { type: ['string', 'null'] },
        verificado: { type: 'boolean', default: false },
      }
    };
  }

  static get relationMappings() {
    const Rol = require('./Rol');
    const Local = require('./Local');
    return {
      rol: {
        relation: Model.BelongsToOneRelation,
        modelClass: Rol,
        join: {
          from: 'usuarios.rol_id',
          to: 'roles.id'
        }
      },
      local: {
        relation: Model.BelongsToOneRelation,
        modelClass: Local,
        join: {
          from: 'usuarios.id_local',
          to: 'locales.id'
        }
      }
    };
  }
}

module.exports = Usuario;

const { Model } = require('objection');

class Permiso_Rol extends Model {
  static get tableName() {
    return 'permisos_roles';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['rol_id', 'permiso_id'],
      properties: {
        id: { type: 'integer' },
        rol_id: { type: 'integer' },
        permiso_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings() {
    const Rol = require('./Rol');
    const Permiso = require('./Permiso');

    return {
      permiso: {
        relation: Model.BelongsToOneRelation,
        modelClass: Permiso,
        join: {
          from: 'permisos_roles.permiso_id',
          to: 'permisos.id'
        }
      },
      rol: {
        relation: Model.BelongsToOneRelation,
        modelClass: Rol,
        join: {
          from: 'permisos_roles.rol_id',
          to: 'roles.id'
        }
      }
    };
  }
}

module.exports = Permiso_Rol;

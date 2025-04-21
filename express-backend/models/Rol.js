const { Model } = require('objection');

class Rol extends Model {
  static get tableName() {
    return 'roles';
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
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    return {
      usuarios: {
        relation: Model.HasManyRelation,
        modelClass: Usuario,
        join: {
          from: 'roles.id',
          to: 'usuarios.rol_id'
        }
      }
    };
  }

  static async crearNuevoRol(nombreRol) {
    try {
      const nuevoRol = await this.query().insert({ nombre: nombreRol });
      console.log('Rol creado:', nuevoRol);
      return nuevoRol
    } catch (error) {
      console.error('Error al crear el rol:', error);
      throw error
    }
  }

}

module.exports = Rol;

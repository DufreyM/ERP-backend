const { Model } = require('objection');

class Telefono extends Model {
  static get tableName() {
    return 'telefonos';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['numero', 'tipo'],

      properties: {
        id: { type: 'integer' },
        numero: { type: 'string', minLength: 1, maxLength: 20 },
        tipo: { type: 'string', enum: ['móvil', 'fijo', 'otro'] },
        usuario_id: { type: ['integer', 'null'] },
        proveedor_id: { type: ['integer', 'null'] },
        visitador_id: { type: ['integer', 'null'] },
        cliente_id: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Usuario = require('./Usuario');
    const Proveedor = require('./Proveedor');
    const Visitador = require('./VisitadorMedico');
    const Cliente = require('./Cliente');

    return {
      usuario: {
        relation: Model.BelongsToOneRelation,
        modelClass: Usuario,
        join: {
          from: 'telefonos.usuario_id',
          to: 'usuarios.id'
        }
      },
      proveedor: {
        relation: Model.BelongsToOneRelation,
        modelClass: Proveedor,
        join: {
          from: 'telefonos.proveedor_id',
          to: 'proveedores.id'
        }
      },
      visitador: {
        relation: Model.BelongsToOneRelation,
        modelClass: Visitador,
        join: {
          from: 'telefonos.visitador_id',
          to: 'visitadores_medicos.id'
        }
      },
      cliente: {
        relation: Model.BelongsToOneRelation,
        modelClass: Cliente,
        join: {
          from: 'telefonos.cliente_id',
          to: 'clientes.id'
        }
      }
    };
  }
}

module.exports = Telefono;

const { Model } = require('objection');

class Compra extends Model {
    static get tableName() {
      return 'compras';
    }
  
    static get idColumn() {
      return 'id';
    }
  
    static get jsonSchema() {
      return {
        type: 'object',
        required: ['no_factura', 'usuario_id', 'total', 'credito'],
  
        properties: {
          id: { type: 'integer' },
          no_factura: { type: 'integer' },
          usuario_id: { type: 'integer' },
          proveedor_id: { type: ['integer', 'null'] },
          total: { type: 'number' },
          credito: { type: 'boolean' },
          descripcion: { type: ['string', 'null'] }
        }
      };
    }
  
    static get relationMappings() {
      const Usuario = require('./Usuario');
      const Proveedor = require('./Proveedor');
      const PagoCompra = require('./PagoCompra')
  
      return {
        usuario: {
          relation: Model.BelongsToOneRelation,
          modelClass: Usuario,
          join: {
            from: 'compras.usuario_id',
            to: 'usuarios.id'
          }
        },
        proveedor: {
          relation: Model.BelongsToOneRelation,
          modelClass: Proveedor,
          join: {
            from: 'compras.proveedor_id',
            to: 'proveedores.id'
          }
        },
        pagos: {
          relation: Model.HasManyRelation,
          modelClass: PagoCompra,
          join: {
            from: 'compras.id',
            to: 'pagos_compras.compra_id'
          }
        }
      };
    }
  }
  
  module.exports = Compra
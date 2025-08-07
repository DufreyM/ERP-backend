const { Model } = require('objection');

class VentaDetalle extends Model {
  static get tableName() {
    return 'venta_detalle';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['venta_id', 'producto_id', 'lote_id', 'cantidad', 'precio_unitario', 'subtotal'],
      properties: {
        id: { type: 'integer' },
        venta_id: { type: 'integer' },
        producto_id: { type: 'integer' },
        lote_id: { type: 'integer' },
        cantidad: { type: 'integer' },
        precio_unitario: { type: 'number', minimum: 0 },
        descuento: { type: 'number', minimum: 0 },
        subtotal: { type: 'number', minimum: 0 }
      }
    };
  }

  static get relationMappings() {
    const Venta = require('./Venta');
    const Producto = require('./Producto');
    const Lote = require('./Lote');

    return {
      venta: {
        relation: Model.BelongsToOneRelation,
        modelClass: Venta,
        join: {
          from: 'venta_detalle.venta_id',
          to: 'ventas.id'
        }
      },
      producto: {
        relation: Model.BelongsToOneRelation,
        modelClass: Producto,
        join: {
          from: 'venta_detalle.producto_id',
          to: 'productos.codigo'
        }
      },
      lote: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lote,
        join: {
          from: 'venta_detalle.lote_id',
          to: 'lotes.id'
        }
      }
    };
  }
}

module.exports = VentaDetalle;

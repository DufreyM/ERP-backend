/*  ventasFormatter.js
    Esta función se encarga de transformar los datos de una venta para que sean seguros y adecuados
    al enviarse al frontend. Se deben incluir solo los campos necesarios y omitir cualquier dato sensible.
    
    Si necesitas agregar nuevos campos:
    - Asegúrate de que no expongan información confidencial.
    - Ubícalos en el objeto original y agrégalo explícitamente en la estructura retornada.
    Autor: Melisa Mendizabal 

    Fecha de modificacion: 17/10/2025
*/

function formatVentas(venta) {
  return {
    id: venta.id,
    tipo_pago: venta.tipo_pago,
    total: venta.total,
    cliente_id: venta.cliente_id,
    encargado_id: venta.encargado_id,
    created_at: venta.created_at,

    encargado: {
        id: venta.encargado?.id,
        nombre: venta.encargado?.nombre,
        apellidos: venta.encargado?.apellidos,
        rol_id: venta.encargado?.rol_id,
        id_local: venta.encargado?.id_local,
    },

    cliente: {
        id: venta.cliente?.id,
        nombre: venta.cliente?.nombre,
        nit: venta.cliente?.nit,
        direccion: venta.cliente?.direccion,
        //correo: venta.cliente?.correo
    },

    detalles: venta.detalles?.map(p => ({
        id: p?.id,
        venta_id: p?.venta_id,
        producto_id: p?.producto_id,
        lote_id: p?.lote_id,
        cantidad: p?.cantidad,
        precio_unitario: p?.precio_unitario,
        descuento: p?.descuento,
        subtotal: p?.subtotal,

        producto: {
            codigo: p.producto?.codigo,
            nombre: p.producto?.nombre,
            presentacion: p.producto?.presentacion,
            proveedor_id: p.producto?.proveedor_id,
            precioventa:p.producto?.precioventa,
            preciocosto:p.producto?.preciocosto,
            receta:p.producto?.receta,
            stock_minimo:p.producto?.stock_minimo,
            detalles:p.producto?.detalles,

        },
   
        lote: {
            id: p.lote?.id,
            lote: p.lote?.lote,
            fecha_vencimiento: p.lote?.fecha_vencimiento,
            producto_id: p.lote?.producto_id
        }   
    })),

  };
}


module.exports = {
  formatVentas,
};
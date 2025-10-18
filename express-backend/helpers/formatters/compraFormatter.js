/*  compraFormatter.js
    Esta función se encarga de transformar los datos de una compra para que sean seguros y adecuados
    al enviarse al frontend. Se deben incluir solo los campos necesarios y omitir cualquier dato sensible.
    
    Si necesitas agregar nuevos campos:
    - Asegúrate de que no expongan información confidencial.
    - Ubícalos en el objeto original y agrégalo explícitamente en la estructura retornada.
    Autor: Melisa Mendizabal 

    Fecha de modificacion: 17/10/2025
*/

function formatCompra(compra) {
  return {
    id: compra.id,
    no_factura: compra.no_factura,
    credito: compra.credito,
    total: compra.total,
    descripcion: compra.descripcion,
    usuario: {
        id: compra.usuario?.id,
        nombre: compra.usuario?.nombre,
        apellidos: compra.usuario?.apellidos,
        rol_id: compra.usuario?.rol_id,
        id_local: compra.usuario?.id_local,
    },

    proveedor: {
        id: compra.proveedor?.id,
        nombre: compra.proveedor?.nombre,
        direccion: compra.proveedor?.direccion,
        correo: compra.proveedor?.correo
    },

    pagos: compra.pagos?.map(p => ({
        id: p?.id,
        estado: p?.estado,
        fecha: p?.fecha,

    })),


    productos: compra.productos?.map(p => ({
        id: p?.id,
        cantidad: p?.cantidad,
        precio_venta: p?.precio_venta,
        precio_costo: p?.precio_costo,
        fecha: p?.fecha,
        lote: {
            id: p.lote?.id,
            lote: p.lote?.lote,
            fecha_vencimiento: p.lote?.fecha_vencimiento,
            producto: {
                codigo: p.lote?.producto?.codigo,
                nombre: p.lote?.producto?.nombre,
                presentacion: p.lote?.producto?.presentacion,
                receta: p.lote?.producto?.receta,
                stock_minimo: p.lote?.producto?.stock_minimo,
                detalles: p.lote?.producto?.detalles,
                imagen: p.lote?.producto?.imagen,
            }
        }
    })),

  };
}


module.exports = {
  formatCompra,
};
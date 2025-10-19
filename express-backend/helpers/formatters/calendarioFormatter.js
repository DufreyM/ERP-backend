/*  calendarioFormatter.js
    Esta función se encarga de transformar los datos de las funciones de get de eventos para que sean seguros y adecuados
    al enviarse al frontend. Se deben incluir solo los campos necesarios y omitir cualquier dato sensible.
    
    Si necesitas agregar nuevos campos:
    - Asegúrate de que no expongan información confidencial.
    - Ubícalos en el objeto original y agrégalo explícitamente en la estructura retornada.
    Autor: Melisa Mendizabal 

    Fecha de modificacion: 15/10/2025
*/

//eventos completos
function formatCalendario(evento) {
  return {
    id: evento.id,
    usuario_id: evento.usuario_id,
    visitador_id: evento.visitador_id,
    titulo: evento.titulo,
    estado_id: evento.estado_id,
    detalles: evento.detalles,
    fecha: evento.fecha,
    tipo_evento_id: evento.tipo_evento_id,

    estado: {
      id: evento.estado?.id,
      nombre: evento.estado?.nombre
    },

    usuario: {
      id: evento.usuario?.id,
      nombre: evento.usuario?.nombre,
      apellidos: evento.usuario?.apellidos,
      rol_id: evento.usuario?.rol_id,
      id_local: evento.usuario?.id_local
    },

    visitador: {
      id: evento.visitador?.id,
      proveedor_id: evento.visitador?.proveedor_id,
      usuario_id: evento.visitador?.usuario_id,
      telefonos: evento.visitador?.telefonos || []
    },

    local: {
      id: evento.local?.id
    }
  };
}

//filtra entre los que coinciden con notificaciones y tareas
function formatCalendarioNotificaciones(notificacion) {
  return {
    id: notificacion.id,
    usuario_id: notificacion.usuario_id,
    visitador_id: notificacion.visitador_id,
    titulo: notificacion.titulo,
    estado_id: notificacion.estado_id,
    detalles: notificacion.detalles,
    fecha: notificacion.fecha,
    tipo_evento_id: notificacion.tipo_evento_id,

    estado: {
      id: notificacion.estado?.id,
      nombre: notificacion.estado?.nombre
    },

    local: {
      id: notificacion.local?.id
    },

    usuario: {
      id: notificacion.usuario?.id,
      nombre: notificacion.usuario?.nombre,
      apellidos: notificacion.usuario?.apellidos,
      rol_id: notificacion.usuario?.rol_id,
      id_local: notificacion.usuario?.id_local
    }
  };
}



module.exports = {
  formatCalendarioNotificaciones,
  formatCalendario
};
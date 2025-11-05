function formatVisitador(visitador) {
  return {
    id: visitador.id,
    proveedor_id: visitador.proveedor_id,
    usuario_id: visitador.usuario_id,
    telefonos: visitador.telefonos || [],
    documento_url: visitador.documento_url,
    documento_public_id: visitador.documento_public_id,
    documento_nombre: visitador.documento_nombre,
    documento_mime: visitador.documento_mime,
    documento_bytes: visitador.documento_bytes,
    documento_updated_at: visitador.documento_updated_at,
    proveedor: visitador.proveedor ? {
      id: visitador.proveedor.id,
      nombre: visitador.proveedor.nombre,
      direccion: visitador.proveedor.direccion,
      correo: visitador.proveedor.correo,
      telefono: visitador.proveedor.telefono
    } : null,
    usuario: visitador.usuario ? {
      id: visitador.usuario.id,
      nombre: visitador.usuario.nombre,
      apellidos: visitador.usuario.apellidos,
      correo: visitador.usuario.correo,
      status: visitador.usuario.status,
      rol_id: visitador.usuario.rol_id,
      id_local: visitador.usuario.id_local
    } : null
  };
}


module.exports = {
  formatVisitador,
};
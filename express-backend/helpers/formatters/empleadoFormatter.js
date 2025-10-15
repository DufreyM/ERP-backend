/*  compraFormatter.js
    Esta función se encarga de transformar los datos de una compra para que sean seguros y adecuados
    al enviarse al frontend. Se deben incluir solo los campos necesarios y omitir cualquier dato sensible.
    
    Si necesitas agregar nuevos campos:
    - Asegúrate de que no expongan información confidencial.
    - Ubícalos en el objeto original y agrégalo explícitamente en la estructura retornada.
    Autor: Melisa Mendizabal 

    Fecha de modificacion: 17/10/2025
*/

function formatEmpleado(empleado) {
  return {
    id: empleado.id,
    nombre: empleado.nombre,
    apellidos: empleado.apellidos,
    rol_id: empleado.rol_id,
    email: empleado.email,
    status: empleado.status,
    id_local: empleado.id_local,
    fechanacimiento: empleado.fechanacimiento,
    creacion: empleado.creacion,
    verificado: empleado.verificado,
    foto_perfil: empleado.foto_perfil,
    foto_public_id: empleado.foto_public_id,
    local: {
      id: empleado.local?.id,
      administrador_id: empleado.local?.administrador_id,
      nombre: empleado.local?.nombre,
      direccion: empleado.local?.direccion,
      nit_emisor: empleado.local?.nit_emisor
    },
    rol: {
      id: empleado.rol?.id,
      nombre: empleado.rol?.nombre
    }
  };
}

module.exports = {
  formatEmpleado,
};
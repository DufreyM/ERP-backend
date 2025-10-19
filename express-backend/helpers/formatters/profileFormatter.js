/*  profileFormatter.js
    Esta función se encarga de transformar los datos del empleado para que sean seguros y adecuados
    al enviarse al frontend. Se deben incluir solo los campos necesarios y omitir cualquier dato sensible.
    
    Si necesitas agregar nuevos campos:
    - Asegúrate de que no expongan información confidencial.
    - Ubícalos en el objeto original y agrégalo explícitamente en la estructura retornada.
    Autor: Melisa Mendizabal 

    Fecha de modificacion: 15/10/2025
*/

function formatProfile(usuario) {
  return {
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    email: usuario.email,
    status: usuario.status,
    fechanacimiento: usuario.fechanacimiento,
    // quité la contraseña
  };
}

module.exports = {
  formatProfile,
};

AlTER TABLE permisos ADD COLUMN modulo VARCHAR(50);
TRUNCATE permisos_roles RESTART IDENTITY;
TRUNCATE permisos RESTART IDENTITY CASCADE;

INSERT INTO permisos (nombre,descripcion,modulo) VALUES 
--Auth y perfil
('ver_perfil','Ver datos personales del usuario','Autenticacion y Perfil'),
('editar_perfil','Editar datos personales y contraseña','Autenticacion y Perfil'),
--Dashboard
('ver_dashboard_general','Acceso al panel principal de indicadores','Dashboard'),
('ver_dashboard_vendedor','Acceso al dashboard limitado de ventas propias (para vendedores)','Dashboard'),
('ver_dashboard_inventario','Ver indicadores de stock y alertas de productos bajos','Dashboard'),
--Ventas
('ver_todas_ventas','Ver todas las ventas registradas por local','Ventas'),
('crear_venta','Registrar una nueva venta','Ventas'),
('cancelar_venta','Cancelar la venta creada y no registrarla en la base de datos','Ventas'),
('ver_detalle_venta','Ver detalle individual de una venta','Ventas'),
('agregar_receta','Subir un archivo .png o .pdf con la receta médica','Ventas'),
('aplicar_descuento','Aplicar un descuento a la venta (maximo segun rol)','Ventas'),
--Clientes
('ver_clientes','Ver listado de clientes','Clientes'),
('crear_cliente','Registar un nuevo cliente','Clientes'),
('editar_cliente','Editar datos de los clientes','Clientes'),
('eliminar_cliente','Modificar la casilla de cliente de activo a inactivo','Clientes'),
--Productos e inventario
('ver_inventario','Ver el stock de productos','Productos e Inventario'),
('agregar_producto','Agregar nuevos productos','Productos e Inventario'),
('editar_producto','Modificar datos de productos','Productos e Inventario'),
('eliminar_producto','Eliminar productos del catálogo (cambiar la columna de activo a false)','Productos e Inventario'),
('ver_historial_movimientos','Ver entradas/salidas de inventario','Productos e Inventario'),
('registrar_entrada_producto','Registrar ingreso de stock','Productos e Inventario'),
('registrar_salida_producto','Registrar salida de stock manual','Productos e Inventario'),
('traslado_producto','Traslado de producto entre locales','Productos e Inventario'),
--Categorías y presentaciones
('ver_categorias','Ver categorías de productos.','Categorías y Presentaciones'),
('crear_categoria','Crear nuevas categorías.','Categorías y Presentaciones'),
('editar_categoria','Editar una categoría.','Categorías y Presentaciones'),
('eliminar_categoria','Eliminar una categoría, (Cambiar la columna de activo a false).','Categorías y Presentaciones'),
('ver_presentaciones','Ver tipos de presentación (mg, tabletas, etc.).','Categorías y Presentaciones'),
('crear_presentacion','Crear presentaciones nuevas.','Categorías y Presentaciones'),
-- Visitadores médicos
('ver_visitadores_medicos','Ver lista de proveedores.','Visitadores médicos'),
('crear_visitador_medico','Registrar un nuevo proveedor.','Visitadores médicos'),
('editar_visitador_medico','Editar proveedor existente.','Visitadores médicos'),
('subir_archivo_productos','Permite subir su catálogo en formato pdf.','Visitadores médicos'),
-- Compras
('ver_compras','Ver historial de compras a proveedores.','Compras'),
('registrar_compra','Registrar una nueva compra.','Compras'),
('editar_compra','Editar una compra antes de confirmarla.','Compras'),
-- Reportes
('ver_reportes_ventas','Generar reportes de ventas.','Reportes'),
('ver_reportes_compras','Generar reportes de compras.','Reportes'),
('ver_reportes_inventario','Ver reportes de stock e inventario.','Reportes'),
('ver_reportes_utilidad','Reportes de margen de ganancia.','Reportes'),
-- Usuarios y Roles
('ver_usuarios','Ver todos los usuarios del sistema.','Usuarios y Roles'),
('crear_usuario','Crear un nuevo usuario.','Usuarios y Roles'),
('editar_usuario','Editar datos de usuario.','Usuarios y Roles'),
('eliminar_usuario','Eliminar usuario (Cambiar la columna de activo a false).','Usuarios y Roles'),
('ver_roles','Ver los roles del sistema.','Usuarios y Roles'),
('asignar_permisos','Editar o asignar permisos a roles (activo/inactivo).','Usuarios y Roles'),
-- Logs
('ver_logs','Ver historial de acciones realizadas por los usuarios (bitácora).','Logs'),
('ver_actividad_usuario','Ver acciones específicas de un usuario determinado (filtrado).','Logs'),
-- Química Farmacéutica
('ver_documentos_sanitarios','Ver y descargar los documentos relevantes (facturas, movimientos, etc).','Química Farmacéutica'),
('subir_licencia_sanitaria','Subir o actualizar la licencia de la farmacia.','Química Farmacéutica'),
-- Citas Visitadores
('ver_citas_visitadores','Ver citas agendadas con visitadores médicos.','Citas Visitadores'),
('agendar_cita_visitador','Registrar una nueva cita con un visitador.','Citas Visitadores'),
('editar_cita_visitador','Editar detalles de una cita ya registrada.','Citas Visitadores'),
('cancelar_cita_visitador','Eliminar una cita agendada (Cambiar la columna de activo a false).','Citas Visitadores'),
('confirmar_cita_visitador','Confirmar la asistencia a una cita.','Citas Visitadores'),
('cancelar_compra','Cancela la compra, evitando que se agregue a la BD una vez iniciada la solicitud (rollback).','Compras');

-- SECCION DE TABLA DE CRUCE
INSERT INTO roles (nombre) VALUES ('Química Farmacéutica');

INSERT INTO permisos_roles (rol_id, permiso_id) VALUES
(1,3),
(1,1),
(1,2),
(1,6),
(1,7),
(1,8),
(1,9),
(1,10),
(1,12),
(1,13),
(1,14),
(1,15),
(1,16),
(1,17),
(1,18),
(1,19),
(1,21),
(1,22),
(1,20),
(1,24),
(1,25),
(1,26),
(1,27),
(1,28),
(1,29),
(1,30),
(1,31),
(1,32),
--no se agrega el "eliminar visitador medico"
(1,34),
(1,35),
(1,36),
(1,56),
(1,37),
(1,38),
(1,39),
(1,40),
(1,41),
(1,42),
(1,43),
(1,44),
(1,45),
(1,46),
--no se agregan dos relacionados a "configuracion"
(1,47),
(1,48),
(1,52),
(1,51),
(1,53),
(1,11),
(1,54),
--dependiente
(2,4),
(2,1),
(2,7),
(2,8),
(2,6),
(2,9),
(2,10),
(2,12),
(2,13),
(2,14),
(2,16),
(2,24),
(2,28),
(2,16), --limitarlo
(2,11), --limitarlo
--visitador 
(3,1),
(3,51), --limitarlo
(3,33),
--contador
(4,3),
(4,37),
(4,38),
(4,39),
(4,40),
(4,6),
(4,34),
--quimica
(5,3),
(5,49),
(5,50);


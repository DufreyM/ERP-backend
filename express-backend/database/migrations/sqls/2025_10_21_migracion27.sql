-- ===============================================
-- MIGRACIÓN 27 - NORMALIZACIÓN DE MODULOS Y PERMISOS
-- Fecha: 2025-10-21
-- ===============================================

-- 1️⃣ Crear tabla de módulos
CREATE TABLE modulos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    descripcion TEXT
);

-- 2️⃣ Poblar tabla módulos con las secciones existentes
INSERT INTO modulos (nombre, ruta, descripcion) VALUES
('Autenticacion y Perfil', '/auth', 'Módulo de autenticación y perfil de usuario'),
('Dashboard', '/dashboard', 'Panel de control e indicadores'),
('Ventas', '/ventas', 'Gestión de ventas del sistema'),
('Clientes', '/clientes', 'Módulo de clientes'),
('Productos e Inventario', '/api/productos', 'Inventario y catálogo de productos'),
('Categorías y Presentaciones', '/api/productos/categorias', 'Clasificación y presentación de productos'),
('Visitadores médicos', '/visitadores', 'Gestión de proveedores/visitadores médicos'),
('Compras', '/compras', 'Registro y control de compras'),
('Reportes', '/reportes', 'Reportes de ventas, compras e inventario'),
('Usuarios y Roles', '/api/roles', 'Gestión de usuarios y roles del sistema'),
('Logs', '/logs', 'Historial y auditoría de acciones'),
('Química Farmacéutica', '/documentos-locales', 'Módulo sanitario y documentos legales'),
('Citas Visitadores', '/api/calendario', 'Gestión de citas con visitadores médicos'),
('Permisos', '/api/permisos', 'Gestión de permisos que se tienen en el sistema.');

-- 3️⃣ Agregar columna modulo_id a permisos y establecer FK
ALTER TABLE permisos ADD COLUMN modulo_id INTEGER;
ALTER TABLE permisos
ADD CONSTRAINT fk_modulo_permiso FOREIGN KEY (modulo_id)
REFERENCES modulos(id) ON DELETE SET NULL;

-- 4️⃣ Migrar los datos del campo "modulo" actual hacia "modulo_id"
UPDATE permisos p
SET modulo_id = m.id
FROM modulos m
WHERE p.modulo = m.nombre;

-- 5️⃣ Eliminar columna obsoleta
ALTER TABLE permisos DROP COLUMN modulo;

-- ===============================================
-- DOWN: revertir cambios
-- ===============================================
-- (El DOWN se define en el JS)

INSERT INTO permisos (nombre, descripcion, modulo_id) VALUES
-- Permisos para permisos jaja
('ver_modulos', 'Ver todos los módulos del sistema', 14),
('ver_permisos', 'Ver listado completo de permisos del sistema', 14),
('crear_permiso', 'Crear nuevos permisos en el sistema', 14),
('editar_permiso', 'Editar la descripción o nombre de un permiso existente', 14),
('eliminar_permiso', 'Eliminar permisos obsoletos', 14),

-- Permisos para calendario
('ver_calendario', 'Ver el calendario de eventos', 13),
('crear_evento', 'Crear nuevos eventos en el calendario', 13),
('editar_evento', 'Editar eventos existentes', 13),
('eliminar_evento', 'Eliminar eventos del calendario', 13),
('ver_notificaciones', 'Ver notificaciones del sistema', 13),
('ver_tareas', 'Ver tareas pendientes', 13),

-- Permisos para movimientos de inventario
('registrar_movimiento', 'Registrar movimientos de inventario', 13);

INSERT INTO permisos_roles (rol_id, permiso_id) VALUES 
(1, 57),
(1, 58),
(1, 59),
(1, 60),
(1, 61);
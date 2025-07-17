-- 1. Modificar la tabla Calendario para incluir tipo de evento
ALTER TABLE Calendario 
ADD COLUMN tipo_evento VARCHAR(20) NOT NULL DEFAULT 'visita',
ADD CONSTRAINT chk_tipo_evento CHECK (tipo_evento IN ('visita', 'notificacion', 'tarea'));

-- 2. Crear VIEW para notificaciones (como sugeriste)
CREATE VIEW vw_notificaciones_recientes AS
SELECT 
    'promocion' as origen,
    id,
    titulo,
    descripcion as detalles,
    fecha_creacion as fecha,
    local_id,
    NULL as visitador_id,
    usuario_creador_id as usuario_id
FROM promociones
WHERE fecha_creacion >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'inventario' as origen,
    i.id,
    CONCAT('Actualización de inventario: ', p.nombre) as titulo,
    CONCAT('Cantidad cambiada a: ', i.cantidad) as detalles,
    i.fecha_actualizacion as fecha,
    i.local_id,
    NULL as visitador_id,
    i.usuario_id
FROM inventario i
JOIN productos p ON i.producto_id = p.id
WHERE i.fecha_actualizacion >= NOW() - INTERVAL '7 days';

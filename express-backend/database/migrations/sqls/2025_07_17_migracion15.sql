-- Añadir columna para el tipo de evento
ALTER TABLE Calendario 
ADD COLUMN tipo_evento VARCHAR(50) NOT NULL DEFAULT 'visita_medica',
ADD COLUMN fecha_eliminado TIMESTAMP NULL;

-- Crear tabla para tipos de eventos si queremos mantenerlos normalizados
CREATE TABLE Tipos_Evento_Calendario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO Tipos_Evento_Calendario (nombre) VALUES 
('visita_medica'),
('notificacion'),
('tarea');

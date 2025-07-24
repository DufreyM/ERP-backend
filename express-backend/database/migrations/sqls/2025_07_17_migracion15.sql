--correcion 24/07/25 por Renato R.

-- Crear tabla para tipos de eventos si queremos mantenerlos normalizados
CREATE TABLE Tipos_Evento_Calendario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO Tipos_Evento_Calendario (nombre) VALUES 
('visita_medica'),
('notificacion'),
('tarea');

ALTER TABLE Calendario 
ADD COLUMN tipo_evento_id INT NOT NULL DEFAULT 2,
ADD COLUMN fecha_eliminado TIMESTAMP NULL;

ALTER TABLE Calendario
ADD CONSTRAINT fk_tipo_evento
FOREIGN KEY (tipo_evento_id)
REFERENCES Tipos_Evento_Calendario(id);

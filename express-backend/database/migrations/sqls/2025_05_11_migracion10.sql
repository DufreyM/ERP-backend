ALTER TABLE visitadores_medicos ADD COLUMN usuario_id INT;

ALTER TABLE visitadores_medicos
ADD CONSTRAINT fk_visitador_usuario FOREIGN KEY (usuario_id)
REFERENCES usuarios(id);

ALTER TABLE visitadores_medicos
DROP COLUMN IF EXISTS nombre,
DROP COLUMN IF EXISTS correo;

SELECT * FROM usuarios u
JOIN roles r ON r.id = u.rol_id
WHERE r.nombre = 'Visitador Médico';

SELECT * FROM visitadores_medicos;

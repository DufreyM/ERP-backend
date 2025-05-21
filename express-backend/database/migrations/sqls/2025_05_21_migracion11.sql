--se puede cambiar el local desde acá
--truncarlo en producción

INSERT INTO usuarios (nombre, apellidos, rol_id, email, status, id_local, contrasena, fechanacimiento, token, verificado)
VALUES 
('Leonardo', 'Mejía Mejía', 1, 'leomejia646@gmail.com', 'activo', 1, '$2a$10$NwNUR55cY33S1hRwtCyXpu0HFC5uTmxN47Sdoqets5zFa0D/THnU6', '2004-09-01', null, true),
('Daniela', 'Ramirez de León', 2, 'dannyramirez21546@gmail.com', 'activo',1,'$2a$10$c1IMSp02s57HX7sDe27y0eOZslZ21i5p/fkAzJRAxyq7XRg8k5T4K','2004-09-01', null, true),
('María', 'Girón Isidro', 3, 'mariajosegironisidro@gmail.com', 'activo',null,'$2a$10$haPWkUsEj2bMlY4UA08JX.EZF0putXnttQFrBQsrUATPZNequrKMy', '2004-02-01',null, true),
('Melisa', 'Mendizabal Meléndez', 4,'melisadmendizabal@gmail.com', 'activo',1,'$2a$10$OrAKFBZzyocNbT/kGlXGWOWYLJ1by27EH7cq97VKaPlGsAO.YXtCm','2005-01-01', null, true),
('Renato', 'Rojas Roldan',5,'dartarojas@gmail.com','activo',1,'$2a$10$6uZ9oHSp.Jmee4WhTrGdXur4Gig5bT5tWX8ApR9H6fFrMLn0ZO40q','2005-03-01',null, true);

INSERT INTO visitadores_medicos (proveedor_id, usuario_id) VALUES (15, (SELECT id from usuarios where email = 'mariajosegironisidro@gmail.com')); --el 15 es trivial
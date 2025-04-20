UPDATE usuarios SET local = '2' WHERE id = 3;
UPDATE usuarios SET local = '1' WHERE id = 4;
UPDATE usuarios SET local = '2' WHERE id = 5;
UPDATE usuarios SET local = '1' WHERE id = 6;
UPDATE usuarios SET local = '2' WHERE id = 7;
UPDATE usuarios SET local = '1' WHERE id = 8;
UPDATE usuarios SET local = '2' WHERE id = 9;
UPDATE usuarios SET local = '1' WHERE id = 10;



ALTER TABLE usuarios
RENAME COLUMN local TO id_local;

ALTER TABLE usuarios
ADD CONSTRAINT usuarios_id_local_fkey
FOREIGN KEY (id_local)
REFERENCES locales (id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;

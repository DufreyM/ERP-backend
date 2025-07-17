ALTER TABLE documentos_locales 
ADD COLUMN updatedAt TIMESTAMP,--tambien se podria crear un trigger, para que cuando se actualice a nivel de BD se realice el cambio (o se maneja en back)
ADD COLUMN deletedAt TIMESTAMP; 

--08/07/2025. Para el manejo de locales en pestañas, para las tablas (2) que les hacía falta 
ALTER TABLE calendario 
ADD COLUMN local_id INTEGER,
ADD constraint calendario_localid_fkey FOREIGN KEY (local_id) REFERENCES locales(id);


ALTER TABLE promociones_producto 
ADD COLUMN local_id INTEGER,
ADD constraint calendario_localid_fkey FOREIGN KEY (local_id) REFERENCES locales(id);

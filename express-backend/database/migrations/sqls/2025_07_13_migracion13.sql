--Esto es para probar el formato de Inventario, para corroborar que sí se pueden tener valores negativos en 'cantidad' (además de hacer nullables precio_venta precio_costo)
ALTER TABLE inventario 
ALTER COLUMN precio_venta DROP NOT NULL,
ALTER COLUMN precio_costo DROP NOT NULL;

INSERT INTO tipos_movimientos_inventario (nombre) VALUES ('Venta');
INSERT INTO ventas (cliente_id,total,tipo_pago) VALUES (5,400.00,'efectivo');
INSERT INTO inventario (lote_id, cantidad, tipo_movimiento_id, venta_id, precio_venta, local_id, encargado_id) 
VALUES (10, -10, 6, 11, 40.00, 1, 13);

ALTER TABLE productos 
ADD imagen TEXT;

-- Vaciar tabla de tipos de movimientos
TRUNCATE TABLE Inventario CASCADE;
TRUNCATE TABLE Tipos_Movimientos_Inventario RESTART IDENTITY CASCADE;

-- Reiniciar ID a 1 (opcional)
ALTER SEQUENCE tipos_movimientos_inventario_id_seq RESTART WITH 1;

-- Insertar tipos permitidos
INSERT INTO Tipos_Movimientos_Inventario (nombre) VALUES
  ('entrada'),
  ('salida');

-- Insertar lotes para productos:
INSERT INTO lotes (id, producto_id, lote, fecha_vencimiento)
VALUES
  (1, 1, 'LOTE-001', '2024-12-31'),
  (2, 2, 'LOTE-002', '2024-06-30');

-- Simular inventario con movimientos de entrada y salida:
-- Entradas (compras)
INSERT INTO inventario (lote_id, cantidad, tipo_movimiento_id, precio_venta, precio_costo, local_id, encargado_id)
VALUES
  (1, 100, 1, 120.00, 90.00, 1, 1),  -- 100 unidades entrada para producto 1
  (2, 50, 1, 200.00, 150.00, 1, 1);  -- 50 unidades entrada para producto 2

-- Salidas (ventas)
INSERT INTO inventario (lote_id, cantidad, tipo_movimiento_id, precio_venta, precio_costo, local_id, encargado_id)
VALUES
  (1, 30, 2, 120.00, 90.00, 1, 1),  -- 30 unidades salida para producto 1
  (2, 10, 2, 200.00, 150.00, 1, 1); 
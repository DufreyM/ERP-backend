CREATE TABLE venta_detalle (
  id SERIAL PRIMARY KEY,
  venta_id INT NOT NULL REFERENCES ventas(id),
  producto_id INT NOT NULL,
  lote_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10, 2) NOT NULL,
  descuento NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2) NOT NULL
);
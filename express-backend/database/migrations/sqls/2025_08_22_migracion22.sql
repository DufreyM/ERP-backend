-- ventas: quién la hizo y cuándo se creó
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS encargado_id INTEGER REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- opcional si aún no lo tienes: fecha auto en inventario
ALTER TABLE inventario
  ADD COLUMN IF NOT EXISTS fecha TIMESTAMPTZ NOT NULL DEFAULT NOW();

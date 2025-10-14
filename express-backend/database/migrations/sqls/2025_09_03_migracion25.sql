-- Migración: agregar telefonos y documento único a visitadores_medicos

-- Agregar columna telefonos (jsonb para múltiples números)
ALTER TABLE visitadores_medicos
ADD COLUMN IF NOT EXISTS telefonos JSONB DEFAULT '[]';

-- Agregar columnas para manejar un documento único
ALTER TABLE visitadores_medicos
ADD COLUMN IF NOT EXISTS documento_url TEXT,
ADD COLUMN IF NOT EXISTS documento_public_id TEXT,
ADD COLUMN IF NOT EXISTS documento_nombre TEXT,
ADD COLUMN IF NOT EXISTS documento_mime TEXT DEFAULT 'application/pdf',
ADD COLUMN IF NOT EXISTS documento_bytes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS documento_updated_at TIMESTAMP;

-- Datos de prueba (opcional)
UPDATE visitadores_medicos
SET telefonos = '["50255554444", "50244443333"]'
WHERE id = 1;

UPDATE visitadores_medicos
SET documento_url = 'https://res.cloudinary.com/demo/documento.pdf',
    documento_public_id = 'visitadores/doc1',
    documento_nombre = 'CV Visitador.pdf',
    documento_bytes = 120000,
    documento_updated_at = NOW()
WHERE id = 1;

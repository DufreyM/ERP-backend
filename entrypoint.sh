#!/bin/sh
set -e

echo "🔄 Esperando a que la base de datos esté lista…"
# Espera a que Postgres responda antes de migrar
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 1
done

echo "🔄 Ejecutando migraciones con Knex…"
npm run migrate -- --knexfile ./express-backend/database/knexfile.js

echo "🚀 Iniciando servidor Express…"
exec npm start

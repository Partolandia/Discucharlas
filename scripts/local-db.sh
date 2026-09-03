#!/usr/bin/env bash
# Reconstruye una base local (Postgres simple + stub de Supabase) para validar
# migraciones y políticas RLS sin necesidad de Docker.
set -euo pipefail
PORT="${PGPORT_LOCAL:-54322}"
PSQL="psql -h /tmp -p $PORT -U postgres -q -v ON_ERROR_STOP=1"

$PSQL -c "drop database if exists discucharlas_test;" -d postgres
$PSQL -c "create database discucharlas_test;" -d postgres

DB="psql -h /tmp -p $PORT -U postgres -d discucharlas_test -q -v ON_ERROR_STOP=1"
$DB -f supabase/tests/00_supabase_stub.sql
for f in supabase/migrations/*.sql; do
  echo "  -> $(basename "$f")"
  $DB -f "$f"
done
echo "Base local lista en discucharlas_test (puerto $PORT)."

#!/usr/bin/env bash
# Reconstruye una base local (Postgres simple + stub de Supabase) para validar
# migraciones y políticas RLS sin necesidad de Docker.
set -euo pipefail
PORT="${PGPORT_LOCAL:-54322}"
PGDIR="${PGDATA_LOCAL:-/home/postgres/pgdata}"
BIN=/usr/lib/postgresql/16/bin
PSQL="psql -h /tmp -p $PORT -U postgres -q -v ON_ERROR_STOP=1"

# Arranca el Postgres de trabajo si no está corriendo (contenedor efímero).
if ! pg_isready -h /tmp -p "$PORT" -q 2>/dev/null; then
  id -u postgres >/dev/null 2>&1 || useradd -m -s /bin/bash postgres
  if [ ! -f "$PGDIR/PG_VERSION" ]; then
    mkdir -p "$PGDIR" && chown -R postgres:postgres "$(dirname "$PGDIR")"
    su postgres -c "$BIN/initdb -D $PGDIR -U postgres --auth=trust" >/dev/null
  fi
  su postgres -c "$BIN/pg_ctl -D $PGDIR -l $PGDIR/server.log -o '-p $PORT -k /tmp' start" >/dev/null
  until pg_isready -h /tmp -p "$PORT" -q; do sleep 1; done
fi

$PSQL -c "drop database if exists discucharlas_test;" -d postgres
$PSQL -c "create database discucharlas_test;" -d postgres

DB="psql -h /tmp -p $PORT -U postgres -d discucharlas_test -q -v ON_ERROR_STOP=1"
$DB -f supabase/tests/00_supabase_stub.sql
for f in supabase/migrations/*.sql; do
  echo "  -> $(basename "$f")"
  $DB -f "$f"
done
echo "Base local lista en discucharlas_test (puerto $PORT)."

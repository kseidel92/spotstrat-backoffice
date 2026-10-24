#!/usr/bin/env bash
# Cria/atualiza o schema Postgres do SpotStrat (tabelas do backoffice + API).
# Uso:
#   ./scripts/setup-db.sh
#   DATABASE_URL=postgres://... ./scripts/setup-db.sh
#   ./scripts/setup-db.sh --check
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA="$ROOT/db/schema.sql"
CHECK=0
for arg in "$@"; do
  case "$arg" in
    --check) CHECK=1 ;;
    -h|--help)
      sed -n '2,7p' "$0"
      exit 0
      ;;
  esac
done

read_env_var() {
  local key="$1" file="$2"
  [[ -f "$file" ]] || return 1
  local line
  line="$(rg -m1 "^${key}=" "$file" 2>/dev/null || true)"
  [[ -n "$line" ]] || return 1
  line="${line#*=}"
  line="${line%\"}"
  line="${line#\"}"
  line="${line%\'}"
  line="${line#\'}"
  printf '%s' "$line"
}

if [[ -z "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(read_env_var DATABASE_URL "$ROOT/.env" || true)"
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(read_env_var DATABASE_URL "$ROOT/../apis/.env" || true)"
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Defina DATABASE_URL (env, backoffice/.env ou ../apis/.env)." >&2
  exit 1
fi
export DATABASE_URL

if [[ ! -f "$SCHEMA" ]]; then
  echo "Schema ausente: $SCHEMA" >&2
  exit 1
fi

run_psql() {
  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 "$@"
    return
  fi
  # Fallback: cliente dentro do container Docker da API
  if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx 'tradeai-postgres'; then
    local db_user db_name
    db_user="$(read_env_var POSTGRES_USER "$ROOT/../apis/.env" || echo tradeai)"
    db_name="$(read_env_var POSTGRES_DB "$ROOT/../apis/.env" || echo tradeai)"
    if [[ "$1" == "-f" ]]; then
      docker exec -i tradeai-postgres psql -U "$db_user" -d "$db_name" -v ON_ERROR_STOP=1 < "$2"
    else
      docker exec -i tradeai-postgres psql -U "$db_user" -d "$db_name" -v ON_ERROR_STOP=1 "$@"
    fi
    return
  fi
  echo "psql não encontrado e container tradeai-postgres não está up." >&2
  echo "Instale o cliente PostgreSQL ou: cd ../apis && docker compose up -d postgres" >&2
  exit 1
}

echo "[setup-db] conectando…"
run_psql -c 'SELECT current_database() AS db, current_user AS role;'

if [[ "$CHECK" -eq 1 ]]; then
  echo "[setup-db] tabelas relevantes:"
  run_psql -c "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'users','prompts','jobs','purchases','production_orders',
        'cancellation_requests','outbound_messages','strategy_help_reports',
        'messages','threads'
      )
    ORDER BY 1;
  "
  echo "[setup-db] colunas extras de prompts:"
  run_psql -c "
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prompts'
      AND column_name IN ('http_status','error_stage','error_raw','provider','duration_ms')
    ORDER BY 1;
  "
  exit 0
fi

echo "[setup-db] aplicando $SCHEMA"
if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA"
else
  docker exec -i tradeai-postgres \
    psql -U "$(read_env_var POSTGRES_USER "$ROOT/../apis/.env" || echo tradeai)" \
         -d "$(read_env_var POSTGRES_DB "$ROOT/../apis/.env" || echo tradeai)" \
         -v ON_ERROR_STOP=1 < "$SCHEMA"
fi
echo "[setup-db] ok."
echo "  Próximo: API (npm start em ../apis) + npm run dev neste repo."
echo "  Conferir: ./scripts/setup-db.sh --check"

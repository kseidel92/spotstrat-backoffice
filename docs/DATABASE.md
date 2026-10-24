# Banco de dados (Postgres) — SpotStrat Backoffice

O backoffice **não tem banco próprio**. Ele lê os mesmos dados da API SpotStrat via `GET /v1/admin/*` (só localhost). Este repo guarda o **schema SQL** e um script para criar/atualizar as tabelas.

## Pré-requisitos

- PostgreSQL 14+ (16 recomendado)
- Cliente `psql` **ou** container Docker `tradeai-postgres` (a API sobe com `docker compose`)
- `DATABASE_URL` apontando para o mesmo banco da API

Exemplo (Docker Compose da API):

```bash
# em tradeai/apis
docker compose up -d postgres
```

`DATABASE_URL` tipicamente em `../apis/.env`, por exemplo:

```env
DATABASE_URL=postgres://tradeai:SENHA@127.0.0.1:5432/tradeai
```

## Criar / atualizar o schema

Na pasta do backoffice:

```bash
chmod +x scripts/setup-db.sh
npm run db:setup
# ou
./scripts/setup-db.sh
```

O script:

1. Lê `DATABASE_URL` de (nesta ordem): env → `backoffice/.env` → `../apis/.env`
2. Aplica `db/schema.sql` com `psql` (idempotente)

Conferir:

```bash
./scripts/setup-db.sh --check
```

Manual:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

A API também roda o mesmo schema no boot (`migrate()` em `apis/src/db.js`). O script do backoffice serve para ambientes novos, CI ou quando você quer garantir o banco **antes** de subir a API.

## Tabelas que o backoffice usa

| Tabela | Uso no painel |
|--------|----------------|
| `users` | Usuários, planos, trial |
| `prompts` | Todos os prompts + HTTP + `error_raw` / `error_stage` |
| `jobs` | Fila LLM/worker (falhas) |
| `purchases` | Assinaturas |
| `production_orders` | Pedidos de produção |
| `cancellation_requests` | Cancelamentos / reembolso |
| `outbound_messages` | E-mails enviados (verify, reset, alarm, owner) |
| `strategy_help_reports` | Balão de ajuda |
| `messages` / `threads` | Chat recente |

### Colunas importantes em `prompts`

| Coluna | Significado |
|--------|-------------|
| `http_status` | Status HTTP do aceite (ex.: 202 enfileirado, 400/429 rejeitado) |
| `status` | `queued`, `running`, `created`, `failed`, `rejected`, `needs_user`, … |
| `error_stage` | `http` · `worker` · `response` |
| `error_raw` | Stack / causa técnica (não só a mensagem amigável) |
| `detail` | Texto mostrado ao usuário ou resumo |
| `provider` | Provedor LLM, quando houver |
| `duration_ms` | Tempo até finalizar o job |

## Fluxo recomendado (máquina local)

```bash
# 1) Postgres
cd ../apis && docker compose up -d postgres

# 2) Schema
cd ../backoffice && npm run db:setup

# 3) API (porta 7171)
cd ../apis && npm start

# 4) Backoffice (só 127.0.0.1:7173)
cd ../backoffice && npm run dev
```

Abra http://127.0.0.1:7173

## Segurança

- Schema e dados são do produto; o painel só é seguro porque a API restringe `/v1/admin` a **localhost**.
- Não exponha `7173` nem a API admin na internet.
- Opcional: `BACKOFFICE_TOKEN` na API + `VITE_BACKOFFICE_TOKEN` no Vite.

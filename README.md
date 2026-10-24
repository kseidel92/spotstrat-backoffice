# SpotStrat Backoffice

Painel interno (React + Redux Toolkit) para administrar prompts, usuários, pagamentos e mensagens.

Repositório: https://github.com/kseidel92/spotstrat-backoffice

## Segurança

- Vite escuta só em **`127.0.0.1:7173`**
- Rotas `/v1/admin/*` na API rejeitam qualquer IP que não seja localhost
- Opcional: `BACKOFFICE_TOKEN` na API e `VITE_BACKOFFICE_TOKEN` neste app

## Banco de dados

O painel usa o **mesmo Postgres da API**. Schema e script:

```bash
npm run db:setup          # cria/atualiza tabelas
./scripts/setup-db.sh --check
```

Documentação completa: [docs/DATABASE.md](docs/DATABASE.md) · SQL: [db/schema.sql](db/schema.sql)

## Subir

```bash
# 1) Postgres + schema
cd ../apis && docker compose up -d postgres
cd ../backoffice && npm run db:setup

# 2) API
cd ../apis && npm start

# 3) Backoffice
cd ../backoffice
npm install
npm run dev
```

Abra http://127.0.0.1:7173

## O que você vê

| Página | Fonte |
|--------|--------|
| Visão geral | contagens de users, prompts, fila, receita, e-mails |
| Prompts | tabela `prompts` + job (HTTP, status, `error_raw`, stage) |
| Jobs | fila `jobs` (falhas do worker/LLM) |
| Usuários | `users` |
| Pagamentos | `purchases`, `production_orders`, `cancellation_requests` |
| Mensagens | `outbound_messages`, `strategy_help_reports`, chat `messages` |

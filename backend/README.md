# Power BI Agent Platform — Backend

FastAPI API for Request lifecycle, Agent Runs, Request Events, and Approval Gates. Phase 1 uses a Mock Pipeline only.

## Prerequisites

- Python 3.11+
- Docker (for PostgreSQL via repo-root `docker-compose.yml`)

## Setup

From the repository root:

```bash
docker compose up -d postgres
```

From `backend/`:

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -e .
cp ../.env.example ../.env
```

## Run migrations

From `backend/` with venv active:

```bash
alembic upgrade head
```

## Run

From `backend/` with the virtual environment active:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify:

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

Interactive docs: http://localhost:8000/docs

## Environment

Copy `.env.example` from the repo root to `.env` and adjust if needed. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `API_HOST` | Bind host (default `0.0.0.0`) |
| `API_PORT` | Bind port (default `8000`) |
| `CORS_ORIGINS` | Comma-separated allowed origins (default `http://localhost:3000`) |
| `SEED_ON_STARTUP` | Seed demo Requests on startup (default `true`) |
| `LANGFUSE_PUBLIC_KEY` | Optional Langfuse public key |
| `LANGFUSE_SECRET_KEY` | Optional Langfuse secret key |

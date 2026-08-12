# AI Power BI Agent Platform

Platform for managing Power BI solution requests with AI agent orchestration and human-in-the-loop approval.

**Repository:** https://github.com/IWill29/powerbi.ai

## Status

**Phase 1 (MVP):** Application scaffold in place — FastAPI backend, Next.js dashboard shell, PostgreSQL via Docker. Mock agent pipeline not yet implemented.

## Quick start

### Prerequisites

- Docker Desktop (PostgreSQL)
- Python 3.11+
- Node.js 20+

### 1. Database

```powershell
docker compose up -d postgres
copy .env.example .env
```

### 2. Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: http://localhost:8000/health → `{"status":"ok"}`

### 3. Frontend (Next.js)

```powershell
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Project structure

```
backend/     FastAPI API (Phase 1 mock pipeline)
frontend/    Next.js dashboard
docs/        Architecture, ADRs, MVP spec
```

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](./AGENTS.md) | Instructions for AI agents |
| [CONTEXT.md](./CONTEXT.md) | Domain glossary |
| [docs/spec/mvp-scope.md](./docs/spec/mvp-scope.md) | MVP boundaries |
| [docs/architecture/system-overview.md](./docs/architecture/system-overview.md) | System architecture |
| [docs/agents/git-workflow.md](./docs/agents/git-workflow.md) | Branching and PR workflow |

## Stack

- Next.js 16, React 19, shadcn/ui, Tailwind v4 *(AGENTS.md targets Next.js 15 — pin if strict alignment needed)*
- FastAPI (Python)
- LangGraph, Langfuse (Phase 2 orchestrator)
- PostgreSQL

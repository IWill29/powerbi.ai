# Agent Instructions

Instructions for AI agents (Cursor, Copilot, etc.) working in this repository.

## Before you do anything

1. Read `CONTEXT.md` for domain terms — use them exactly.
2. Read `docs/spec/mvp-scope.md` — only build what is in scope.
3. Read `docs/spec/out-of-scope.md` — do not touch these areas.
4. Read `docs/agents/git-workflow.md` before creating branches or PRs.
5. Check open issues: see `docs/agents/issue-tracker.md`.

## Project stack (do not substitute)

- **Frontend:** Next.js 15, React 19, shadcn/ui, Tailwind v4
- **Backend:** FastAPI (Python) — see ADR-0002
- **Agent orchestration:** LangGraph — see ADR-0001
- **Observability:** Langfuse
- **Database:** PostgreSQL
- **Power BI output:** PBIP format only; real generation is Phase 2 — see ADR-0004

## Workflow rules

- Every feature starts from an issue — do not implement unrequested features.
- Human approval (HITL) is mandatory before any deliver action — never skip. See ADR-0003.
- Sub-agents do not deploy; only the orchestrator routes to deploy after approval.
- Minimize diff scope — do not refactor unrelated code.
- Follow branching and PR rules in `docs/agents/git-workflow.md`.
- Do not create commits or PRs unless the user explicitly asks.

## Where things live

| Concern | Location |
|---------|----------|
| Domain terms | `CONTEXT.md` |
| MVP boundaries | `docs/spec/mvp-scope.md` |
| Out of scope | `docs/spec/out-of-scope.md` |
| Architecture | `docs/architecture/` |
| Decisions | `docs/adr/` |
| Git / PR workflow | `docs/agents/git-workflow.md` |
| Tests | `tests/` |
| Eval datasets | `evals/` |

## Agent skills

### Issue tracker

GitHub Issues in this repository. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. See `docs/agents/domain.md`.

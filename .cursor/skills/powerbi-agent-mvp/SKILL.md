---
name: powerbi-agent-mvp
description: Power BI agent platform MVP — request intake, agent timeline, HITL approval. Use when working on this project.
---

# Power BI Agent MVP

## Read first

1. `AGENTS.md`
2. `docs/spec/mvp-scope.md`
3. `docs/spec/out-of-scope.md`
4. `CONTEXT.md`
5. `docs/agents/git-workflow.md` (before branches or PRs)

## Phase 1 mock pipeline

```
intake → requirements (mock) → [Gate 1] → build (mock) →
code-review (mock) → validation (mock) → [Gate 2] → complete
```

## Do not

- Integrate real Power BI skills until Phase 2
- Skip approval gates
- Build features outside `mvp-scope.md`
- Open PRs or commits without user request

## Stack

Next.js 15 + FastAPI + PostgreSQL + LangGraph (Phase 2) + Langfuse

See ADRs in `docs/adr/` for decisions.

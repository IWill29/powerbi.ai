# System overview

## Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dashboard (Next.js)                       │
│  Request list │ Request detail │ Timeline │ Approval inbox      │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST + WebSocket/SSE
┌────────────────────────────▼────────────────────────────────────┐
│                      API (FastAPI)                               │
│  /requests │ /approvals │ /events │ /agent-runs                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────┐
│  PostgreSQL   │   │  Orchestrator   │   │   Langfuse    │
│  requests     │   │  (LangGraph)    │   │   traces      │
│  events       │   │  mock → real    │   │               │
│  approvals    │   └────────┬────────┘   └───────────────┘
└───────────────┘            │
                    ┌────────┴────────┐
                    ▼                 ▼
            Sub-agents (Phase 2)   Approval Gates (HITL)
            requirements           interrupt → UI → resume
            code-review
            validation
```

## Data flow (Phase 1 mock)

1. User submits Request via dashboard
2. API creates Request record, starts Mock Pipeline
3. Mock Pipeline emits Request Events to timeline
4. Pipeline pauses at Approval Gate 1 → Reviewer acts in inbox
5. Pipeline continues, emits more events
6. Pipeline pauses at Approval Gate 2 → Reviewer acts
7. Request status set to `completed` or `rejected`

## Repository layout (target)

```
ai-powerbiaps/
├── frontend/          # Next.js dashboard
├── backend/           # FastAPI API + agent layer
├── docs/              # Project documentation
├── tests/             # pytest + Playwright
├── evals/             # Golden datasets (Phase 2)
└── .cursor/           # Cursor rules and skills
```

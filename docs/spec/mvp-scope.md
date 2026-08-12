# MVP Scope

## Phase 1 — In scope

Build these for the MVP dashboard and mock agent pipeline:

- [x] Request intake form (title, description, client reference)
- [x] Request list view with status filters
- [x] Request detail view with metadata
- [x] Agent activity timeline (real-time events via WebSocket or SSE)
- [x] Approval inbox (approve / reject / request info)
- [x] Mock agent pipeline (simulated orchestrator steps)
- [x] PostgreSQL schema: `requests`, `request_events`, `approvals`, `agent_runs`
- [x] FastAPI backend with REST API
- [x] Next.js frontend dashboard
- [x] Langfuse trace integration (basic)
- [x] Project documentation and Cursor rules (this repo scaffold)

## Phase 2 — Not MVP (do not build until explicitly requested)

- Real Power BI PBIP generation
- Power BI Modeling MCP / Desktop Bridge
- Fabric Git deployment
- LangGraph production orchestrator (beyond mock)
- Authentication and RBAC
- Multi-tenant support
- Email or Slack notifications

## Definition of done (Phase 1)

A user can:

1. Submit a Request via the dashboard
2. See simulated agent activity on a timeline
3. Approve or reject at two Approval Gates
4. See the Request reach a final status

No real Power BI artifact generation is required for Phase 1.

## Issue mapping

Each in-scope item should have a GitHub issue before implementation. Reference the issue number in branch names and PR descriptions.

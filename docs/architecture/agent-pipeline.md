# Agent pipeline

## Phase 1 — Mock pipeline

```
intake
  → requirements (simulated, ~2s delay)
  → [Approval Gate 1: requirements]
  → build (simulated)
  → code-review (simulated)
  → validation (simulated)
  → [Approval Gate 2: delivery]
  → complete | rejected
```

Each step creates a `Request Event` with: `agent_name`, `event_type`, `payload`, `timestamp`.

## Phase 2 — Real pipeline (planned)

```
intake
  → Requirements Sub-agent (LLM + schema validation)
  → [Approval Gate 1]
  → Design Sub-agent (design brief)
  → Build Sub-agent (PBIP generation via Skills for Fabric)
  → Code Review Sub-agent (Tabular Editor BPA rules)
  → Validation Sub-agent (requirements match + screenshot)
  → [Approval Gate 2]
  → deploy to test Fabric workspace
  → complete
```

## Sub-agent boundaries

| Sub-agent | Input | Output | May NOT |
|-----------|-------|--------|---------|
| Requirements | Request description | Structured requirements JSON | Deploy, skip gates |
| Code Review | PBIP artifacts | Findings list with severity | Modify artifacts |
| Validation | Requirements + artifacts | Pass/fail + rubric score | Deploy |
| Orchestrator | Request state | Routes, enforces gates | Generate PBIP directly |

Sub-agents never call each other. The orchestrator routes all transitions.

## LangGraph nodes (Phase 2)

Planned node names (use exactly in code):

- `intake`
- `requirements_agent`
- `approval_gate_requirements`
- `design_agent`
- `build_agent`
- `code_review_agent`
- `validation_agent`
- `approval_gate_delivery`
- `complete`

## Event types

| event_type | Meaning |
|------------|---------|
| `step_started` | Sub-agent began work |
| `step_completed` | Sub-agent finished successfully |
| `step_failed` | Sub-agent error |
| `approval_required` | Pipeline paused for human |
| `approval_received` | Human decision recorded |
| `pipeline_completed` | Request finished |

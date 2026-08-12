# Power BI Agent Platform

Platform where customers submit Power BI solution requests, an AI agent builds the solution, and a human approves before delivery.

## Language

**Request**:
A customer order to build a Power BI solution. Has a lifecycle from intake to delivery.
_Avoid_: Ticket, order, job

**Agent Run**:
One execution of the orchestrator pipeline for a single Request.
_Avoid_: Session, job, task

**Approval Gate**:
A mandatory human checkpoint where the pipeline pauses until a human approves or rejects.
_Avoid_: Review step, checkpoint

**Sub-agent**:
A specialized agent node (requirements, code-review, validation) — not autonomous; routed by the orchestrator.
_Avoid_: Worker, bot, assistant

**Orchestrator**:
The top-level LangGraph workflow that routes between sub-agents and enforces approval gates.
_Avoid_: Main agent, supervisor, manager

**Solution**:
The Power BI artifacts (PBIP) produced for a Request.
_Avoid_: Output, deliverable

**Request Event**:
An immutable timeline entry recording what an agent did during a run.
_Avoid_: Log, activity, trace

**Reviewer**:
A human who approves or rejects at an Approval Gate.
_Avoid_: Approver, admin, operator

**Client**:
The organization or person who submitted the Request.
_Avoid_: Customer, user, pasūtītājs (use in UI copy only, not in code or docs)

**Mock Pipeline**:
Phase 1 agent flow that simulates steps without generating real Power BI artifacts.
_Avoid_: Fake agent, stub workflow

"""LangGraph Mock Pipeline with interrupt() at Approval Gates."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Literal, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.types import Command, interrupt
from sqlalchemy.orm import Session, joinedload

from app.core.database import SessionLocal
from app.models import (
    AgentRun,
    AgentRunStatus,
    Approval,
    ApprovalDecision,
    Request,
    RequestStatus,
)
from app.observability.langfuse import trace_pipeline_step
from app.services.events import create_request_event
from app.services.gate_evidence import build_gate_detail
from app.services.ids import next_agent_run_id, next_approval_id

_checkpointer = MemorySaver()
_pipeline_lock = asyncio.Lock()
_running_tasks: dict[str, asyncio.Task[None]] = {}


class PipelineState(TypedDict, total=False):
    request_id: str
    agent_run_id: str
    gate1_decision: str | None
    gate2_decision: str | None


async def _delay(seconds: float) -> None:
    await asyncio.sleep(seconds)


def _emit_step(request_id: str, agent_run_id: str, node: str) -> None:
    db = SessionLocal()
    try:
        _record_agent_step(db, request_id, agent_run_id, node)
        db.commit()
    finally:
        db.close()


async def _requirements_node(state: PipelineState) -> PipelineState:
    await _delay(2.0)
    _emit_step(state["request_id"], state["agent_run_id"], "requirements_agent")
    return state


async def _gate1_node(state: PipelineState) -> PipelineState:
    decision = interrupt({"gate": 1})
    return {**state, "gate1_decision": decision}


async def _build_node(state: PipelineState) -> PipelineState:
    await _delay(1.5)
    _emit_step(state["request_id"], state["agent_run_id"], "build_agent")
    return state


async def _code_review_node(state: PipelineState) -> PipelineState:
    await _delay(1.0)
    _emit_step(state["request_id"], state["agent_run_id"], "code_review_agent")
    return state


async def _validation_node(state: PipelineState) -> PipelineState:
    await _delay(1.0)
    _emit_step(state["request_id"], state["agent_run_id"], "validation_agent")
    return state


async def _gate2_node(state: PipelineState) -> PipelineState:
    decision = interrupt({"gate": 2})
    return {**state, "gate2_decision": decision}


def _route_gate1(state: PipelineState) -> Literal["build", "requirements", "reject"]:
    decision = state.get("gate1_decision") or "approve"
    if decision == "reject":
        return "reject"
    if decision == "request_changes":
        return "requirements"
    return "build"


def _route_gate2(state: PipelineState) -> Literal["complete", "build", "reject"]:
    decision = state.get("gate2_decision") or "approve"
    if decision == "reject":
        return "reject"
    if decision == "request_changes":
        return "build"
    return "complete"


def _build_graph():
    graph = StateGraph(PipelineState)
    graph.add_node("requirements_agent", _requirements_node)
    graph.add_node("approval_gate_requirements", _gate1_node)
    graph.add_node("build_agent", _build_node)
    graph.add_node("code_review_agent", _code_review_node)
    graph.add_node("validation_agent", _validation_node)
    graph.add_node("approval_gate_delivery", _gate2_node)

    graph.set_entry_point("requirements_agent")
    graph.add_edge("requirements_agent", "approval_gate_requirements")
    graph.add_conditional_edges(
        "approval_gate_requirements",
        _route_gate1,
        {"build": "build_agent", "requirements": "requirements_agent", "reject": END},
    )
    graph.add_edge("build_agent", "code_review_agent")
    graph.add_edge("code_review_agent", "validation_agent")
    graph.add_edge("validation_agent", "approval_gate_delivery")
    graph.add_conditional_edges(
        "approval_gate_delivery",
        _route_gate2,
        {"complete": END, "build": "build_agent", "reject": END},
    )
    return graph.compile(checkpointer=_checkpointer)


_graph = _build_graph()


def _update_request(db: Session, request: Request, status: RequestStatus, gate: int | None) -> None:
    request.status = status.value
    request.current_gate = gate
    request.updated_at = datetime.now(timezone.utc)


def _open_gate(db: Session, request_id: str, gate_number: int) -> None:
    request = db.query(Request).options(joinedload(Request.approvals)).get(request_id)
    if request is None:
        return
    approval = (
        db.query(Approval)
        .filter(Approval.request_id == request_id, Approval.gate_number == gate_number)
        .first()
    )
    if approval is None:
        evidence = build_gate_detail(request, gate_number)
        approval = Approval(
            id=next_approval_id(db),
            request_id=request_id,
            gate_number=gate_number,
            status=ApprovalDecision.PENDING.value,
            evidence_payload=evidence.model_dump(mode="json"),
        )
        db.add(approval)
    else:
        approval.status = ApprovalDecision.PENDING.value
        approval.reviewer = None
        approval.reviewer_notes = None
        approval.decided_at = None
        evidence = build_gate_detail(request, gate_number)
        approval.evidence_payload = evidence.model_dump(mode="json")
    _update_request(db, request, RequestStatus.APPROVAL_GATE, gate_number)
    agent_run = (
        db.query(AgentRun)
        .filter(AgentRun.request_id == request_id)
        .order_by(AgentRun.started_at.desc())
        .first()
    )
    if agent_run:
        agent_run.status = AgentRunStatus.PAUSED.value
    message = (
        "Approval Gate 1 opened — requirements evidence pack ready"
        if gate_number == 1
        else "Approval Gate 2 opened — awaiting Reviewer (pre-delivery)"
    )
    create_request_event(
        db,
        request_id=request_id,
        agent_name="Orchestrator",
        event_type="approval_required",
        message=message,
        payload={"gate_number": gate_number},
    )


def _record_agent_step(db: Session, request_id: str, agent_run_id: str, node: str) -> None:
    messages = {
        "requirements_agent": (
            "requirements_agent",
            "step_completed",
            "Requirements sub-agent completed intake analysis",
        ),
        "build_agent": (
            "build_agent",
            "step_completed",
            "Build sub-agent generated mock Solution layout",
        ),
        "code_review_agent": (
            "code_review_agent",
            "step_completed",
            "Code-review sub-agent completed PBIP structure review",
        ),
        "validation_agent": (
            "validation_agent",
            "step_completed",
            "Validation sub-agent passed Solution checks",
        ),
    }
    if node not in messages:
        return
    agent_name, event_type, message = messages[node]
    create_request_event(
        db,
        request_id=request_id,
        agent_name=agent_name,
        event_type=event_type,
        message=message,
        payload={"agent_run_id": agent_run_id, "node": node},
    )


async def _execute_graph(request_id: str, agent_run_id: str, thread_id: str, *, resume: str | None = None) -> None:
    config = {"configurable": {"thread_id": thread_id}}
    initial: PipelineState = {"request_id": request_id, "agent_run_id": agent_run_id}

    if resume is not None:
        input_value: Command | PipelineState = Command(resume=resume)
    else:
        input_value = initial

    with trace_pipeline_step(request_id=request_id, agent_run_id=agent_run_id, step="pipeline"):
        await _graph.ainvoke(input_value, config=config)

    while True:
        snapshot = await _graph.aget_state(config)
        if snapshot.next:
            interrupts = snapshot.tasks[0].interrupts if snapshot.tasks else []
            gate_number = interrupts[0].value.get("gate", 1) if interrupts else 1
            db = SessionLocal()
            try:
                _open_gate(db, request_id, gate_number)
                db.commit()
            finally:
                db.close()
            return

        db = SessionLocal()
        try:
            request = db.get(Request, request_id)
            agent_run = db.get(AgentRun, agent_run_id)
            if request is None or agent_run is None:
                return

            values = snapshot.values
            gate1 = values.get("gate1_decision")
            gate2 = values.get("gate2_decision")

            if gate1 == "reject" or gate2 == "reject":
                _update_request(db, request, RequestStatus.REJECTED, None)
                agent_run.status = AgentRunStatus.REJECTED.value
                agent_run.completed_at = datetime.now(timezone.utc)
                create_request_event(
                    db,
                    request_id=request_id,
                    agent_name="Orchestrator",
                    event_type="pipeline_completed",
                    message="Request rejected at Approval Gate",
                )
                db.commit()
                return

            _update_request(db, request, RequestStatus.DELIVERED, None)
            agent_run.status = AgentRunStatus.COMPLETED.value
            agent_run.completed_at = datetime.now(timezone.utc)
            create_request_event(
                db,
                request_id=request_id,
                agent_name="Orchestrator",
                event_type="pipeline_completed",
                message="Solution approved and marked Delivered",
            )
            db.commit()
            return
        finally:
            db.close()


async def _run_pipeline(request_id: str, agent_run_id: str, thread_id: str) -> None:
    db = SessionLocal()
    try:
        request = db.get(Request, request_id)
        agent_run = db.get(AgentRun, agent_run_id)
        if request and agent_run:
            _update_request(db, request, RequestStatus.AGENT_RUN, None)
            agent_run.status = AgentRunStatus.RUNNING.value
            create_request_event(
                db,
                request_id=request_id,
                agent_name="Orchestrator",
                event_type="step_started",
                message=f"Agent Run {agent_run_id} started (Mock Pipeline)",
                payload={"agent_run_id": agent_run_id},
            )
            db.commit()
    finally:
        db.close()

    try:
        await _execute_graph(request_id, agent_run_id, thread_id)
    finally:
        _running_tasks.pop(request_id, None)


async def start_pipeline(request_id: str) -> str:
    """Start Mock Pipeline for a Request."""
    async with _pipeline_lock:
        if request_id in _running_tasks and not _running_tasks[request_id].done():
            raise RuntimeError("Pipeline already running")

        db = SessionLocal()
        try:
            agent_run_id = next_agent_run_id(db)
            thread_id = f"{request_id}:{agent_run_id}"
            agent_run = AgentRun(
                id=agent_run_id,
                request_id=request_id,
                status=AgentRunStatus.RUNNING.value,
                thread_id=thread_id,
            )
            db.add(agent_run)
            db.commit()
        finally:
            db.close()

        task = asyncio.create_task(_run_pipeline(request_id, agent_run_id, thread_id))
        _running_tasks[request_id] = task
        return agent_run_id


async def resume_pipeline(
    request_id: str,
    *,
    gate_number: int,
    decision: str,
    reviewer: str,
    notes: str | None,
) -> None:
    """Resume Mock Pipeline after Reviewer decision."""
    db = SessionLocal()
    try:
        agent_run = (
            db.query(AgentRun)
            .filter(AgentRun.request_id == request_id)
            .order_by(AgentRun.started_at.desc())
            .first()
        )
        if agent_run is None or not agent_run.thread_id:
            raise ValueError("No Agent Run found")

        approval = (
            db.query(Approval)
            .filter(Approval.request_id == request_id, Approval.gate_number == gate_number)
            .first()
        )
        if approval is None:
            raise ValueError("Approval Gate not found")

        approval.status = decision
        approval.reviewer = reviewer
        approval.reviewer_notes = notes
        approval.decided_at = datetime.now(timezone.utc)

        create_request_event(
            db,
            request_id=request_id,
            agent_name="Reviewer",
            event_type="approval_received",
            message=f"Approval Gate {gate_number} {decision} by Reviewer",
            payload={"gate_number": gate_number, "decision": decision},
        )

        request = db.get(Request, request_id)
        if request:
            _update_request(db, request, RequestStatus.AGENT_RUN, None)
        agent_run.status = AgentRunStatus.RUNNING.value
        db.commit()
        thread_id = agent_run.thread_id
        agent_run_id = agent_run.id
    finally:
        db.close()

    async with _pipeline_lock:
        task = asyncio.create_task(
            _resume_and_continue(request_id, agent_run_id, thread_id, decision)
        )
        _running_tasks[request_id] = task


async def _resume_and_continue(
    request_id: str, agent_run_id: str, thread_id: str, decision: str
) -> None:
    try:
        await _execute_graph(request_id, agent_run_id, thread_id, resume=decision)
    finally:
        _running_tasks.pop(request_id, None)

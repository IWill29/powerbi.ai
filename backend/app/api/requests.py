"""Request REST API routes."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sse_starlette.sse import EventSourceResponse

from app.core.database import SessionLocal, get_db
from app.models import AgentRun, Request, RequestEvent, RequestStatus
from app.schemas.request import (
    DashboardStats,
    RequestCreate,
    RequestDetail,
    RequestEventOut,
    RequestSummary,
)
from app.services.events import create_request_event, subscribe, unsubscribe
from app.services.ids import next_request_id
from app.services.pipeline import start_pipeline

router = APIRouter(prefix="/requests", tags=["requests"])


def _event_kind(event_type: str) -> str:
    if event_type in {"approval_required", "approval_received"}:
        return "gate"
    if event_type in {"pipeline_completed", "step_started"} and "Agent Run" in event_type:
        return "system"
    if event_type == "step_started":
        return "system"
    return "agent"


def _to_summary(request: Request) -> RequestSummary:
    latest_run = request.agent_runs[-1] if request.agent_runs else None
    return RequestSummary(
        id=request.id,
        title=request.title,
        client=request.client_reference,
        status=request.status,
        updated_at=request.updated_at,
        created_at=request.created_at,
        submitted_by=request.submitted_by,
        agent_run=latest_run.id if latest_run else None,
        current_gate=request.current_gate,
    )


def _to_event(event: RequestEvent) -> RequestEventOut:
    kind = "system" if event.agent_name == "Orchestrator" and event.event_type == "step_started" else _event_kind(event.event_type)
    if event.message.startswith("Request created"):
        kind = "system"
    if event.message.startswith("Agent Run"):
        kind = "system"
    return RequestEventOut(
        id=event.id,
        request_id=event.request_id,
        message=event.message,
        timestamp=event.timestamp,
        kind=kind,  # type: ignore[arg-type]
        agent_name=event.agent_name,
        event_type=event.event_type,
    )


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStats:
    active = (
        db.query(Request)
        .filter(Request.status.in_([RequestStatus.INTAKE.value, RequestStatus.AGENT_RUN.value, RequestStatus.APPROVAL_GATE.value]))
        .count()
    )
    pending = db.query(Request).filter(Request.status == RequestStatus.APPROVAL_GATE.value).count()
    today = datetime.now(timezone.utc).date()
    runs_today = db.query(AgentRun).filter(AgentRun.started_at >= datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)).count()
    return DashboardStats(
        active_requests=active,
        pending_approvals=pending,
        agent_runs_today=runs_today,
        avg_gate_minutes=4,
    )


@router.post("", response_model=RequestDetail, status_code=201)
async def create_request(
    payload: RequestCreate,
    db: Session = Depends(get_db),
) -> RequestDetail:
    request_id = next_request_id(db)
    request = Request(
        id=request_id,
        title=payload.title,
        description=payload.description,
        client_reference=payload.client_reference,
        submitted_by=payload.submitted_by,
        status=RequestStatus.INTAKE.value,
    )
    db.add(request)
    create_request_event(
        db,
        request_id=request_id,
        agent_name="Orchestrator",
        event_type="step_started",
        message="Request created — Intake phase started",
        payload={"title": payload.title},
    )
    db.commit()
    db.refresh(request)

    asyncio.create_task(start_pipeline(request_id))

    return RequestDetail(
        **_to_summary(request).model_dump(),
        description=request.description,
    )


@router.get("", response_model=list[RequestSummary])
def list_requests(
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[RequestSummary]:
    query = db.query(Request).options(joinedload(Request.agent_runs)).order_by(Request.updated_at.desc())
    if status:
        query = query.filter(Request.status == status)
    return [_to_summary(r) for r in query.all()]


@router.get("/{request_id}", response_model=RequestDetail)
def get_request(request_id: str, db: Session = Depends(get_db)) -> RequestDetail:
    request = (
        db.query(Request)
        .options(joinedload(Request.agent_runs))
        .filter(Request.id == request_id)
        .first()
    )
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return RequestDetail(**_to_summary(request).model_dump(), description=request.description)


@router.get("/{request_id}/events", response_model=list[RequestEventOut])
def list_request_events(request_id: str, db: Session = Depends(get_db)) -> list[RequestEventOut]:
    if db.get(Request, request_id) is None:
        raise HTTPException(status_code=404, detail="Request not found")
    events = (
        db.query(RequestEvent)
        .filter(RequestEvent.request_id == request_id)
        .order_by(RequestEvent.timestamp.asc())
        .all()
    )
    return [_to_event(e) for e in events]


@router.get("/{request_id}/events/stream")
async def stream_request_events(request_id: str, db: Session = Depends(get_db)) -> EventSourceResponse:
    if db.get(Request, request_id) is None:
        raise HTTPException(status_code=404, detail="Request not found")

    queue = subscribe(request_id)

    async def event_generator():
        try:
            initial_db = SessionLocal()
            try:
                events = (
                    initial_db.query(RequestEvent)
                    .filter(RequestEvent.request_id == request_id)
                    .order_by(RequestEvent.timestamp.asc())
                    .all()
                )
                for event in events:
                    yield {
                        "event": "request_event",
                        "data": json.dumps(_to_event(event).model_dump(mode="json")),
                    }
            finally:
                initial_db.close()

            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield {"event": "request_event", "data": json.dumps(payload)}
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": ""}
        finally:
            unsubscribe(request_id, queue)

    return EventSourceResponse(event_generator())

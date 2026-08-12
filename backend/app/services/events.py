"""Utilities for creating Request Events and broadcasting updates."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models import RequestEvent

_event_subscribers: dict[str, list[asyncio.Queue[dict[str, Any]]]] = {}


def _event_kind(event_type: str) -> str:
    if event_type in {"approval_required", "approval_received"}:
        return "gate"
    if event_type in {"pipeline_completed"}:
        return "system"
    return "agent"


def next_event_id(db: Session) -> str:
    """Generate sequential event IDs."""
    count = db.query(RequestEvent).count()
    return f"EVT-{4400 + count + 1}"


def create_request_event(
    db: Session,
    *,
    request_id: str,
    agent_name: str,
    event_type: str,
    message: str,
    payload: dict[str, Any] | None = None,
) -> RequestEvent:
    """Append an immutable Request Event."""
    event = RequestEvent(
        id=next_event_id(db),
        request_id=request_id,
        agent_name=agent_name,
        event_type=event_type,
        message=message,
        payload=payload,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(event)
    db.flush()
    _broadcast_event(request_id, event)
    return event


def _broadcast_event(request_id: str, event: RequestEvent) -> None:
    """Push event to SSE subscribers."""
    payload = {
        "id": event.id,
        "request_id": event.request_id,
        "message": event.message,
        "timestamp": event.timestamp.isoformat(),
        "kind": _event_kind(event.event_type),
        "agent_name": event.agent_name,
        "event_type": event.event_type,
    }
    for queue in _event_subscribers.get(request_id, []):
        try:
            queue.put_nowait(payload)
        except asyncio.QueueFull:
            pass


def subscribe(request_id: str) -> asyncio.Queue[dict[str, Any]]:
    """Register an SSE subscriber for a Request."""
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=100)
    _event_subscribers.setdefault(request_id, []).append(queue)
    return queue


def unsubscribe(request_id: str, queue: asyncio.Queue[dict[str, Any]]) -> None:
    """Remove an SSE subscriber."""
    subscribers = _event_subscribers.get(request_id, [])
    if queue in subscribers:
        subscribers.remove(queue)
    if not subscribers and request_id in _event_subscribers:
        del _event_subscribers[request_id]

"""Pydantic schemas for Request API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RequestCreate(BaseModel):
    """Payload for creating a new Request."""

    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    client_reference: str = Field(min_length=1, max_length=128)
    submitted_by: str = Field(min_length=1, max_length=128)


class RequestSummary(BaseModel):
    """Request list item."""

    id: str
    title: str
    client: str
    status: str
    updated_at: datetime
    created_at: datetime
    submitted_by: str
    agent_run: str | None = None
    current_gate: int | None = None

    model_config = {"from_attributes": True}


class RequestDetail(RequestSummary):
    """Full Request detail."""

    description: str


class RequestEventOut(BaseModel):
    """Timeline event for a Request."""

    id: str
    request_id: str
    message: str
    timestamp: datetime
    kind: Literal["agent", "gate", "system"]
    agent_name: str
    event_type: str

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    """Aggregate dashboard metrics."""

    active_requests: int
    pending_approvals: int
    agent_runs_today: int
    avg_gate_minutes: int

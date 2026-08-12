"""Pydantic schemas for Approval Gate API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ApprovalDecide(BaseModel):
    """Reviewer decision payload."""

    decision: Literal["approve", "reject", "request_changes"]
    reviewer: str = Field(default="Reviewer", min_length=1, max_length=128)
    notes: str | None = None


class ApprovalInboxItem(BaseModel):
    """Pending Approval Gate inbox row."""

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


class EvidenceItem(BaseModel):
    id: str
    category: Literal["dataSource", "kpi", "openQuestion"]
    title: str
    detail: str


class ApprovalWarning(BaseModel):
    id: str
    severity: Literal["info", "warning"]
    message: str


class CorrectionDiff(BaseModel):
    id: str
    field: str
    before: str
    after: str
    reason: str
    business_impact: str | None = None


class MockPreviewBlock(BaseModel):
    type: Literal["kpi", "bar", "table"]
    label: str
    value: str | None = None
    bars: list[dict[str, str | int]] | None = None
    rows: list[str] | None = None


class MockPreview(BaseModel):
    title: str
    subtitle: str
    blocks: list[MockPreviewBlock]


class DecisionSummary(BaseModel):
    verdict: Literal["approve", "approve_with_warning", "reject", "needs_changes"]
    verdict_label: str
    correction_count: int
    warning_count: int
    blocker_count: int
    summary_text: str


class ValidationChecklistItem(BaseModel):
    id: str
    label: str
    status: Literal["pass", "pass_with_warning", "fail"]
    detail: str | None = None


class ActivityTimelineItem(BaseModel):
    id: str
    time: str
    actor: str
    event: str
    detail: str | None = None


class PipelineStep(BaseModel):
    label: str
    status: Literal["done", "current", "pending"]


class ApprovalGateDetail(BaseModel):
    """Evidence pack for Reviewer at an Approval Gate."""

    request_id: str
    gate_number: int
    gate_label: str
    agent_summary: str
    evidence: list[EvidenceItem]
    warnings: list[ApprovalWarning]
    corrections: list[CorrectionDiff]
    preview: MockPreview
    previous_gate_note: str | None = None
    decision_summary: DecisionSummary
    validation_checklist: list[ValidationChecklistItem]
    activity_timeline: list[ActivityTimelineItem]
    pipeline_steps: list[PipelineStep]
    approval_status: str
    decided_at: datetime | None = None

"""Approval Gate REST API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Approval, ApprovalDecision, Request, RequestStatus
from app.schemas.approval import ApprovalDecide, ApprovalGateDetail, ApprovalInboxItem
from app.services.gate_evidence import build_gate_detail
from app.services.pipeline import resume_pipeline

router = APIRouter(prefix="/approvals", tags=["approvals"])


def _to_inbox_item(request: Request) -> ApprovalInboxItem:
    latest_run = request.agent_runs[-1] if request.agent_runs else None
    return ApprovalInboxItem(
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


@router.get("", response_model=list[ApprovalInboxItem])
def list_pending_approvals(db: Session = Depends(get_db)) -> list[ApprovalInboxItem]:
    requests = (
        db.query(Request)
        .options(joinedload(Request.agent_runs))
        .filter(Request.status == RequestStatus.APPROVAL_GATE.value)
        .order_by(Request.updated_at.desc())
        .all()
    )
    return [_to_inbox_item(r) for r in requests]


@router.get("/{request_id}", response_model=ApprovalGateDetail)
def get_approval_detail(request_id: str, db: Session = Depends(get_db)) -> ApprovalGateDetail:
    request = (
        db.query(Request)
        .options(joinedload(Request.approvals))
        .filter(Request.id == request_id)
        .first()
    )
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != RequestStatus.APPROVAL_GATE.value or not request.current_gate:
        raise HTTPException(status_code=404, detail="No pending Approval Gate for this Request")

    pending = next(
        (a for a in request.approvals if a.gate_number == request.current_gate),
        None,
    )
    if pending and pending.evidence_payload:
        return ApprovalGateDetail.model_validate(pending.evidence_payload)
    return build_gate_detail(request, request.current_gate)


@router.post("/{request_id}/decide")
async def decide_approval(
    request_id: str,
    payload: ApprovalDecide,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    request = db.get(Request, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != RequestStatus.APPROVAL_GATE.value or not request.current_gate:
        raise HTTPException(status_code=409, detail="Request is not awaiting approval")

    approval = (
        db.query(Approval)
        .filter(
            Approval.request_id == request_id,
            Approval.gate_number == request.current_gate,
            Approval.status == ApprovalDecision.PENDING.value,
        )
        .first()
    )
    if approval is None:
        raise HTTPException(status_code=404, detail="Pending Approval Gate not found")

    await resume_pipeline(
        request_id,
        gate_number=request.current_gate,
        decision=payload.decision,
        reviewer=payload.reviewer,
        notes=payload.notes,
    )
    return {"status": "accepted", "decision": payload.decision}

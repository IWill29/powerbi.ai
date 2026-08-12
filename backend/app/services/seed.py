"""Seed database with demo Requests matching UPB/Schwenk scenarios."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import AgentRun, AgentRunStatus, Approval, ApprovalDecision, Request, RequestStatus
from app.services.events import create_request_event
from app.services.gate_evidence import build_gate_detail
from app.services.ids import next_approval_id


def seed_demo_data(db: Session) -> None:
    """Insert demo Requests if database is empty."""
    if db.query(Request).count() > 0:
        return

    now = datetime.now(timezone.utc)
    scenarios = [
        {
            "id": "REQ-1042",
            "title": "BC pārdošanas KPI pa reģioniem",
            "client": "UPB",
            "status": RequestStatus.APPROVAL_GATE,
            "gate": 2,
            "run": "RUN-8821",
            "submitted_by": "M. Ozoliņš",
            "description": "Power BI pārskats Business Central pārdošanas datiem pa reģioniem un pārdevējiem.",
        },
        {
            "id": "REQ-1041",
            "title": "Noliktavas apgrieziens (Business Central)",
            "client": "Schwenk",
            "status": RequestStatus.AGENT_RUN,
            "gate": None,
            "run": "RUN-8819",
            "submitted_by": "A. Kalniņa",
            "description": "Noliktavas apgrieziena un atlikumu kustības vizualizācija no BC Item Ledger Entry.",
        },
        {
            "id": "REQ-1036",
            "title": "Piegādātāju sniegums — Power BI modelis",
            "client": "B2B loģistika",
            "status": RequestStatus.APPROVAL_GATE,
            "gate": 1,
            "run": "RUN-8804",
            "submitted_by": "G. Ozols",
            "description": "Piegādātāju piegādes precizitātes un kavējumu KPI no BC pirkumu datiem.",
        },
        {
            "id": "REQ-1039",
            "title": "CRM pipeline veselība un konversija",
            "client": "Stenders",
            "status": RequestStatus.DELIVERED,
            "gate": None,
            "run": "RUN-8812",
            "submitted_by": "E. Bērziņa",
            "description": "CRM piltuves veselības metrikas un konversijas analīze.",
        },
    ]

    for index, scenario in enumerate(scenarios):
        created = now - timedelta(hours=index + 1)
        request = Request(
            id=scenario["id"],
            title=scenario["title"],
            description=scenario["description"],
            client_reference=scenario["client"],
            submitted_by=scenario["submitted_by"],
            status=scenario["status"].value,
            current_gate=scenario["gate"],
            created_at=created,
            updated_at=created,
        )
        db.add(request)
        db.add(
            AgentRun(
                id=scenario["run"],
                request_id=scenario["id"],
                status=AgentRunStatus.PAUSED.value
                if scenario["status"] == RequestStatus.APPROVAL_GATE
                else AgentRunStatus.COMPLETED.value
                if scenario["status"] == RequestStatus.DELIVERED
                else AgentRunStatus.RUNNING.value,
                started_at=created,
                completed_at=created + timedelta(minutes=30)
                if scenario["status"] == RequestStatus.DELIVERED
                else None,
            )
        )
        create_request_event(
            db,
            request_id=scenario["id"],
            agent_name="Orchestrator",
            event_type="step_started",
            message="Request created — Intake phase started",
        )
        create_request_event(
            db,
            request_id=scenario["id"],
            agent_name="Orchestrator",
            event_type="step_started",
            message=f"Agent Run {scenario['run']} started (Mock Pipeline)",
        )
        if scenario["gate"]:
            evidence = build_gate_detail(request, scenario["gate"])
            db.add(
                Approval(
                    id=next_approval_id(db),
                    request_id=scenario["id"],
                    gate_number=scenario["gate"],
                    status=ApprovalDecision.PENDING.value,
                    evidence_payload=evidence.model_dump(mode="json"),
                )
            )
            create_request_event(
                db,
                request_id=scenario["id"],
                agent_name="Orchestrator",
                event_type="approval_required",
                message=f"Approval Gate {scenario['gate']} opened — awaiting Reviewer",
            )

    db.commit()

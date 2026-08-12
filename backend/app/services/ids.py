"""Sequential ID helpers for domain entities."""

from sqlalchemy.orm import Session

from app.models import AgentRun, Approval, Request


def next_request_id(db: Session) -> str:
    count = db.query(Request).count()
    return f"REQ-{1030 + count + 1}"


def next_agent_run_id(db: Session) -> str:
    count = db.query(AgentRun).count()
    return f"RUN-{8780 + count + 1}"


def next_approval_id(db: Session) -> str:
    count = db.query(Approval).count()
    return f"APR-{100 + count + 1}"

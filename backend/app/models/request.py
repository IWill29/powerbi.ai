"""Request ORM model."""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RequestStatus(str, enum.Enum):
    """Lifecycle status for a Request."""

    INTAKE = "Intake"
    AGENT_RUN = "Agent Run"
    APPROVAL_GATE = "Approval Gate"
    DELIVERED = "Delivered"
    REJECTED = "Rejected"


class Request(Base):
    """A customer order to build a Power BI Solution."""

    __tablename__ = "requests"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    client_reference: Mapped[str] = mapped_column(String(128), nullable=False)
    submitted_by: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=RequestStatus.INTAKE.value
    )
    current_gate: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    events: Mapped[list[RequestEvent]] = relationship(  # noqa: F821
        "RequestEvent",
        back_populates="request",
        order_by="RequestEvent.timestamp",
    )
    approvals: Mapped[list[Approval]] = relationship(  # noqa: F821
        "Approval", back_populates="request", order_by="Approval.gate_number"
    )
    agent_runs: Mapped[list[AgentRun]] = relationship(  # noqa: F821
        "AgentRun", back_populates="request", order_by="AgentRun.started_at"
    )

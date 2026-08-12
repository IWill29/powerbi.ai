"""Approval Gate ORM model."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ApprovalDecision(str, enum.Enum):
    """Reviewer decision at an Approval Gate."""

    PENDING = "pending"
    APPROVE = "approve"
    REJECT = "reject"
    REQUEST_CHANGES = "request_changes"


class Approval(Base):
    """Human checkpoint record for a Request."""

    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    request_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("requests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    gate_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=ApprovalDecision.PENDING.value
    )
    reviewer: Mapped[str | None] = mapped_column(String(128), nullable=True)
    reviewer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    request: Mapped[Request] = relationship("Request", back_populates="approvals")  # noqa: F821

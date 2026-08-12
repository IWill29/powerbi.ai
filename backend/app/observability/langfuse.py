"""Optional Langfuse trace integration."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator

from app.core.config import settings

_langfuse_client: Any | None = None


def _get_client() -> Any | None:
    global _langfuse_client
    if not settings.langfuse_enabled:
        return None
    if _langfuse_client is None:
        try:
            from langfuse import Langfuse

            _langfuse_client = Langfuse(
                public_key=settings.langfuse_public_key,
                secret_key=settings.langfuse_secret_key,
                host=settings.langfuse_host,
            )
        except Exception:
            return None
    return _langfuse_client


@contextmanager
def trace_pipeline_step(
    *,
    request_id: str,
    agent_run_id: str,
    step: str,
) -> Iterator[None]:
    """Create a Langfuse span when configured; otherwise no-op."""
    client = _get_client()
    if client is None:
        yield
        return

    trace = client.trace(
        name="mock-pipeline",
        metadata={"request_id": request_id, "agent_run_id": agent_run_id},
    )
    span = trace.span(name=step)
    try:
        yield
        span.end()
    except Exception as exc:
        span.end(level="ERROR", status_message=str(exc))
        raise

"""Health check endpoint for API liveness probes."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    """Return API readiness status.

    Used by the dashboard and deployment tooling before Request intake is available.
    """
    return {"status": "ok"}

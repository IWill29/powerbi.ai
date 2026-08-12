"""FastAPI application entrypoint for the Power BI Agent Platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title="Power BI Agent Platform API",
    description=(
        "REST API for Request intake, Agent Runs, Request Events, and Approval Gates. "
        "Phase 1 uses a Mock Pipeline only — no real Solution generation."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)

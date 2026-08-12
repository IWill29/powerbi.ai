"""FastAPI application entrypoint for the Power BI Agent Platform."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.approvals import router as approvals_router
from app.api.health import router as health_router
from app.api.requests import router as requests_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.services.seed import seed_demo_data


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.seed_on_startup:
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()
    yield


app = FastAPI(
    title="Power BI Agent Platform API",
    description=(
        "REST API for Request intake, Agent Runs, Request Events, and Approval Gates. "
        "Phase 1 uses a Mock Pipeline only — no real Solution generation."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(requests_router)
app.include_router(approvals_router)

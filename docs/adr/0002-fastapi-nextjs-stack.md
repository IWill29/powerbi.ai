# FastAPI backend and Next.js frontend

The MVP uses a split stack: FastAPI (Python) for the API and agent layer, Next.js 15 (React 19) for the dashboard UI. This matches the agent ecosystem (LangGraph, Langfuse are Python-first) while keeping a modern React frontend.

Alternative considered: Next.js API routes only. Rejected because the agent layer is Python-native and mixing runtimes adds complexity without benefit for Phase 1.

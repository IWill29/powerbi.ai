# LangGraph as orchestrator

The agent pipeline uses LangGraph for orchestration. Sub-agents (requirements, code-review, validation) are nodes in a single graph, not independent services. LangGraph provides native human-in-the-loop via `interrupt()` and checkpointing via PostgreSQL.

CrewAI-style role definitions may inform sub-agent prompts, but orchestration logic lives in LangGraph only.

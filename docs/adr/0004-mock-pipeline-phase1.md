# Mock pipeline in Phase 1, real Power BI in Phase 2

Phase 1 uses a mock orchestrator that emits Request Events on a fixed schedule without calling LLMs or generating PBIP files. This validates the dashboard, approval flow, and event timeline before adding non-deterministic agent behavior.

Real Power BI generation (Skills for Fabric, Modeling MCP, Desktop Bridge) starts in Phase 2 after CI validation tooling (Tabular Editor BPA, PBI Inspector) is in place.

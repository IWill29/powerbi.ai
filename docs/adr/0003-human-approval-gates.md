# Human approval gates are mandatory

Every agent pipeline MUST pause at two Approval Gates:

1. After requirements analysis — before build starts
2. Before final delivery — after validation

Implementation uses LangGraph `interrupt()`. Autonomous delivery without human approval is forbidden. This is a product requirement, not a technical limitation.

Rejected alternative: optional approval (configurable per client). Deferred to Phase 2; MVP always requires both gates.

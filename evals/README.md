# Evals

Golden datasets and LLM evaluators — Phase 2, after mock pipeline is stable.

Planned structure:

```
evals/
├── datasets/       # golden-request scenarios
├── evaluators/     # rubrics, schema checks, trajectory validators
└── run_regression.py
```

See `docs/architecture/agent-pipeline.md` for sub-agent eval boundaries.

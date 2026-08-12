# Tests

Test layout will be added with the application scaffold.

Planned structure:

```
tests/
├── unit/           # pytest — API, schemas, LangGraph nodes
├── integration/    # pytest — DB, pipeline, events
└── e2e/            # Playwright — dashboard flows
```

See prior research notes in project chat for the full testing pyramid (deterministic CI, golden dataset, online eval).

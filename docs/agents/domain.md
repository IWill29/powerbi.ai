# Domain Docs

How agents should consume this repo's domain documentation.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root
- **`docs/adr/`** — read ADRs that touch the area you are about to work in
- **`docs/spec/mvp-scope.md`** and **`docs/spec/out-of-scope.md`**

If any file does not exist, proceed silently. Do not suggest creating files outside the structure in `AGENTS.md`.

## Use the glossary's vocabulary

When naming domain concepts (issue titles, API fields, test names, UI labels in code), use terms from `CONTEXT.md`. Do not drift to synonyms listed under `_Avoid_`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly:

> Contradicts ADR-0003 (human approval gates) — worth reopening because…

Do not silently override an ADR.

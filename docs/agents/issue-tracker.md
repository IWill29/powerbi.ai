# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list --state open --label ready-for-agent`
- **Comment**: `gh issue comment <number> --body "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

External PRs are not triaged as feature requests in Phase 1.

## When a skill says "publish to the issue tracker"

Create a GitHub issue with acceptance criteria and link it in the branch/PR.

## When starting work

1. Confirm an open issue exists and is in scope (`docs/spec/mvp-scope.md`)
2. Reference the issue in branch name: `feat/123-request-list`
3. Reference the issue in PR: `Closes #123` or `Refs #123`

## Branch naming

See `git-workflow.md` for full branching rules.

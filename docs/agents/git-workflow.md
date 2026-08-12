# Git workflow for AI agents

Rules for branching, commits, and pull requests when AI (or humans) work in this repo.

## Principles

1. **One issue, one change set** — branch scope matches a single issue
2. **Small PRs over giant diffs** — split large work into stacked PRs when needed
3. **Human review always** — never merge to `main` without review; AI never auto-merges
4. **No surprise commits** — create commits and PRs only when the user explicitly asks
5. **Traceability** — every PR links to an issue

## Branch naming

```
<type>/<issue-number>-<short-description>
```

| Type | Use |
|------|-----|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `test/` | Tests only |
| `refactor/` | Refactor without behavior change |
| `chore/` | Tooling, deps, CI |

Examples:

- `feat/12-request-intake-form`
- `docs/1-project-scaffold`
- `fix/45-approval-resume-bug`

## Branch lifecycle

```bash
# 1. Start from latest main
git fetch origin
git checkout main
git pull origin main

# 2. Create branch from issue
git checkout -b feat/12-request-intake-form

# 3. Work, commit (when user asks)
git add <files>
git commit -m "feat: add request intake form (#12)"

# 4. Push and open PR (when user asks)
git push -u origin feat/12-request-intake-form
gh pr create --title "feat: request intake form" --body "..."
```

## Commit messages

Format: `<type>: <description> (#<issue>)`

- One logical change per commit when possible
- Do not commit unrelated files
- Do not amend pushed commits unless user explicitly requests and rules allow

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

## Pull request rules

### When to open a PR

- User explicitly asks for a PR or commit
- Work for one issue is complete and tested
- Diff is reviewable (see size limits below)

### PR size

| Size | Lines changed | Action |
|------|---------------|--------|
| Ideal | < 400 | Open PR |
| Large | 400–800 | Split if possible |
| Too large | > 800 | Must split into stacked PRs |

### PR description template

```markdown
## Summary
- What changed and why (1–3 bullets)

## Issue
Closes #123

## Test plan
- [ ] Unit tests pass
- [ ] Manual verification steps
- [ ] No out-of-scope changes

## Reviewer notes
- Risky areas / files to focus on
- Screenshots if UI changed
```

### What AI must NOT do on PRs

- Force-push to `main` or `master`
- Merge its own PR without human approval
- Skip CI hooks (`--no-verify`) unless user explicitly requests
- Include secrets, `.env`, or credentials
- Mix unrelated issues in one PR
- Rewrite git history (rebase/squash) without user approval

## Stacked PRs (large features)

When one issue is too large for a single reviewable PR, use **stacked PRs**: a chain where each PR targets the branch below it, not `main`.

### When to stack

- Feature has clear dependency order (schema → API → UI)
- Single PR would exceed ~400 lines
- Layers can be reviewed independently

### Stack design (plan before coding)

Example for "Request detail with timeline":

```
Layer 1: feat/20-db-schema          → main
Layer 2: feat/20-api-events         → feat/20-db-schema
Layer 3: feat/20-ui-timeline        → feat/20-api-events
```

Dependency order:

1. Schema / types / contracts
2. Core logic / API
3. Wiring / integration
4. UI / surface
5. Tests (or tests with each layer)

### Stacked PR workflow

**Option A — GitHub native (`gh stack`, public preview):**

```bash
gh stack init                    # bottom layer from main
# ... implement layer 1 ...
gh stack add                     # next layer on top
gh stack submit                  # push and open PRs
gh stack sync                    # rebase chain after changes
# Merge bottom first; upper PRs retarget automatically
```

**Option B — Manual stacking (works everywhere):**

```bash
git checkout -b feat/20-db-schema main
# commit layer 1, push, open PR targeting main

git checkout -b feat/20-api-events feat/20-db-schema
# commit layer 2, push, open PR targeting feat/20-db-schema

git checkout -b feat/20-ui-timeline feat/20-api-events
# commit layer 3, push, open PR targeting feat/20-api-events
```

### Stack rules

- **Review bottom-up, merge bottom-up** — merge layer 1 before layer 2
- **Fix on the owning layer** — do not patch upper layers for lower-layer bugs
- **Rebase upstack** after lower-layer changes
- **3–4 layers max** — deeper stacks add CI and rebase overhead
- Each layer must build and pass tests independently where possible

## Parallel work (git worktrees)

When multiple agents or tasks run in parallel, use **one worktree per branch/stack** to avoid checkout conflicts:

```bash
git worktree add ../ai-powerbiaps-feat-20 feat/20-db-schema
```

Rules:

- One worktree per task, not permanently owned by one agent
- Remove worktree when branch merges: `git worktree remove ../ai-powerbiaps-feat-20`

## AI agent PR checklist

Before opening a PR, verify:

- [ ] Issue exists and is in MVP scope
- [ ] Branch name follows convention
- [ ] No files from `docs/spec/out-of-scope.md`
- [ ] Tests run for changed code
- [ ] PR description has summary, issue link, test plan
- [ ] Diff is focused; unrelated refactors removed
- [ ] User asked for commit/PR

## Branch protection (recommended for production)

Configure on GitHub for `main`:

- Require pull request before merging
- Require status checks (CI) to pass
- Require at least one human approval
- Block force pushes
- Do not allow AI bot accounts to bypass rules

## References

- [GitHub: Turn giant AI PR into reviewable stack](https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack/)
- [Stacked PRs for AI agent collaboration](https://zylos.ai/research/2026-05-21-stacked-prs-ai-agent-collaboration/)
- [gh stack practical guide](https://flaviocopes.com/github-stacked-prs/)

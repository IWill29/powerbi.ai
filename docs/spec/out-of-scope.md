# Out of Scope

AI agents MUST NOT implement these unless explicitly requested in an issue and confirmed by the user.

## Features

- Real Power BI PBIP generation (Phase 2)
- Fabric Git integration and deployment
- Multi-tenant architecture
- Client self-service portal (beyond basic intake)
- Billing, payments, or subscriptions
- Email, Slack, or SMS notifications
- Mobile application
- Admin user management UI
- SLA enforcement and escalation
- Export to PDF or scheduled reports

## Technical

- Temporal workflow engine (use LangGraph when Phase 2 starts)
- Redis (unless a specific issue requires it for realtime)
- Stripe, Twilio, Resend, or similar integrations
- Kubernetes or production Docker orchestration
- Authentication beyond a placeholder (Phase 2)
- GraphQL API
- Microservices split (monolith for MVP)
- Message queues (Kafka, RabbitMQ)

## Code patterns to avoid

- Adding npm or pip dependencies without user approval
- Creating abstractions "for future flexibility"
- Refactoring files outside the current issue scope
- Adding tests for code you did not change
- Creating documentation files not listed in `AGENTS.md`
- Inline imports (see workspace rule `no-inline-imports`)
- Skipping Approval Gates in agent workflow code
- Auto-committing or auto-pushing without user request
- Force-pushing to `main` or `master`

## Documentation to avoid creating unprompted

- ADRs for reversible decisions
- README sections beyond setup and doc index
- Architecture diagrams not requested
- API docs before the API exists

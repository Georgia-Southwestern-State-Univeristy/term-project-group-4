# Week 13 Observability and Support Visibility

Issue alignment: #101

## Summary
Week 13 observability work focused on making failures easier to diagnose, making request behavior easier to trace, and clarifying how logging behaves across local and hosted environments.

## Improvement 1: Request Correlation IDs and Access Logging
### Blind spot addressed
Before this change, it was hard to correlate user-reported failures to specific backend events because request IDs were not consistently surfaced in API responses and route-level context was fragmented.

### What changed
- Added request ID middleware that reuses incoming `x-request-id` when present, or generates one when missing.
- Added `x-request-id` response header for all requests.
- Added structured request completion logs (`HTTP_REQUEST`) with method, path, status code, latency, and user ID when available.
- **PR review follow-up (2787613):** Request IDs from client headers are now sanitized — only alphanumeric characters plus `.`, `_`, `-` are accepted, with a 128-character maximum. Malformed or oversized values are replaced with a server-generated UUID.
- **PR review follow-up (2787613):** Request completion logs now use `req.path` instead of `req.url` to avoid leaking query-string parameters (tokens, PII) into log files.

### Where it applies
- Express middleware in `server.js`.
- All API endpoints, including authenticated and unauthenticated responses.

### Support value
Maintainers can now trace a single failing request end-to-end using request ID values from client responses, server logs, and error logs.

## Improvement 2: Health and Diagnostics Visibility
### Blind spot addressed
Health checks previously gave limited operational context and did not expose enough diagnostics for fast triage in non-production environments.

### What changed
- Expanded `/health` payload with:
  - `requestId`
  - `uptimeSeconds`
  - `version`
  - config validity indicator (`config.valid`)
- In non-production environments, health now reports missing startup config keys for faster debugging.

### Where it applies
- `GET /health` response behavior in `server.js`.

### Support value
Operators get a faster first-pass diagnosis of environment and configuration state without deep code inspection.

## Improvement 3: Startup Validation and Centralized Error Visibility
### Blind spot addressed
Misconfigured environments could fail later and less clearly, and not-found/unhandled errors did not consistently return correlation information.

### What changed
- Added startup config validation with explicit fail-fast error messages for missing critical environment keys.
- Added centralized JSON 404 handler with `requestId`.
- Added centralized unhandled error middleware that logs structured `UNHANDLED_ERROR` entries and returns `requestId` in 500 responses.

### Where it applies
- Server startup path and global Express handlers in `server.js`.

### Support value
Misconfiguration is detected immediately at boot, and runtime failures become easier to correlate and diagnose in production support workflows.

## Hosted vs Local Logging Behavior (Explicit Operational Note)
### Hosted (production)
- Logs are emitted to console as structured JSON via Winston Console transport.
- In hosted infrastructure, these are viewed in platform log aggregation (for example, Elastic Beanstalk instance logs/CloudWatch streams).
- The application does not write production logs to the repository `logs/` folder by default.

### Local development and test
- Logs are written to `logs/app.log` with rotation settings.
- Logs are also displayed in the local terminal in a colorized timestamped format for developer debugging.

## Before/After Notes
- Before: Hard to trace request-specific incidents across endpoints.
- After: Request IDs are propagated and returned to clients for direct correlation.

- Before: Health output gave less context for support triage.
- After: Health output includes diagnostics and config validity information.

- Before: Some failures surfaced without consistent structured error context.
- After: Not-found and unhandled errors include correlation IDs and structured logs.

## Test Evidence
Automated coverage added/updated in server tests verifies:
- request ID propagation and response header parity
- request ID reuse from caller-provided header
- malformed or oversized request IDs are replaced with a server-generated UUID
- request ID presence in 404 error responses

Full test suite: 35/35 passing (`npm test -- tests/server.test.js`).

## PR Evidence
- PR: [#133 — Week 13: observability and support visibility improvements (#101)](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/133)
- Commits: `e0b9c21` (initial observability improvements), `2787613` (PR review: sanitize request IDs and redact query logging)
- CI run: [All checks passing](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/actions/runs/24173758675) (Unit Tests, E2E Tests, Code Linting)

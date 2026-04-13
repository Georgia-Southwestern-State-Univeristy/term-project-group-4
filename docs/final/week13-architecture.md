# Week 13 Architecture Snapshot Update

## Summary

The architecture snapshot (`docs/architecture/architecture-snapshot.md`) has been updated to reflect the actual production system. The previous snapshot described a client-side, localStorage-backed, single-user prototype. The current system is a full-stack, authenticated, multi-user application deployed on AWS.

## Updated Component Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      AWS Elastic Beanstalk                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Express Server (server.js)               │  │
│  │                                                          │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────┐   │  │
│  │  │ Request ID │ │  Passport  │ │   API    │ │ Static │   │  │
│  │  │ Middleware │→│   OAuth    │→│  Routes  │ │ Assets │   │  │
│  │  │            │ │ + Session  │ │  /api/*  │ │ dist/  │   │  │
│  │  └────────────┘ └────────────┘ └────┬─────┘ └────────┘   │  │
│  │                                     │                    │  │
│  │  ┌────────────┐ ┌──────────────────────────────────────┐ │  │
│  │  │  Winston   │ │  Data Layer (server/storage.js)      │ │  │
│  │  │  Logger    │ │  Knex.js + better-sqlite3            │ │  │
│  │  └────────────┘ └─────────────────┬────────────────────┘ │  │
│  └───────────────────────────────────┼──────────────────────┘  │
│                                      │                         │
│  ┌───────────────────────────────────▼──────────────────────┐  │
│  │            SQLite Database (/data/trips.db)              │  │
│  │            on persistent EBS Volume                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
         ▲                                        │
         │ HTTPS (spcg.zentrofi.com)              │ Deploy
         │                                        │
┌────────┴───────┐                  ┌─────────────▼─────────────┐
│ Browser (SPA)  │                  │   GitHub Actions CI/CD    │
│ Vite-built     │                  │   ci.yaml + deploy.yaml   │
│ Vanilla JS     │                  └───────────────────────────┘
└────────────────┘
```

## Key System Components and Responsibilities

| Component | Location | Responsibility |
|-----------|----------|---------------|
| **Frontend SPA** | `src/` (main.js, tripForm.js, checklistRenderer.js, apiClient.js) | Trip form UI, client-side checklist generation, auth state management, API communication |
| **Checklist Generator** | `src/checklistGenerator.js` | Pure function: destination type + duration → packing list items |
| **Express Server** | `server.js` | API routing, session management, static asset serving (production), request correlation middleware, error handling |
| **Authentication** | `server/auth.js` | Google OAuth 2.0 via Passport, session serialization, test-mode auth for E2E |
| **Data Layer** | `server/storage.js` | User lookup/creation, trip CRUD with ownership enforcement, transactional checklist writes |
| **Database Migrations** | `migrations/` | Versioned schema changes (users, trips, checklist_items tables) via Knex |
| **Logger** | `server/logger.js` | Structured JSON logging, request ID correlation, environment-aware transports |
| **Infrastructure** | `.ebextensions/`, `.platform/hooks/predeploy/` | EB environment config, EBS volume mount automation, deployment-time migrations |
| **CI/CD** | `.github/workflows/ci.yaml`, `deploy-eb.yaml` | Lint + unit tests + E2E on PR; build + deploy to EB on merge to main |

## What Changed Since Beta

| Area | Beta State | Current State |
|------|-----------|---------------|
| **Observability** | Basic action-level logging (START/SUCCESS/ERROR) | Request correlation IDs on every request, `HTTP_REQUEST COMPLETE` logs with method/path/status/duration, sanitized request IDs, query-string redaction |
| **Health endpoint** | Simple ok/degraded | Returns environment, version, uptime, database status, config validity; production mode redacts internal paths |
| **Error handling** | Per-route try/catch, some responses missing correlation info | Centralized 404 and unhandled-error middleware with `requestId` in every error response |
| **Startup safety** | Scattered env-var checks | Centralized `getRequiredStartupConfigKeys()` with environment-aware validation and fail-fast on boot |
| **Security hardening** | Accepted any `X-Request-ID` value; logged `req.url` (included query strings) | Request IDs validated (alphanumeric + `._-`, max 128 chars); logs use `req.path` only |

No functional application changes (new features, schema changes, or auth changes) occurred between Beta and now. The focus was entirely on operational quality.

## Remaining Architectural Risks and Constraints

| Risk | Impact | Mitigation Path |
|------|--------|-----------------|
| **SQLite write concurrency** | Under heavy concurrent writes, SQLite's single-writer lock could become a bottleneck | Migrate to PostgreSQL (Knex makes this a config change + migration test pass) |
| **In-memory session store** | Server restart or instance replacement logs out all users | Add a persistent session store (e.g., connect-sqlite3 or Redis) |
| **Single EB instance** | Deployment or instance failure causes downtime; no horizontal scaling | Move to multi-instance EB with a shared database (requires PostgreSQL) and sticky sessions or external session store |
| **Frontend-only checklist logic** | Generation rules cannot be tested or enforced server-side; a modified client could submit arbitrary items | Move generation to a server endpoint or add server-side validation of checklist content |
| **No rate limiting** | API endpoints are unprotected against abuse | Add express-rate-limit middleware before production traffic grows |
| **EBS volume single-AZ** | EBS is tied to one availability zone; AZ outage loses the database | Add automated EBS snapshots or migrate to RDS |

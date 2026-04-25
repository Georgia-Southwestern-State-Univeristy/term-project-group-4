# Week 15: Presentation Plan
## Smart Packing Checklist Generator

---

## Presentation Title

**Smart Packing Checklist Generator: A Full-Stack, Authenticated Trip Planning System**

---

## Overview

This document outlines the structure, speaking roles, and demo execution plan for the final presentation.

The presentation is designed to:
- clearly communicate the system’s purpose and value
- demonstrate core functionality through a live demo
- highlight architectural decisions and technical strengths
- show system reliability and production readiness

**Target Duration:** 12–15 minutes

---

## Presentation Structure (12–15 Minutes)

### 1. Introduction & Project Overview (1 minutes)
**Speaker: Jason**

- What the application does
- Problem being solved (trip planning + packing friction)
- High-level value proposition
- Brief overview of system capabilities

---

### 2. System Architecture Overview (3 minutes)
**Speaker: Jason**
 
- High-level system architecture:
  - Frontend: Vite + Vanilla JavaScript
  - Backend: Node.js + Express
  - Database: SQLite via Knex
  - Authentication: Google OAuth (Passport.js)
  - Deployment: AWS Elastic Beanstalk

- Show how to run the system locally:
  - Run: `npm run dev:full`
  - Frontend served at http://localhost:5173
  - Backend API running at http://localhost:3000

Key points:
- Request flow (client → server → database)
- Why SQLite + single-instance deployment was chosen (simplicity, scope alignment)

---

### 5. API & System Interfaces (1 minutes)
**Speaker: Jason**

- REST API supports all trip operations:
  - `GET /api/trips`
  - `POST /api/saveTrip`
  - `PUT /api/trips/:id`
  - `DELETE /api/trips/:id`

- Enforces user-scoped access via session-based authentication

- Clearly defined request/response contracts
  - input validation
  - structured error responses

- Fully documented with OpenAPI:
  - `/docs/api/openapi.yaml`

---

### 3. Demo (Core Workflows) (6 minutes)
**Speaker: Heather**  

The demo will be performed on the live deployed application:

#### Phase 0: Open Deployed Application

- https://spcg.zentrofi.com
- Confirm application loads successfully

#### Phase 1: Authentication
- Show unauthenticated state
- Log in via Google OAuth
- Show authenticated UI

#### Phase 2: Trip Creation & Checklist Generation
- Enter trip details (Beach Weekend, 3 days)
- Generate checklist
- Explain client-side generation

#### Phase 3: Save & Persistence
- Save trip
- Refresh page
- Load trip from saved list
- Show persistence

#### Phase 4: Checklist Interaction
- Toggle packed items
- Refresh to show persistence

#### Phase 5: Edit Workflow
- Load trip in edit mode
- Modify trip name
- Update trip
- Verify persistence

---


### 4. Reliability and Testing (2 minutes)
**Speaker: Naren**

- E2E testing with Playwright (test-mode auth)
- Regression tests for key bugs (#126, #98, #121)
- Error handling improvements (timeouts, user feedback)
- Observability:
  - request IDs
  - structured logging
  - `/health` endpoint

---

### 6. Future Improvements & Known Constraints (1 minutes)
**Speaker: Naren**

- Future improvements:
  - Refactor duplicated validation logic across routes
  - Move database migrations to a deploy-time step
  - Expand server-side validation for checklist data
  - Extend API to support mobile clients or external integrations

- Known constraints:
  - SQLite with single-instance deployment (no horizontal scaling)
  - In-memory session store (sessions reset on restart)

- System is stable for its current scope; future work focuses on scalability

---

### 7. Closing & Q&A (1 minute)
**Speaker: Naren**

- Recap key strengths:
  - full-stack system
  - secure authentication
  - reliable data persistence across sessions
  - live deployed application

- Invite questions

---

## Demo Ownership

- **Primary Demo Driver:** Heather
- **Backup Demo Driver:** Naren 

---

## Backup Plan (If Demo Fails)

If the live demo partially fails, the team will:

### 1. Use Local Environment
- Switch to: `npm run dev:full`

### 2. Use Pre-Authenticated Session
- Keep a logged-in session ready to skip OAuth delays

### 3. Use Pre-Recorded Screenshots/Video (Last Resort)
- Show:
  - checklist generation
  - save/load flow
  - edit workflow

---

## Slide Deck / Notes

- Slide deck: *(Insert link here if available)*
- Presentation notes based on this document:
  - `/docs/final/week15-qa.md`
  - `/docs/releases/release-candidate.md`

---

## Final Notes

- Each team member has a clearly defined speaking role
- Demo has been rehearsed end-to-end using the QA checklist
- Backup plan ensures presentation continuity under failure conditions

The team is prepared to clearly communicate, demonstrate, and defend the system.
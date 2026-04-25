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

### 2. System Architecture Overview (2 minutes)
**Speaker: Jason**

- Frontend: Vite + Vanilla JS
- Backend: Node.js + Express
- Database: SQLite via Knex
- Authentication: Google OAuth (Passport.js)
- Deployment: AWS Elastic Beanstalk

Key points:
- Request flow (client → server → database)
- Authentication + user-scoped data
- Why SQLite + single-instance was chosen

---

### 3. Demo (Core Workflows) (6 minutes)
**Speaker: Heather**  

The demo will follow the exact rehearsed QA path:

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

### 5: Show Deployed Version (30-45 seconds)
**Speaker: Naren**

- Show deployed application: https://spcg.zentrofi.com
- Confirm application loads successfully in production
- Reinforce that the system is live on AWS Elastic Beanstalk

### 4. Reliability, Testing, and QA (3 minutes)
**Speaker: Naren**

- E2E testing with Playwright (test-mode auth)
- Regression tests for key bugs (#126, #98, #121)
- Error handling improvements (timeouts, user feedback)
- Observability:
  - request IDs
  - structured logging
  - `/health` endpoint
- QA checklist + demo rehearsal validation

**Talking points:**

- Shift left policy + Test Pyramid
- Unit tests: Vi tests
- Playwright: rationale for choosing
- Test Auth mode for tests and why?
- Show tests for regression defects
- Error handling: Show error from Swagger
- Show structured logs in the local environment 


---

### 5. Future Improvements & Known Constraints (1 minutes)
**Speaker: Jason**

- Future improvements:
  - Refactor duplicated validation logic across routes
  - Move database migrations to a deploy-time step
  - Expand server-side validation for checklist data

- Known constraints:
  - SQLite with single-instance deployment (no horizontal scaling)
  - In-memory session store (sessions reset on restart)

- Handoff perspective:
  - The system is stable and production-ready for its current scope
  - Future work would focus on scalability, persistence, and backend modularization

---

### 6. Closing & Q&A (1 minute)
**Speaker: Naren**

- Recap key strengths:
  - full-stack system
  - secure authentication
  - persistent user data
  - production deployment
- Invite questions

---

## Demo Ownership

- **Primary Demo Driver:** Jason
- **Backup Demo Driver:** Heather  

---

## Backup Plan (If Demo Fails)

If the live demo partially fails, the team will:

### 1. Use Hosted Environment
- Switch to: https://spcg.zentrofi.com

### 2. Use Pre-Authenticated Session
- Keep a logged-in session ready to skip OAuth delays

### 3. Use Pre-Recorded Screenshots (Last Resort)
- Show:
  - checklist generation
  - save/load flow
  - edit workflow

### 4. Narrate Expected Behavior
- Clearly explain:
  - what should happen
  - what was validated during QA rehearsal

**Key principle:** Even if the demo fails, the team demonstrates understanding and system correctness.

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
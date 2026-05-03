# Final Presentation
## Smart Packing Checklist Generator

---

## Presentation Title

**Smart Packing Checklist Generator: A Full-Stack, Authenticated Trip Planning System**

---

## Presentation Video

**Video Link:** https://www.youtube.com/watch?v=-B8X5v3He5Q

---

## Overview

This document outlines the structure, speaker order, demo ownership, and backup plan for the final presentation.

The presentation is designed to:
- introduce the problem and target users
- summarize the final system and core workflows
- demonstrate the primary workflow through a live demo
- highlight architecture and major technical decisions
- summarize testing, CI, deployment, and reliability work
- discuss major challenges and how the team addressed them
- clearly identify ownership for each presentation section

---

## Speaker Order

1. Jason — Introduction & Project Overview, System Architecture Overview
2. Heather — Live Demo of the Core Workflows
3. Naren — Reliability & Testing, API & System Interfaces
4. Jason — Future Improvements, Known Constraints, & Closing

---

## Demo Ownership

- **Primary Demo Driver:** Heather
- **Backup Demo Driver:** Naren 

---

## Presentation Structure (~15 Minutes)

### 1. Introduction & Project Overview (1 minute)
**Speaker: Jason**

- What the application does
- Problem being solved (trip planning + packing friction)
- Target users (travelers who want a simple way to create, save, and reuse packing checklists)
- High-level value proposition
- Brief overview of system capabilities

---

### 2. System Architecture Overview (~2 minutes)
**Speaker: Jason**
 
- High-level system architecture:
  - Frontend: Vite + Vanilla JavaScript
  - Backend: Node.js + Express
  - Database: SQLite via Knex
  - Authentication: Google OAuth (Passport.js)
  - Deployment: AWS Elastic Beanstalk

- Key points:
  - Request flow (client → server → database)
  - Authentication and user-scoped data
  - Key architectural decisions (SQLite, single-instance deployment, vanilla JS)

---

### 3. Live Demo (Core Workflows) (4.5 minutes)
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

### 4. Reliability & Testing (~2.5 minutes)
**Speaker: Naren**

- E2E testing with Playwright (test-mode auth)
- Regression tests for key bugs (#126, #98, #121)
- Error handling improvements (timeouts, user feedback)
- Observability:
  - request IDs
  - structured logging
  - `/health` endpoint

---

### 5. API & System Interfaces (~4 minutes)
**Speaker: Naren**

- REST API supports all trip operations:
  - `GET /api/trips`
  - `POST /api/saveTrip`
  - `GET /api/trips/{tripId}`
  - `PUT /api/trips/{tripId}`
  - `DELETE /api/trips/{tripId}`

- Enforces user-scoped access via session-based authentication

- Clearly defined request/response contracts
  - input validation
  - structured error responses

- Fully documented with OpenAPI:
  - `/docs/api/openapi.yaml`

- Show the system locally:
  - Run: `npm run dev:full`
  - Frontend served at http://localhost:5173
  - Backend API running at http://localhost:3000

---

### 6. Future Improvements, Known Constraints, & Closing (1 minute)
**Speaker: Jason**

- Future improvements:
  - Deduplicate trip validation across POST and PUT routes
  - Move database migrations fully to deploy-time workflow
  - Expand server-side validation
  - Introduce PostgreSQL and a persistent session store
  - Modularize the backend into clearer route, middleware, and validation layers

- Known constraints:
  - SQLite with single-instance deployment (no horizontal scaling)
  - In-memory session store (sessions reset on restart)

- System is stable for its current scope; future work focuses on scalability

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

## Major Challenges

Major challenges addressed:
  - Authentication and E2E testing: Google OAuth made automated testing unstable, so the team added test-mode authentication with x-test-user-id while preserving real OAuth for production.
  - Frontend state reliability: save/load/edit workflows became harder to manage as the app grew, so the team refined edit-mode behavior, checklist auto-save, button states, and regression coverage.
  - Deployment and persistence: production needed reliable data storage across deploys, so the team used a single-instance AWS Elastic Beanstalk setup with SQLite persisted on EBS-backed storage.

---

## Slide Deck / Notes

- Slide deck: https://canes.sharepoint.com/:p:/r/sites/AdvSoftwareEngineeringGroup-4/_layouts/15/Doc.aspx?sourcedoc=%7B89DBC21F-BF79-4998-AC25-C74D5C010664%7D&file=Week%2015%20Slide%20Deck.pptx&action=edit&mobileredirect=true
- Presentation notes: https://canes.sharepoint.com/:w:/r/sites/AdvSoftwareEngineeringGroup-4/_layouts/15/Doc2.aspx?action=edit&sourcedoc=%7B8afaf8d2-42dd-43a1-b802-836907fe5939%7D&wdExp=TEAMS-TREATMENT&web=1
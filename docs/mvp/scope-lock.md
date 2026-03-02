# MVP Scope Lock
## Smart Packing Checklist Generator

This document defines the locked MVP scope for midterm.  
If a feature is not described here, it does not consume sprint time.

---

## Board Evidence

GitHub Project Board:  
https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26/views/1

All story statuses below reflect the current state of the repository and project board.  
“Done” means merged into `main` with CI checks passing.

---

## MVP User Stories (Locked)

1. **Trip Creation**
   - As a traveler, I want to name my trip, so I can identify it later.

2. **Checklist Generation**
   - As a traveler, I want to generate a packing checklist based on destination type and duration, so I don’t forget essential items.

3. **Trip Persistence**
   - As a traveler, I want to save my trip to the server, so it persists across sessions.

4. **Progress Tracking**
   - As a traveler, I want to check off packed items, so I can track my packing progress.

5. **Checklist Synchronization**
   - As a traveler, I want my checklist changes to be saved to the server, so I don’t lose progress after refresh.

6. **Trip Retrieval**
   - As a traveler, I want to retrieve previously saved trips from the server, so I can continue working on them.

---

## MVP Story Status

| MVP Story | Status | Evidence / Notes |
|----------|--------|------------------|
| Trip Creation | Done | FE captures trip inputs; backend `POST /api/saveTrip` validates required fields and returns `201` with `id`; merged to `main` with CI green |
| Checklist Generation | Done | Rule-based generator implemented and covered by unit tests (`tests/checklistGenerator.test.js`); merged to `main` with CI green |
| Trip Persistence | Done | Trips are persisted to `data/trips.json` via server storage module; verified via Save → Refresh → Load demo path; merged to `main` with CI green |
| Progress Tracking | Done | Checklist item state (`packed`) can be toggled and saved via `PUT /api/trips/{tripId}`; changes persist after refresh; merged to `main` with CI green |
| Checklist Synchronization | Done | End-to-end sync verified: toggle packed item → refresh → state retained from server JSON persistence; merged to `main` with CI green |
| Trip Retrieval | Done | `GET /api/trips` returns list of trips; `GET /api/trips/{tripId}` returns a single trip by ID; merged to `main` with CI green |

Notes:
- “Done” means merged into `main` with passing CI checks.
- All tests run via `npm test` in CI.
- Project board status matches repository reality (see Board Evidence link above).

---

## Explicit Non-Goals (Out of Scope for MVP)

The following will **not** be built for MVP:

- User authentication or login
- Multi-user support
- Trip deletion
- Editing trip metadata after initial save (beyond checklist updates)
- Cloud database (JSON file storage only)
- Conflict resolution between concurrent sessions
- Advanced rule engine expansion
- Sharing or collaboration features

If it is not listed in the MVP user stories, it will not be built.

---

## Demo Script Outline (Midterm Path)

The demo will follow this exact path:

**Total time: 5–7 minutes**

1. Run `npm run dev:full`
2. Open http://localhost:5173
3. Create a new trip:
   - Enter name
   - Select destination type
   - Enter duration
4. Click **Generate Checklist**
5. Click **Save Trip**
6. Confirm the trip is saved successfully
7. Refresh the browser
8. Verify saved trips load from the server
9. Select a saved trip from the list
10. Confirm the checklist renders correctly
11. Check off an item
12. Refresh again to confirm the packed state persists

(Optional)
13. Open http://localhost:3000/docs to show Swagger API documentation

This demo demonstrates:
- Frontend → API → JSON storage integration
- Trip creation and persistence
- Trip retrieval (list + by ID)
- Checklist synchronization
- End-to-end MVP stability

---

## Top 3 Risks + Mitigation

### 1. JSON File Storage Limitations
**Risk:** Single-file storage can cause corruption or scalability limits.  
**Mitigation:** MVP limited to single-user local demo environment. Migration to database is explicitly deferred.

### 2. No Authentication
**Risk:** No user isolation; all trips are globally accessible.  
**Mitigation:** MVP explicitly scoped as single-user prototype (ADR-001). Auth deferred intentionally.

### 3. No Conflict Handling
**Risk:** Concurrent updates could overwrite data.  
**Mitigation:** MVP assumes single active client. Conflict resolution out of scope.

---

## Contract + Data Model Alignment

API Endpoints (MVP):
- `GET /api/trips`
- `GET /api/trips/{tripId}`
- `POST /api/saveTrip`
- `PUT /api/trips/{tripId}`

Canonical Data Model (MVP)

Trip Entity:
{
  id,
  name,
  destinationType,
  duration,
  checklist[],
  createdAt
}

Checklist Item Entity (canonical):
{
  id,
  name,
  category,
  packed
}

Persistence:
- Express.js server
- JSON file storage (`data/trips.json`) behind server storage module
- No authentication layer
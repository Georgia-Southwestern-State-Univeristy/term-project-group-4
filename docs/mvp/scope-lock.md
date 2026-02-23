# MVP Scope Lock
## Smart Packing Checklist Generator

This document defines the locked MVP scope for midterm.  
If a feature is not described here, it does not consume sprint time.

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

1. Run `npm run dev:full`
2. Open http://localhost:5173
3. Open the application in the browser
4. Create a new trip:
   - Enter name
   - Select destination type
   - Enter duration
5. Generate checklist
6. Save trip to server
7. Check off items
8. Refresh browser
9. Verify trip persists and progress is retained
10. Show API endpoints working

This demo proves:
- Frontend → API → storage integration
- Data persistence
- Checklist synchronization
- End-to-end functionality

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

API Endpoints:
- `GET /api/trips`
- `POST /api/saveTrip`
- `PUT /api/trips/{tripId}`

Trip Entity:
{
id,
name,
destinationType,
duration,
checklist[],
createdAt
}

Persistence:
- Express.js server
- JSON file storage (`data/trips.json`)
- No authentication layer
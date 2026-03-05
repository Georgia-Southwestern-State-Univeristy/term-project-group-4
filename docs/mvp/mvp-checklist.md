# MVP Checklist
## Smart Packing Checklist Generator

This document summarizes the current completion status of all locked MVP user stories, confirms whether acceptance criteria are satisfied, and identifies the top risks heading into the Beta phase.

---

## Board Evidence

GitHub Project Board:  
https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26/views/1

All story statuses below reflect the current state of the repository and project board.  
“Done” means merged to main via PR, reviewed, CI passing, and runnable.

---

# 1. MVP Story Status

| MVP Story | Status | Notes |
|---|---|---|
| Trip Creation | Done | Users can enter trip name, destination type, and duration through the UI. |
| Checklist Generation | Done | A rule-based generator creates a checklist based on destination type and duration. |
| Trip Persistence | Done | Trips are saved to the server and persisted in `data/trips.json`. |
| Progress Tracking | Done | Users can check/uncheck items and visually track packing progress. |
| Checklist Synchronization | Done | Updates to checklist items are persisted via `PUT /api/trips/{tripId}` and retained after refresh. |
| Trip Retrieval | Done | Users can retrieve previously saved trips and load them back into the UI. |

---

# 2. Acceptance Criteria Notes

### Trip Creation
**Acceptance Criteria**

- User can enter:
  - Trip name
  - Destination type
  - Duration
- Form submission generates a checklist.
- Validation prevents missing required inputs.

**Notes**

The frontend form captures user inputs and sends the data to the backend via `POST /api/saveTrip`.  
The server validates required fields and returns a trip object containing a generated ID.

---

### Checklist Generation
**Acceptance Criteria**

- Checklist is generated based on destination type and duration.
- Checklist items contain the canonical fields:
  - `id`
  - `name`
  - `category`
  - `packed`
- Checklist renders correctly in the UI.

**Notes**

Checklist generation is rule-based and covered by unit tests (`tests/checklistGenerator.test.js`).  
Items are grouped by category when rendered.

---

### Trip Persistence
**Acceptance Criteria**

- A generated checklist can be saved to the server.
- A saved trip receives a unique ID.
- Data is written to `data/trips.json`.

**Notes**

Persistence is handled through the Express API endpoint:
`GET /api/trips`


Trips are stored in a JSON file via the server storage module.

---

### Progress Tracking
**Acceptance Criteria**

- Users can toggle checklist items as packed/unpacked.
- Progress percentage updates visually.
- State reflects the current packing progress.

**Notes**

Checkbox changes update the checklist state and trigger server synchronization when the trip has already been saved.

---

### Checklist Synchronization
**Acceptance Criteria**

- Updates to checklist items persist after page refresh.
- Server remains the source of truth for trip state.

**Notes**

Checklist updates are sent through:
`PUT /api/trips/{tripId}`


Refreshing the page reloads the saved state from the server.

---

### Trip Retrieval
**Acceptance Criteria**

- User can view previously saved trips.
- User can select and load a saved trip.
- Form fields and checklist restore correctly.

**Notes**

The Saved Trips section retrieves data using:
`GET /api/trips`
`GET /api/trips/{tripId}`


Users can filter saved trips by name and load them into the form.

---

# 3. Top Risks Heading Into Beta

### Risk 1: JSON File Storage Limitations

**Description**

The application stores data in a single JSON file (`data/trips.json`).  
This approach does not support concurrent writes or high scalability.

**Impact**

Potential data corruption or race conditions if multiple clients write simultaneously.

**Mitigation**

- MVP is explicitly scoped to a **single-user demo environment**.
- Server API abstracts persistence, allowing future migration to a database.

---

### Risk 2: No Authentication / User Isolation

**Description**

All trips are accessible globally because authentication is not implemented.

**Impact**

Trips are not tied to individual users.

**Mitigation**

- MVP scope explicitly excludes authentication.
- The application is treated as a **single-user prototype**.
- User identity and account management are planned for a future phase.

---

### Risk 3: UI Error Handling Coverage

**Description**

Some frontend failure cases (network issues, API failures) currently rely on console logging and minimal user feedback.

**Impact**

Users may not receive clear feedback when operations fail.

**Mitigation**

- Add additional UI error messages during the Beta phase.
- Expand failure-path testing for API interactions.

---

# 4. Summary

All locked MVP stories are **completed and integrated end-to-end**:

- Frontend UI
- Express API
- JSON persistence
- Automated tests
- CI checks
- Documentation

The application is stable enough for demonstration and further iteration during the Beta phase.
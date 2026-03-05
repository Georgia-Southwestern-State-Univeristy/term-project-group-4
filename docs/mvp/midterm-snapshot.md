# Midterm Technical Snapshot of Smart Packing Checklist Generator 

## Architecture Overview

The system built with a frontend UI layer, backend API layer, and persistent data storage.

### High-Level Architecture Diagram

![Architecture Snapshot](../architecture/diagrams/architecture-snapshot-2-small.png)

**View the full architecture details:** [Architecture Snapshot](../architecture/architecture-snapshot.md)

**Key Components:**
- **Frontend :** React UI for trip planning and checklist management
- **Backend API (Express.js):** RESTful endpoints for CRUD operations on trips and checklists
- **Storage Layer:** JSON file-based persistence at `data/trips.json`
- **Checklist Generator:** Rule-based logic for destination and duration-aware packing lists


## System Setup & Execution

**For installation and running instructions, see the [README](../../README.md):**
- [Getting Started](../../README.md#getting-started)
- [Running Locally](../../README.md#running-locally)
- [Development Commands](../../README.md#development-commands) (includes `npm run seed`)


## Test Coverage & Status

### Test Files

**1. `tests/checklistGenerator.test.js`**
- Verifies essential items are always included
- Validates destination-specific items (beach, outdoors, city)
- Tests clothing quantity scaling based on trip duration
- Ensures extended trip items appear for 5+ day trips
- Confirms duplicate prevention across categories


**2. `tests/server.test.js`**

**POST /api/saveTrip (8 tests)**
- Creates trip with valid payload 
- Rejects missing required fields 
- Validates duration as positive integer
- Validates checklist item structure (`id`, `name`, `category`, `packed`) 
- Detects wrong field names (e.g., `completed` vs `packed`)

**GET /api/trips**
- Retrieves all saved trips

**PUT /api/trips/{tripId}**
- Updates trip by ID
- Handles missing trip (404)
- Validates duration on updates
- Validates checklist payload on updates


### Running Tests

```bash
# Run all tests
npm run test

# Expected output: 19+ tests passing
```

---

## Continuous Integration

### CI Pipeline: `.github/workflows/ci.yaml`

Runs on every pull request to `main`.

**Stages:**

1. **Code Linting** (`npm run eslint`)
   - ESLint code quality checks
   - Blocks merge if violations found

2. **Unit Tests** (`npm run test`, runs after linting passes)
   - Vitest + Supertest framework
   - 19+ tests covering checklist generation and API endpoints
   - Tests both positive and negative cases
   - Blocks merge if any test fails

### Current CI Status
- ✅ Linting checks active
- ✅ Unit test suite active



# Midterm MVP Demo
## Smart Packing Checklist Generator

This document contains the recorded demo of the Midterm MVP.

---

## Demo Video

**Video Link:**  
https://youtu.be/R89p3rNDIIQ

---

## Demo Overview

The video demonstrates the current MVP functionality of the Smart Packing Checklist Generator, including the full demo path, CI pipeline evidence, and a discussion of a known limitation.

---

## Demo Path

The demo follows the steps defined in `/docs/mvp/demo-readiness.md`.

### Steps Demonstrated

1. Start the application with:

```bash
npm run dev:full
```

2. Open the application at:

```
http://localhost:5173
```

3. Create a new trip
   - Enter trip name
   - Select destination type
   - Enter duration

4. Click **Generate Checklist**

5. Click **Save Trip**

6. Refresh the browser

7. Confirm the trip appears in the **Saved Trips** list

8. Click **Load** to restore the trip

9. Toggle checklist items to update packing progress

10. Refresh again to confirm packed state persists

---

## Evidence Moment (CI)

The demo also shows the CI pipeline status in the GitHub repository.

Evidence shown in the video:

- GitHub Actions workflow
- ESLint checks passing
- Vitest test suite passing (23 tests)

This demonstrates that the current `main` branch build is stable and passing all required checks.

---

## Reality Check (Known Limitation)

### Session-Limited Persistence

Trips persist only for the duration of a server session.  
If the server is stopped and restarted later, previously created trips do not remain available 

This limitation exists because the application currently relies on a local JSON file (`data/trips.json`) for storage rather than a database with durable persistence.

This limitation is acceptable for the MVP demo environment but will be addressed in a future database-backed implementation.

---

## Notes

The demo represents the **midterm MVP build** tagged as:

`midterm-v1.0.0`
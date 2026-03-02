# Demo Readiness Checklist
## Smart Packing Checklist Generator (Week 7)

This document ensures the MVP demo is repeatable, stable, and time-boxed to 5–7 minutes.  
Another teammate should be able to follow this without guessing.

---

## 1. Step-by-Step Demo Script (Exact Flow)

**Total Target Time: 5–7 minutes**

### Environment Setup (Before Demo)

1. Open terminal in project root.
2. Run:

   ```bash
   npm install
   ```

   (Optional) Verify tests pass:

    ```bash
    npm run test
    ```

3. Start full stack:

   ```bash
   npm run dev:full
   ```

4. Open browser to:

   ```
   http://localhost:5173
   ```

---

### Live Demo Flow

#### Step 1 — Create a Trip

- Enter a trip name (e.g. "Beach Weekend")
- Select destination type (e.g. Beach)
- Enter duration (e.g. 3)
- Click **Generate Checklist**

> **Explain briefly:** Checklist is generated client-side based on rules.

#### Step 2 — Save Trip

- Click **Save Trip**
- Confirm successful save (ID shown / success confirmation)

> **Explain briefly:** This sends a POST request to the Express API and writes to `data/trips.json`.

#### Step 3 — Refresh

- Refresh the browser

> **Explain briefly:** This proves data is persisted server-side, not just in memory.

#### Step 4 — Load Trips

- Confirm saved trip appears in the trip list
- If not auto-loaded, click **Load/Refresh** button (if present)

> **Explain:** Trips are retrieved using `GET /api/trips`.

#### Step 5 — Select Trip

- Click the saved trip from the list
- Confirm checklist renders correctly

> **Explain:** Selecting a trip retrieves its data from the server (via the trips API) and renders the checklist.

#### Step 6 — Update Checklist

- Check off one item
- Refresh the browser
- Confirm the packed state persists

> **Explain:** Checklist updates are saved via `PUT /api/trips/{tripId}`.

#### Step 7 — Show API Documentation *(Optional)*

Open:

```
http://localhost:3000/docs
```

Briefly show:

- `GET /api/trips`
- `GET /api/trips/{tripId}`
- `POST /api/saveTrip`
- `PUT /api/trips/{tripId}`

---

## 2. Known Issues (Transparency Section)

These are acceptable MVP limitations:

**No Authentication**  
All trips are globally accessible (single-user demo assumption).

**JSON File Storage**  
Data is stored in `data/trips.json`. Corruption or manual edits to this file could affect demo behavior.

**No Trip Deletion**  
Trips cannot be deleted in MVP.

---

## 3. Seed Data Plan (Ensuring Repeatable Demo)

Before starting the server for the demo, choose one of the following options:

**Option A — Clean Start (Preferred)**

1. Open `data/trips.json`
2. Replace contents with:

   ```json
   {
     "trips": []
   }
   ```

3. Save file.
4. Then start the server using `npm run dev:full`.

This ensures a predictable demo environment.

**Option B — Pre-Seeded Data**

1. Run the seed script (before starting the server):

    ```bash
    npm run seed
    ```
2. Then start the server using:

    ```bash
    npm run dev:full
    ```

This generates a sample data/trips.json file for a consistent demo dataset.

---

## 4. Fallback Plan (If Something Breaks)

### If Server Fails to Start

1. Stop all terminals.
2. Run:

   ```bash
   npm install
   npm run dev:full
   ```

3. Confirm server running at `http://localhost:3000`.

### If JSON File Is Corrupted

1. Stop server.
2. Reset `data/trips.json` to:

   ```json
   {
     "trips": []
   }
   ```

3. Restart server.

### If Trips Don't Auto-Load

1. Refresh page.
2. Confirm Express server is running.
3. Manually call:

   ```
   http://localhost:3000/api/trips
   ```

   to verify API is responding.

### If Frontend Fails

1. Confirm Vite server is running at port 5173.
2. Restart with:

   ```bash
   npm run dev
   ```

---

## 5. Demo Timebox Strategy

| Segment | Time |
|---|---|
| Setup + explanation | 1 minute |
| Create + Save | 2 minutes |
| Refresh + Load | 1 minute |
| Select + Update checklist | 1 minute |
| Swagger docs + wrap-up | 1 minute |
| **Total** | **5–6 minutes** |

**Avoid:**

- Editing code live
- Showing test output
- Deep architecture explanation

Focus on the stable MVP path.

---

## Demo Success Criteria

The demo is successful if:

- [ ] Trip can be created
- [ ] Trip persists after refresh
- [ ] Trip can be reloaded
- [ ] Checklist state persists
- [ ] API documentation loads
- [ ] No runtime errors occur

If all of these are true, MVP is stable.
These criteria validate all locked MVP user stories in a single stable demo path.
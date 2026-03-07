# Release Notes — Midterm Build
## Smart Packing Checklist Generator

This document summarizes the contents of the **midterm MVP build**, known limitations, and the steps required to reproduce the demo path used during the midterm evaluation.

---

# Release Information

**Release Version:** `midterm-v1.0.0`
**Release Date:** 5 March 2026

**Evidence:**

GitHub Release:  
https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/releases/tag/midterm-v1.0.0

---

# What’s Included in the Midterm Build

The midterm build includes the core MVP functionality of the **Smart Packing Checklist Generator**.

### Core Features

**Trip Creation**

* Users can create a trip by entering:

  * Trip name
  * Destination type
  * Trip duration

**Checklist Generation**

* A rule-based system generates a packing checklist based on the selected destination and duration.

**Trip Persistence**

* Trips can be saved to the server.
* Data is persisted in `data/trips.json`.

**Progress Tracking**

* Users can check and uncheck items in the packing checklist.
* Packing progress is displayed as a count and percentage.

**Checklist Synchronization**

* Updates to checklist items are saved to the server.
* Checklist state persists after refreshing the page.

**Trip Retrieval**

* Previously saved trips appear in the **Saved Trips** section.
* Users can load a saved trip and restore its checklist.

**Saved Trips Filtering**

* Trips can be filtered by name using the search input.

**API Documentation**

* Swagger UI is available at:

```
http://localhost:3000/docs
```

---

# Known Issues / Limitations

### JSON File Storage

Trip data is stored in a single JSON file (`data/trips.json`).
This approach does not support concurrent users and is intended only for a local demo environment.

### No Authentication

The application does not implement user accounts or login functionality.
All saved trips are accessible globally.

### Limited Error Messaging

Some error conditions (such as network failures) may only appear in the console rather than displaying detailed messages in the UI.

### Single-User Assumption

The current implementation assumes only one active user interacting with the application.

### Session-Limited Persistence

Trips persist only for the duration of a server session. If the server is stopped and restarted later, previously created trips do not remain available because the application relies on local JSON storage.

---

# How to Reproduce the Demo Path

Follow the steps below to run the application and reproduce the midterm demo.

### 1. Install Dependencies

```bash
npm install
```

---

### 2. (Optional) Seed Demo Data

To populate the application with example trips before running the demo:

```bash
npm run seed
```

This generates a sample `data/trips.json` file.

---

### 3. Start the Application

```bash
npm run dev:full
```

This command starts:

* Express API server on: 

```
http://localhost:3000/docs
```
* Vite frontend server on:

```
http://localhost:5173
```
---

### 4. Open the Application

Navigate to:

```
http://localhost:5173
```

---

### 5. Demo Flow

1. Enter a **trip name**
2. Select a **destination type**
3. Enter a **duration**
4. Click **Generate Checklist**
5. Click **Save Trip**
6. Confirm the button shows **Saved!** with a trip ID
7. Verify the trip appears in the **Saved Trips** list below the form
8. Click **Load** on a saved trip to restore the trip and checklist
9. Check off an item in the checklist
10. Refresh the browser and confirm the checklist state persists

---

# Summary

The midterm build delivers a working MVP that supports:

* Trip creation
* Checklist generation
* Trip persistence
* Checklist updates
* Trip retrieval
* End-to-end demo functionality

The application is stable enough for demonstration and further development as the project moves into the **Beta phase**.
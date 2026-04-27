# Week 15 Final QA Checklist and Demo Path

**Date:** April 22, 2026  
**Status:** Final Presentation Preparation  
**Build:** Release Candidate `rc-v0.9` (April 19, 2026)  
**Target Audience:** Project reviewers and final presentation attendees

---

## Overview

This document serves as the **final quality assurance checklist** and **exact demo script** for the Smart Packing Checklist Generator final presentation. The QA checklist ensures the system is production-ready before the live demo. The demo path is the exact sequence of steps the team will execute during the final presentation.

**Minimum Bar:** Demo path has been rehearsed end-to-end with all steps passing. If this is not true, the application is not final-ready.

---

## Final QA Checklist (Required: 10+ Checks)

All checks must pass **before** the final presentation. Run through this checklist the day of or the day before the demo.

### Startup and Deployment Verification

#### ✅ Check 1: Local Environment Setup
- [x] Clone repository to a clean directory
- [x] Run `npm install` — all dependencies install without errors
- [x] Run `npm run dev:full` — both frontend (Vite) and backend (Express) start without errors
- [x] Navigate to http://localhost:5173 manually

#### ✅ Check 2: Production Deployment Verification
- [x] Hosted application at https://spcg.zentrofi.com loads without errors
- [x] Application responds within 5 seconds
- [x] Static assets (CSS, JS) load correctly (no 404 errors in DevTools)

#### ✅ Check 3: Health Endpoint Verification
- [x] `https://spcg.zentrofi.com/health` returns HTTP 200 with JSON response
- [x] Health response includes status, environment, version, requestId, uptimeSeconds, database, and config
- [x] Database status indicates the database path is writable
- [x] Config status indicates required configuration is valid

---

### Authentication and Access Control Checks

#### ✅ Check 4: Google OAuth Login Flow
- [x] "Sign in with Google" button visible on unauthenticated page
- [x] Click sign-in button opens Google OAuth redirect
- [x] After successful login, user returns to application
- [x] Application displays authenticated state (e.g., "Sign out" button instead of "Sign in")
- [x] Session persists on page refresh (user remains logged in)


#### ✅ Check 5: Access Control - Clear Application data (cookies)
- [x] Load a saved trip
- [x] Clear site data including the third party cookies using browser console (Open the developer tools, navigate to Application tab). 
- [x] Try to update the trip
- [x] User should get 'Unauthorized' message

---

### Core Workflow Steps

#### ✅ Check 6: Trip Creation and Checklist Generation
- [x] Trip form visible and accessible to authenticated users
- [x] Enter trip name: "Beach Weekend", destination: "Beach", duration: "3"
- [x] Click "Generate Checklist" button
- [x] Checklist appears with 5+ contextual items (sunscreen, swimsuit, flip-flops, etc.)
- [x] Checklist items are unchecked initially

#### ✅ Check 7: Trip Persistence (Save, Reload, Verify)
- [x] Click "Save Trip" button — success message appears
- [x] Form resets to empty state
- [x] Refresh browser
- [x] Saved trip appears in "Saved Trips" list
- [x] Load saved trip
- [x] Checklist re-renders with same items

#### ✅ Check 8: Checklist Item Toggle and State Persistence
- [x] Check off 2-3 items in the checklist
- [x] Checkboxes visually update (✓ shown)
- [x] Wait ~1 second for checklist auto-save to complete
- [x] Refresh browser
- [x] Same items remain checked after refresh

#### ✅ Check 9: Trip Edit Workflow (Update and Change Detection)
- [x] Load a saved trip — form shows "Editing: Beach Weekend" context
- [x] Save button text changes to "Update Trip"
- [x] Button is disabled immediately after load (no unsaved changes)
- [x] Edit trip name and button becomes enabled
- [x] Click "Update Trip" — success message appears
- [x] Trip list updates with new name; changes persist after refresh
---

### Error Handling and Edge Cases

#### ✅ Check 10: Network Error Handling
- [x] Login to the app
- [x] Set the Network 'offline' from browser dev tools
- [x] Try to Save a trip
- [x] Error toast appears within 15 seconds: "Failed to Save the trip" 
- [x] User is not blocked (can retry, form is responsive)


#### ✅ Check 11: Authentication Error Handling
- [x] Navigate to app with URL param: `?authError=google_login_failed`
- [x] Error toast message appears: "Google login failed"
- [x] Error parameter is removed from URL after toast displays
- [x] User is not logged in (Sign in button visible)
- [x] Trip form is **hidden** (not accessible to unauthenticated users)
- [x] Login section is **visible** (user can retry)

---

### UI and Usability Sanity Checks

#### ✅ Check 12: Form Usability and Input Validation
- [x] Destination type has 3+ options in dropdown (Beach, City, Outdoor/Camping)
- [x] Duration input accepts numbers (e.g., 3, 7)
- [x] Duration has reasonable constraints (e.g., 1-10 days, not negative)
- [x] Checklist displays as a readable list (not overlapping, not cut off)
- [x] Long trip names don't break layout

---

## Exact Demo Path

### Demo Execution (5–7 minutes)

#### **Phase 0: Open Deployed Application**

1. **Show the live application**
   - https://spcg.zentrofi.com
   - Confirm application loads successfully

#### **Phase 1: Authentication**

2. **Show the unauthenticated state**
   - "Here's the application. Users must sign in with Google to access the trip planner."
   - Point out: "Sign in with Google" button, clean interface

3. **Click "Sign in with Google"**
   - Brief pause for OAuth popup/redirect
   - "The app uses Google OAuth for secure authentication."
   - Complete login (or show pre-logged-in state if already authenticated)

4. **After login, point out authenticated state**
   - "Now the user is logged in. Notice the trip form is now visible."
   - Show form fields: Trip Name, Destination Type, Duration, Generate Checklist button

---

#### **Phase 2: Create and Generate Checklist**

5. **Fill out the trip form**
   - **Trip Name:** "Beach Weekend"
   - **Destination Type:** Select "Beach" from dropdown
   - **Duration:** "3" (days)

6. **Click "Generate Checklist"**
   - Checklist appears in real-time (client-side generation)
   - Show items: sunscreen, swimsuit, flip-flops, etc.
   - "The app generates a smart packing list based on the destination and length of trip. No server call needed — it's client-side generation for speed."

---

#### **Phase 3: Save and Persist**

7. **Click "Save Trip"**
   - Success toast appears: "Trip saved"
   - Form resets to empty state
   - "The trip is now saved to the database with the user's checklist."

8. **Refresh the browser**
   - Wait 2 seconds for page reload
   - "When I refresh, the trip persists because it's backed by a server database, not just local storage."

9. **Demonstrate persistence**
   - Saved trips list appears: "Beach Weekend" now visible
   - Click the saved trip
   - Form repopulates: Trip Name = "Beach Weekend", Destination = "Beach", Duration = "3"
   - Checklist re-renders with the same items
   - "The user can load their trip back anytime. The data doesn't disappear."

---

#### **Phase 4: Interact with Checklist**

10. **Check off a few items**
    - Click checkboxes: "sunscreen" ✓, "swimsuit" ✓
    - Items visually update (checked state shows)
    - "Users can track what they've packed."

11. **Refresh again**
    - "If I refresh now, the packed state persists too."
    - Verify: "sunscreen" and "swimsuit" still checked
    - Uncheck one item, refresh, verify state persists

---

#### **Phase 5: Edit Workflow**

12. **Load the saved trip (if not already loaded)**
    - Form is in edit mode: "Editing: Beach Weekend" shown
    - Save button says "Update Trip" (not "Save Trip")
    - Button is disabled (no unsaved changes)

13. **Make a small edit**
    - Change trip name: "Beach Weekend" → "Beach Vacation"
    - "Update Trip" button becomes **enabled**
    - "The app detects changes and enables the update button only when needed."

14. **Click "Update Trip"**
    - Success toast: "Trip updated"
    - List updates with new name: "Beach Vacation"
    - Refresh to confirm persistence

---

## What Succeeded During Rehearsal

### ✅ **Checklist Generation Logic**
- Destination-based checklist rules work as designed
- Items are contextually relevant (Beach → sunscreen, swimsuit; Mountain → hiking boots, backpack)

### ✅ **Data Persistence**
- Trips persist to SQLite database via Knex.js
- Data survives after a refresh
- Trips correctly associated with authenticated user


### ✅ **Authentication and Access Control**
- Google OAuth login workflow works end-to-end
- Sessions persist across browser refresh
- Unauthenticated users cannot access trip form or see other users' trips


### ✅ **Checklist Item State Management**
- Packed/unpacked toggle state persists to database
- State survives refresh and reload
- Edit-mode state transitions are stable (no flaky UI)


### ✅ **Production Deployment**
- Application deployed to AWS Elastic Beanstalk at https://spcg.zentrofi.com
- Health endpoint confirms database connectivity

---

## What Broke During Rehearsal

### ❌ **Issue #150: 'Update Trip' Button Enabled When User Interacts with Checklist**

**What Happened:**  
During rehearsal, after loading a saved trip into edit mode, checking/unchecking checklist items caused the "Update Trip" button to become **enabled**, even though those changes were auto-saved to the database. This was confusing because it suggested unsaved changes existed when they didn't, potentially leading users to waste a click on the Update button thinking they had unsaved work.

**Decision: Deferred (Low Priority)**  
This issue was determined to be low-priority and deferred past the final release because: (1) the button state mismatch is cosmetic and doesn't break functionality, (2) users can still complete the full workflow successfully (the trip updates correctly despite the button state), and (3) the fix requires careful event handling refactoring that could introduce regressions close to demo day. If time permits after the release, we'll address it by filtering out auto-save events from the change-detection logic.

**GitHub Issue:** [#150](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/150)

---

### ❌ **Issue #151: No Way to Reset Form After Loading a Saved Trip**

**What Happened:**  
During rehearsal, when a trip was accidentally loaded while setting up the demo, there was no clear way to reset the form back to "New Trip" mode without navigating away. This blocked the demo flow because the presenter couldn't quickly recover from the accidental load without restarting the workflow.

**Decision: Deferred (Low Priority)**  
This issue was deferred because: (1) in real usage, users would navigate away or refresh if they wanted a fresh form (not a critical blocker), (2) a proper fix requires adding UI (e.g., "Start New Trip" button) which adds scope, and (3) workarounds exist (refresh the page, clear the form manually). The team prioritized rehearsal recovery over implementing a new feature close to the demo.

**GitHub Issue:** [#151](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/151)

---

## What Was Fixed During Rehearsal

Both issues were identified during rehearsal and entered into the backlog. No code changes were required before the final presentation—the demo adapted to these minor limitations without impacting the core workflow demonstration.

---
---

## High-Priority PRs for Final Release

| PR | Status | Title | Link |
|---:|:------:|:------|:-----|
| #153 | Delivered (merged) | Added a condition to DB migration | [#153](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/153) |
| #154 | Draft | WIP: Audit and eliminate XSS in trip rendering (#82) | [#154](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/154) |
| #155 | Draft | WIP: Add input length limits on trip fields (#81) | [#155](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/155) |




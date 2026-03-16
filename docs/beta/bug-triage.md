# Bug Triage
## Smart Packing Checklist Generator

This document logs issues discovered during the midterm demo and teammate testing.  
Each issue includes severity, reproduction steps, expected vs. actual behavior, and tracking links.

---

## Issue 1: ESLint does not recognize Vitest globals in test files

**Severity:** Minor

**Summary:**  
The ESLint configuration does not include Vitest globals for test files. As a result, ESLint may report errors indicating that common testing functions such as `describe`, `it`, `test`, `expect`, and `beforeEach` are undefined.

**Repro Steps:**
1. Open a terminal in the project root.
2. Run:

    ```bash
    npm run lint
    ```

3. Review lint results for files ending in `.test.js`.
4. ESLint may report errors similar to:

    ```text
    'describe' is not defined  no-undef
    'it' is not defined        no-undef
    'expect' is not defined    no-undef
    ```

**Expected Behavior:**  
ESLint should recognize Vitest testing globals in `.test.js` files so that valid test code does not trigger `no-undef` errors.

**Actual Behavior:**  
Vitest globals are not included in the ESLint configuration, causing valid test code to be flagged as undefined variables.

**Impact:**  
This does not break the application or test execution, but it can create confusion during development and produce misleading lint errors when writing or modifying tests.

**Technical Cause:**  
The ESLint configuration currently only includes Node globals for test files:

    globals: {
        ...globals.node
    }

Vitest globals are not included.

**Proposed Fix:**  
Update the ESLint configuration to include Vitest globals.

**Example change in `eslint.config.js`:**

    globals: {
        ...globals.node,
        ...globals.vitest
    }

**Fix Status:** TBD  
**Regression Test:** Run `npm run lint` and confirm `.test.js` files do not produce `no-undef` errors for Vitest globals  
**Issue Link:** TBD  
**PR Link:** TBD

---

## Issue 2: Trip form does not clear after saving

**Severity:** Major

**Summary:**  
After saving a trip, the trip name, destination type, and duration fields remain populated instead of automatically clearing.

**Repro Steps:**
1. Start the app with:

    ```bash
    npm run dev:full
    ```

2. Open `http://localhost:5173`.
3. Enter a trip name.
4. Select a destination type.
5. Enter a duration.
6. Click **Generate Checklist**.
7. Click **Save Trip**.

**Expected Behavior:**  
After saving a trip, the trip name, destination type, and duration fields should automatically clear so the user can easily create another checklist.

**Actual Behavior:**  
The trip name, destination type, and duration fields remain populated after saving.

**Impact:**  
This slows down repeated checklist creation and creates friction for users who want to quickly enter a new trip after saving the previous one.

**Fix Status:** TBD  
**Regression Test:** Add frontend/UI test or manual verification notes confirming fields clear after save  
**Issue Link:** TBD  
**PR Link:** TBD

---

## Issue 3: Checklist changes persist without clear UI feedback

**Severity:** Major

**Summary:**  
When a user checks or unchecks items in a loaded checklist, the changes are auto-saved and persist after refresh, but the UI does not clearly communicate that persistence is happening.

**Repro Steps:**
1. Start the app.
2. Create and save a trip.
3. Load the saved trip from the **Saved Trips** list.
4. Check or uncheck one or more checklist items.
5. Refresh the browser.

**Expected Behavior:**  
The UI should indicate that checklist changes were saved, such as a save status message, toast, or inline confirmation.

**Actual Behavior:**  
The checklist changes persist after refresh, but there is no visible feedback that saving occurred.

**Impact:**  
Users may not realize their changes were saved and may think the behavior is inconsistent or accidental.

**Fix Status:** TBD  
**Regression Test:** If fixed, add UI/manual verification notes  
**Issue Link:** TBD  
**PR Link:** TBD

---

## Issue 4: Generate Checklist can be used without clear required-field guidance

**Severity:** Minor

**Summary:**  
The UI does not clearly indicate that trip name, destination type, and duration are required before generating a checklist.

**Repro Steps:**
1. Open the app.
2. Observe the trip creation form before entering any data.
3. Note that the required fields are not visually marked.
4. Click **Generate Checklist** without filling in the form.

**Expected Behavior:**  
The UI should clearly communicate that all three trip creation fields are required, either by:

- disabling **Generate Checklist** until fields are completed, or  
- marking required fields visually (for example, with an asterisk).

**Actual Behavior:**  
Required fields are not clearly identified in the UI.

**Impact:**  
This can confuse users and contribute to invalid or incomplete inputs.

**Fix Status:** TBD  
**Regression Test:** If fixed, add UI/manual verification notes  
**Issue Link:** TBD  
**PR Link:** TBD

---

## Issue 5: Required text fields accept whitespace-only input

**Severity:** Major

**Summary:**  
The trip creation form allows whitespace-only values in required text fields, such as the trip name.

**Repro Steps:**
1. Open the app.
2. Enter only spaces in the trip name field.
3. Complete the remaining fields as needed.
4. Click **Generate Checklist**.

**Expected Behavior:**  
Whitespace-only values should be treated as empty and rejected by validation.

**Actual Behavior:**  
The form accepts whitespace-only input and allows checklist generation.

**Impact:**  
Invalid trip data can be created, reducing data quality and making saved trips confusing or less useful.

**Fix Status:** TBD  
**Regression Test:** Add validation test confirming trimmed-empty values are rejected  
**Issue Link:** TBD  
**PR Link:** TBD

---

## Issue 6: Editing a loaded trip can create duplicate trips

**Severity:** Major

**Summary:**  
When a user loads a saved trip and regenerates the checklist before saving, the application can create a duplicate trip instead of updating the original one.

**Repro Steps:**
1. Start the app.
2. Create and save a trip.
3. Load the saved trip from the **Saved Trips** list.
4. Edit one or more trip fields.
5. Click **Generate Checklist**.
6. Click **Save Trip**.

**Expected Behavior:**  
Editing and saving a loaded trip should update the existing saved trip.

**Actual Behavior:**  
The application creates a new trip instead of updating the original one.

**Technical Cause:**  
In `tripForm.js`, when loading a saved trip the application stores the identifier:

    `savedTripId = trip.id;`

However, when submitting the form to regenerate a checklist, the code resets:

    `savedTripId = null;`

This removes the reference to the original trip, so saving creates a new entry instead of updating the existing one.

**Impact:**  
High user-facing risk:
- Duplicate trips may appear in the saved trips list.
- Users may unintentionally create multiple versions of the same trip.
- Data divergence may occur between edited and original trips.

**Fix Implemented:**  
Removed the logic that reset `savedTripId` when generating a new checklist so that editing a loaded trip preserves its identifier and updates the existing record when saved.

**Fix Status:** Fixed
**Regression Test:** Manual regression verification performed:
    1. Create and save a trip.
    2. Load the saved trip.
    3. Modify one or more fields.
    4. Click **Generate Checklist**.
    5. Click **Save Trip**. 
    6. Confirm the existing trip updates instead of creating a duplicate.

**Issue Link:** https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/65
**PR Link:** https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/65

---

# Fixed Issues and Regression Protection

The following issues must be fixed during this deliverable, with regression tests added when feasible.

---

## Issue 6: Editing a loaded trip can create duplicate trips

**Fix PR:** https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/66
**Regression Test:** Manual regression verification (see steps above).

---

## Issue TBD

**Fix PR:** TBD  
**Regression Test:** TBD

---

# Notes

- If a bug fix changes behavior that could regress later, a regression test should be added whenever practical.
- Documentation should be updated if user-visible behavior changes.
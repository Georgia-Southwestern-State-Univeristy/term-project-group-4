# Week 10 UX Improvements

## Overview

Two usability fixes were implemented this week to address friction points identified during the MVP demo. Both target the primary workflow: creating a trip and generating a packing checklist.

---

## Fix 1: Checklist Generation Loading Indicator

**Sprint Item:** #6 — UX polish: loading indicator
**PR:** [#80](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/80) (`week10/issue-76-loading-indicator`)
**Owner:** Jason

### Before

When a user clicked "Generate Checklist," there was no visual feedback. The button remained static while the checklist was being built, giving no indication that the action was processing. Users could click the button multiple times or assume the app was broken.

### After

- A CSS spinner and "Generating checklist..." text appear immediately on click
- The button text changes to "Generating..." and becomes disabled to prevent duplicate submissions
- Once generation completes (or fails), the spinner hides and the button resets to its default state
- Uses `requestAnimationFrame` to ensure the browser paints the spinner before starting generation

### Files Changed

- `index.html` — added `#checklist-loading` div with spinner markup
- `src/style.css` — spinner animation and loading indicator styles
- `src/tripForm.js` — async submit handler with `setChecklistLoading()` toggle

---

## Fix 2: Server Validation Messages in Toast Notifications

**Sprint Item:** #3 — Display API errors in UI
**PR:** [#78](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/78) (`week10/issue-75-api-error-toasts`)
**Owner:** Jason

### Before

- API errors displayed generic hardcoded messages (e.g., "Failed to save trip (network error)") regardless of the actual server response
- Trip deletion failures were silently logged to the console with no user-facing feedback
- Server validation messages (e.g., "name must not be blank") were lost — only HTTP status codes were surfaced

### After

- A `getErrorMessage()` helper in `apiClient.js` extracts the actual error text from server responses (`body.error` or `body.message`)
- All API operations (save, update, delete, load) now display the server's specific validation message in the toast
- Delete operations show success ("Trip deleted successfully") and failure toasts
- Error messages are actionable — users see what went wrong (e.g., "name is required") instead of a generic network error

### Files Changed

- `src/apiClient.js` — added `getErrorMessage()` helper; all API functions use it
- `src/main.js` — added delete success/failure toasts; improved load error messages
- `src/tripForm.js` — improved save/sync error messages to include server text

---

## Evidence

| Fix | PR | CI Status | Demo Path |
|-----|----|-----------| ----------|
| Loading indicator | [#80](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/80) | Passing | Create trip → click Generate → spinner visible → checklist appears |
| API error toasts | [#78](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/78) | Passing | Submit empty name → toast shows server validation error; delete trip → success toast |

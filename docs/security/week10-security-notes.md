# Week 10 Security Notes
## Smart Packing Checklist Generator

## Overview

This document identifies security risks introduced or exposed during Week 10, particularly related to authentication, API access, and data ownership.

---

# 1. Identified Risks

## Risk 1: Missing ownership enforcement (IDOR risk)

### Description
Trip endpoints allow access by ID:

- GET /api/trips
- GET /api/trips/:tripId
- PUT /api/trips/:tripId  
- DELETE /api/trips/:tripId  

Without verifying ownership, a user could read, modify, or delete another user’s trip.

### Impact
- Unauthorized data modification
- Data integrity compromise

### Status
**Fixed**

---

## Risk 2: Backend endpoints may not enforce authentication

### Description
Authentication was introduced using Google auth, but if backend routes are not protected, users can bypass the UI and call APIs directly.

### Impact
- Unauthorized access via direct API calls
- Security depends on frontend only (not acceptable)

### Status
**Fixed**

---

## Risk 3: Inconsistent validation on update endpoints

### Description
PUT endpoints accept partial updates. While some validation exists, inconsistencies may allow malformed or incomplete data.

### Impact
- Potential data inconsistency
- Unexpected application behavior

### Status
**Not fixed in this iteration**

### Rationale
Priority was given to authentication and access control risks, as they directly impact data security and unauthorized access. Validation improvements will be addressed in a future iteration.

---

# 2. Validation Improvements

## Validation Point 1: POST /api/saveTrip

### Before
Limited validation allowed malformed or incomplete payloads.

### After
- Required fields enforced
- Checklist schema validated (id, name, category, packed)

---

## Validation Point 2: PUT /api/trips/:tripId

### Before
Partial updates could bypass validation rules.

### After
- Duration validated as positive integer
- Checklist structure validated
- Invalid updates rejected

---

# 3. Security Fixes

## Fix 1: Enforce authentication on protected endpoints

### Before
API routes could be accessed without authentication.

### After
Protected routes now require authenticated users and reject unauthorized requests.

### Behavior Change
- Before: GET /api/trips could be called without authentication
- After: Unauthenticated requests return 401 Unauthorized

- Before: POST /api/saveTrip allowed direct API calls without login
- After: Requests without authentication are rejected

### Evidence
PR: Week10/authentication-enforcement #73

---

## Fix 2: Enforce ownership for trip modification/deletion

### Before
Any user could read, modify, or delete any trip by ID.

### After
Trip operations now verify that the authenticated user owns the trip.

### Behavior Change
- Before: User B could update or delete User A’s trip by ID
- After: Cross-user update/delete attempts return 404

- Before: Any user could fetch any trip by ID
- After: Only the owning user can access the trip

### Evidence
PR: Week10/ownership-enforcement #79

---

# 4. Summary

Week 10 improvements focused on securing API access and ensuring proper validation:

- Added authentication enforcement to backend endpoints
- Prevented unauthorized access to other users’ data
- Strengthened validation for create and update flows
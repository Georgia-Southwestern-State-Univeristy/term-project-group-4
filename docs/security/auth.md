# Authentication & Authorization

## Overview

SmartChecklist uses **Google OAuth 2.0** for user authentication combined with **session-based authorization**. All API endpoints require user authentication. Users can only access and modify their own trips.

---

## Authentication Method

### Google OAuth 2.0

**Implementation:**
- Third-party authentication via Google's OAuth 2.0 protocol
- Integrated with Passport.js middleware
- Uses `passport-google-oauth20` strategy

**Flow:**
1. User clicks "Login with Google" button
2. Redirected to `/auth/google` endpoint
3. Google authentication screen appears
4. Upon successful authentication, user is redirected to `/auth/google/callback`
5. User profile data is retrieved (id, email, name, picture)
6. User record is created or fetched from database (idempotent)
7. Session is established with Express Session middleware
8. User is redirected to frontend application

**Endpoints:**
- `GET /auth/google` - Initiates Google OAuth flow
- `GET /auth/google/callback` - OAuth callback endpoint (handled by Passport)
- `GET /auth/logout` - Logs out the user, destroys the session, and clears the session cookie
- `GET /auth/user` - Returns authenticated user info; responds with 401 if not authenticated

**Environment Variables Required:**
```
GOOGLE_CLIENT_ID       # OAuth client ID from Google Cloud Console
GOOGLE_CLIENT_SECRET   # OAuth client secret
SESSION_SECRET         # Secret key for session encryption (required for production)
FRONTEND_URL           # Frontend application URL for post-login redirect
```

### Session Management

- **Type:** Express Session with server-side storage
- **Serialization:** User ID is stored in session cookie
- **Deserialization:** User object is fetched from database per request
- **Duration:** Session cookie behavior depends on Express Session defaults and browser lifecycle; no custom expiration policy is currently configured
- **Security:** 
  - Session secret should be strong and unique per environment

## Protected Routes & Endpoints

### Authentication Required

All API endpoints **require authentication**. Requests without a valid session receive a **401 Unauthorized** response.


### Access Control Rules (Implemented)

**Primary Access Control: Login Required**
- All API endpoints require user authentication via `requireAuth` middleware
- Unauthenticated requests receive `401 Unauthorized` response
- This is the main access control rule: **main content is hidden until user logs in**

**Data Isolation by User**
- All API data (trips, checklists) is filtered by the authenticated user's `user_id`
- Users cannot access, modify, or delete other users' data
- Attempting to access another user's trip returns `404 Not Found`


### User Roles

Currently, **only a single user role exists**:

#### Standard User
- Can view their own trips
- Can create new trips
- Can update their own trips
- Can delete their own trips
- **Cannot** see other users' trips
- **Cannot** modify admin settings


### User role Limitations

- No admin role implemented
- No shared trips or collaboration features
- No granular permissions system (all authenticated users have same capabilities)
- No role-based middleware; all rules are user-isolation checks


## Security Assumptions & Limitations

### Assumptions

1. **Google OAuth Trust:** We assume Google's OAuth 2.0 infrastructure is secure and properly validates user identity
2. **Session Secret Security:** Assumes `SESSION_SECRET` environment variable is set to a strong, cryptographically random value in production
3. **HTTPS in Production:** We assume production deployment uses HTTPS to protect session cookies and credentials in transit
4. **Database Security:** Assumes the SQLite/PostgreSQL database is properly secured and not directly exposed
5. **User Device Security:** Assumes the user's browser and device are not compromised

### Known Limitations

1. **No Token Expiration:** Session tokens never expire during the same browser session; browser closure is required to force re-authentication
2. **Limited Input Validation:** The backend validates required fields and checklist shape, but does not yet enforce stronger input-length limits, output encoding strategy, or broader hardening against abuse.
3. **No Audit Logging:** User actions are logged for debugging but not for security auditing
4. **No 2FA/MFA:** Multi-factor authentication is not available
5. **No Password Management:** Users cannot change passwords (authentication is OAuth-only)
6. **No Account Recovery:** If a user loses access to their Google account, their SmartChecklist data is unreachable


## Testing

### Test User Authentication

In test environment (`NODE_ENV=test`), use the `x-test-user-id` header to simulate authenticated requests:

```bash
curl -X GET http://localhost:3000/api/trips \
  -H "x-test-user-id: test-user-123"
```

This bypasses OAuth and session requirements for automated testing.


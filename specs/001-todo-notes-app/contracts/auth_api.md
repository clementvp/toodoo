# Authentication API Contract

**Feature**: Super Todo & Notes Web Application
**User Story**: P1 - User Registration and Authentication
**Date**: 2026-02-05

## Overview

Authentication endpoints for user registration, login, and logout. Implements FR-001, FR-002, and FR-003 (data isolation).

---

## Endpoints

### POST /register

Register a new user account with secure password storage.

**Authentication**: None (public endpoint)

**Request**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation**:

- `email`: Valid email format, unique across all users
- `password`: Minimum 8 characters

**Success Response** (201 Created):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**Behavior**:

- Password is hashed using bcrypt before storage
- Session is created automatically (user is logged in)
- Redirects to `/todos` page via Inertia.js

**Error Responses**:

_422 Unprocessable Entity_ (validation errors):

```json
{
  "errors": [
    {
      "field": "email",
      "message": "The email has already been taken",
      "rule": "unique"
    }
  ]
}
```

_422 Unprocessable Entity_ (invalid email):

```json
{
  "errors": [
    {
      "field": "email",
      "message": "The email field must be a valid email address",
      "rule": "email"
    }
  ]
}
```

_422 Unprocessable Entity_ (password too short):

```json
{
  "errors": [
    {
      "field": "password",
      "message": "The password field must be at least 8 characters",
      "rule": "minLength"
    }
  ]
}
```

---

### POST /login

Authenticate an existing user and create a session.

**Authentication**: None (public endpoint)

**Request**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200 OK):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**Behavior**:

- Validates credentials using bcrypt password comparison
- Creates session with HTTP-only cookie
- Session timeout: 30 minutes of inactivity (configurable)
- Redirects to `/todos` page via Inertia.js

**Error Responses**:

_400 Bad Request_ (invalid credentials):

```json
{
  "errors": [
    {
      "message": "Invalid credentials"
    }
  ]
}
```

_422 Unprocessable Entity_ (missing fields):

```json
{
  "errors": [
    {
      "field": "email",
      "message": "The email field is required",
      "rule": "required"
    }
  ]
}
```

---

### POST /logout

End the current user session.

**Authentication**: Required (authenticated user)

**Request**: No body required

**Success Response** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

**Behavior**:

- Destroys current session
- Clears session cookie
- Redirects to `/login` page via Inertia.js

**Error Responses**:

_401 Unauthorized_ (no active session):

```json
{
  "errors": [
    {
      "message": "Unauthorized"
    }
  ]
}
```

---

### GET /me

Get the currently authenticated user's information.

**Authentication**: Required (authenticated user)

**Request**: No parameters

**Success Response** (200 OK):

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**Error Responses**:

_401 Unauthorized_ (no active session):

```json
{
  "errors": [
    {
      "message": "Unauthorized"
    }
  ]
}
```

---

## Security Features

**Password Storage**:

- Bcrypt hashing with minimum 10 rounds
- Passwords never exposed in responses (serializeAs: null)

**Session Management**:

- HTTP-only session cookies (XSS protection)
- Secure flag in production (HTTPS only)
- CSRF protection via AdonisJS middleware
- Session timeout: 30 minutes inactivity

**Data Isolation**:

- Each user session is isolated
- User can only access their own data
- No API endpoint exposes cross-user data

---

## Inertia.js Integration

All authentication endpoints return Inertia responses for seamless page transitions:

**Registration Success**:

```typescript
return inertia.render('todos/index', {
  user: auth.user,
  flash: { success: 'Account created successfully' },
})
```

**Login Success**:

```typescript
return inertia.render('todos/index', {
  user: auth.user,
  flash: { success: 'Welcome back!' },
})
```

**Logout Success**:

```typescript
return inertia.render('auth/login', {
  flash: { success: 'Logged out successfully' },
})
```

---

## Testing Requirements

**Functional Tests** (`tests/functional/auth.spec.ts`):

- ✅ User registration creates account and session
- ✅ Duplicate email returns validation error
- ✅ Password too short returns validation error
- ✅ Login with valid credentials succeeds
- ✅ Login with invalid credentials fails
- ✅ Logout destroys session
- ✅ Data isolation: User A cannot see User B's data
- ✅ Protected routes redirect to login when not authenticated
- ✅ Session expires after 30 minutes inactivity

**Browser Tests** (`tests/browser/registration_flow.spec.ts`):

- ✅ Complete registration flow (form submission → redirect to todos)
- ✅ Complete login flow (form submission → redirect to todos)
- ✅ Error messages display correctly in UI

---

## Related Requirements

- **FR-001**: System MUST provide user registration with secure password storage ✅
- **FR-002**: System MUST provide user login with session management ✅
- **FR-003**: System MUST enforce complete data isolation ✅
- **SC-001**: Users can complete registration in under 1 minute ✅
- **SC-002**: Users can log in in under 15 seconds ✅
- **SC-003**: 100% data isolation - zero cross-user access ✅
- **SC-012**: Session maintains for at least 30 minutes activity ✅

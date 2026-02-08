# API Contracts: Bookmarks Management

**Feature**: 002-bookmarks
**Date**: 2026-02-06
**Protocol**: HTTP/REST with Inertia.js
**Authentication**: Session-based (existing AdonisJS auth)

---

## Authentication

All endpoints require authentication via the existing session-based auth middleware.

**Middleware**: `auth`

**Unauthenticated Response**:

```
HTTP 302 Found
Location: /login
```

---

## Endpoints

### 1. List Bookmarks

**Endpoint**: `GET /bookmarks`

**Purpose**: Retrieve all bookmarks for the authenticated user, ordered by creation date (newest first).

**Request**:

```http
GET /bookmarks HTTP/1.1
Host: example.com
Cookie: adonis-session=...
```

**Query Parameters**: None

**Response**: Inertia.js page render

**Success (200 OK)**:

```json
{
  "component": "bookmarks/index",
  "props": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "bookmarks": [
      {
        "id": 42,
        "userId": 1,
        "url": "https://example.com",
        "createdAt": "2026-02-06T14:30:00.000Z",
        "updatedAt": "2026-02-06T14:30:00.000Z"
      },
      {
        "id": 41,
        "userId": 1,
        "url": "google.com",
        "createdAt": "2026-02-05T10:15:00.000Z",
        "updatedAt": "2026-02-05T10:15:00.000Z"
      }
    ]
  }
}
```

**Notes**:

- Returns empty array if user has no bookmarks
- Bookmarks are ordered by `createdAt DESC` (newest first)
- Only returns bookmarks owned by authenticated user

---

### 2. Create Bookmark

**Endpoint**: `POST /bookmarks`

**Purpose**: Create a new bookmark for the authenticated user.

**Request**:

```http
POST /bookmarks HTTP/1.1
Host: example.com
Cookie: adonis-session=...
Content-Type: application/x-www-form-urlencoded

url=https://example.com
```

**Request Body** (Form Data):

```typescript
{
  url: string // Required, 1-2048 characters
}
```

**Success Response (302 Found)**:

```http
HTTP/1.1 302 Found
Location: /bookmarks
Set-Cookie: adonis-session=...
```

**Session Flash**:

```json
{
  "success": "Bookmark créé avec succès!"
}
```

**Validation Error (422 Unprocessable Entity)**:

```json
{
  "errors": {
    "url": "Le champ url est requis"
  }
}
```

**Validation Rules**:

- `url` is required
- `url` must not be empty after trimming
- `url` maximum length: 2048 characters
- `url` minimum length: 1 character (after trimming)

**Possible Validation Errors**:

```json
// Empty URL
{
  "errors": {
    "url": "Le champ url est requis"
  }
}

// Too long (>2048 chars)
{
  "errors": {
    "url": "Le champ url ne peut pas dépasser 2048 caractères"
  }
}
```

---

### 3. Delete Bookmark

**Endpoint**: `DELETE /bookmarks/:id`

**Purpose**: Delete a specific bookmark owned by the authenticated user.

**Request**:

```http
DELETE /bookmarks/42 HTTP/1.1
Host: example.com
Cookie: adonis-session=...
```

**Path Parameters**:

- `id` (integer): Bookmark ID to delete

**Success Response (302 Found)**:

```http
HTTP/1.1 302 Found
Location: /bookmarks
Set-Cookie: adonis-session=...
```

**Session Flash**:

```json
{
  "success": "Bookmark supprimé avec succès!"
}
```

**Not Found (404 Not Found)**:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "message": "Bookmark not found"
}
```

**Unauthorized (404 Not Found)**:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "message": "Bookmark not found"
}
```

**Notes**:

- Returns 404 if bookmark doesn't exist OR doesn't belong to authenticated user
- This prevents information leakage about other users' bookmarks
- Uses `firstOrFail()` with `where('user_id', userId)` for security

---

## Data Types

### Bookmark Object

```typescript
interface Bookmark {
  id: number // Unique identifier
  userId: number // Owner user ID
  url: string // Bookmark content (any text, 1-2048 chars)
  createdAt: string // ISO 8601 timestamp (e.g., "2026-02-06T14:30:00.000Z")
  updatedAt: string // ISO 8601 timestamp
}
```

### User Object (Partial)

```typescript
interface User {
  id: number
  email: string
  fullName: string
  // ... other fields
}
```

---

## Error Responses

### Validation Error (422)

```json
{
  "errors": {
    "fieldName": "Error message in French"
  }
}
```

### Unauthenticated (302)

Redirects to `/login` instead of returning JSON.

### Not Found (404)

```json
{
  "message": "Bookmark not found"
}
```

### Server Error (500)

```json
{
  "message": "Internal server error"
}
```

---

## HTTP Methods Summary

| Method | Endpoint       | Purpose               | Authentication | Idempotent |
| ------ | -------------- | --------------------- | -------------- | ---------- |
| GET    | /bookmarks     | List user's bookmarks | Required       | Yes        |
| POST   | /bookmarks     | Create new bookmark   | Required       | No         |
| DELETE | /bookmarks/:id | Delete bookmark       | Required       | Yes        |

---

## Route Definitions

**File**: `start/routes.ts`

```typescript
import router from '@adonisjs/core/services/router'
import BookmarksController from '#controllers/bookmarks_controller'

// Bookmarks routes (authenticated)
router
  .group(() => {
    router.get('/bookmarks', [BookmarksController, 'index'])
    router.post('/bookmarks', [BookmarksController, 'store'])
    router.delete('/bookmarks/:id', [BookmarksController, 'destroy'])
  })
  .middleware('auth')
```

---

## Security Considerations

### Data Isolation

- All queries filter by authenticated user's ID
- DELETE operation verifies ownership before deletion
- Returns 404 instead of 403 to prevent information disclosure

### Input Validation

- URL field is trimmed before validation
- Length constraints prevent database overflow
- VineJS validator sanitizes input

### CSRF Protection

- All POST/DELETE requests require CSRF token
- Handled automatically by AdonisJS Shield middleware

### Session Security

- Uses existing AdonisJS session-based authentication
- HTTP-only cookies prevent XSS access to session token

---

## Client-Side Integration (Inertia.js)

### Creating a Bookmark

```typescript
import { router } from '@inertiajs/react'

const onFinish = (values: { url: string }) => {
  router.post('/bookmarks', values, {
    preserveScroll: true,
    onSuccess: () => {
      form.resetFields()
    },
  })
}
```

### Deleting a Bookmark

```typescript
const handleDelete = (bookmarkId: number) => {
  Modal.confirm({
    title: 'Supprimer ce bookmark ?',
    content: 'Cette action est irréversible.',
    okText: 'Supprimer',
    okType: 'danger',
    cancelText: 'Annuler',
    onOk() {
      router.delete(`/bookmarks/${bookmarkId}`, {
        preserveScroll: true,
      })
    },
  })
}
```

### Accessing Props

```typescript
import { usePage } from '@inertiajs/react'

interface BookmarksPageProps {
  user: User
  bookmarks: Bookmark[]
  errors?: Record<string, string>
}

const { user, bookmarks, errors } = usePage<BookmarksPageProps>().props
```

---

## Testing Contract

### Functional Test Examples

**File**: `tests/functional/bookmarks.spec.ts`

```typescript
test('GET /bookmarks returns user bookmarks', async ({ client, assert }) => {
  const user = await UserFactory.create()
  await BookmarkFactory.merge({ userId: user.id }).createMany(3)

  const response = await client.get('/bookmarks').loginAs(user)

  response.assertStatus(200)
  assert.lengthOf(response.body().props.bookmarks, 3)
})

test('POST /bookmarks creates bookmark', async ({ client, assert }) => {
  const user = await UserFactory.create()

  const response = await client
    .post('/bookmarks')
    .form({ url: 'https://example.com' })
    .loginAs(user)

  response.assertRedirectsTo('/bookmarks')
  assert.exists(await Bookmark.findBy('url', 'https://example.com'))
})

test('DELETE /bookmarks/:id deletes bookmark', async ({ client, assert }) => {
  const user = await UserFactory.create()
  const bookmark = await BookmarkFactory.merge({ userId: user.id }).create()

  const response = await client.delete(`/bookmarks/${bookmark.id}`).loginAs(user)

  response.assertRedirectsTo('/bookmarks')
  assert.notExists(await Bookmark.find(bookmark.id))
})

test('DELETE /bookmarks/:id fails for other user bookmark', async ({ client, assert }) => {
  const user1 = await UserFactory.create()
  const user2 = await UserFactory.create()
  const bookmark = await BookmarkFactory.merge({ userId: user1.id }).create()

  const response = await client.delete(`/bookmarks/${bookmark.id}`).loginAs(user2)

  response.assertStatus(404)
  assert.exists(await Bookmark.find(bookmark.id))
})
```

---

## Performance Expectations

| Operation             | Target | Measurement          |
| --------------------- | ------ | -------------------- |
| GET /bookmarks        | <500ms | Server response time |
| POST /bookmarks       | <1s    | Create + redirect    |
| DELETE /bookmarks/:id | <500ms | Delete + redirect    |

**Note**: Times exclude network latency and client-side rendering.

---

## References

- Inertia.js documentation: https://inertiajs.com/
- AdonisJS routing: https://docs.adonisjs.com/guides/routing
- VineJS validation: https://vinejs.dev/docs/introduction
- Existing Notes controller: `/Users/clement/Desktop/test-speckit/app/controllers/notes_controller.ts`

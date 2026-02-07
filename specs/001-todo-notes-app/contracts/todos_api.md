# Todos API Contract

**Feature**: Super Todo & Notes Web Application
**User Story**: P2 - Todo Management with Calendar View
**Date**: 2026-02-05

## Overview

Todo CRUD endpoints with calendar integration. Implements FR-004 through FR-014 and enforces strict user data isolation.

---

## Endpoints

### GET /todos

Retrieve todos for the authenticated user, optionally filtered by date range.

**Authentication**: Required

**Query Parameters**:

- `month` (optional): YYYY-MM format - returns todos for entire month
- `date` (optional): YYYY-MM-DD format - returns todos for specific day
- If no parameters: returns all user's todos

**Success Response** (200 OK):

```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "description": "Draft and submit the Q1 proposal",
      "due_date": "2026-02-05",
      "due_time": "14:30",
      "status": "À faire",
      "created_at": "2026-02-01T10:00:00.000Z",
      "updated_at": "2026-02-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Team meeting",
      "description": null,
      "due_date": "2026-02-05",
      "due_time": null,
      "status": "Terminé",
      "created_at": "2026-02-02T08:00:00.000Z",
      "updated_at": "2026-02-04T16:00:00.000Z"
    }
  ]
}
```

**Behavior**:

- Always filters by `user_id = auth.user.id` (data isolation)
- Results ordered by `due_date ASC, due_time ASC`
- Month filter: `WHERE due_date BETWEEN '2026-02-01' AND '2026-02-29'`
- Date filter: `WHERE due_date = '2026-02-05'`

**Inertia Response** (when accessed via browser):

```typescript
inertia.render('todos/index', {
  todos: todos,
  selectedDate: request.input('date', dayjs().format('YYYY-MM-DD')),
})
```

**Error Responses**:

_401 Unauthorized_:

```json
{
  "errors": [{ "message": "Unauthorized" }]
}
```

_422 Unprocessable Entity_ (invalid date format):

```json
{
  "errors": [
    {
      "field": "date",
      "message": "The date field must be a valid date in YYYY-MM-DD format"
    }
  ]
}
```

---

### POST /todos

Create a new todo for the authenticated user.

**Authentication**: Required

**Request**:

```json
{
  "title": "Complete project proposal",
  "description": "Draft and submit the Q1 proposal",
  "due_date": "2026-02-05",
  "due_time": "14:30"
}
```

**Validation**:

- `title`: Required, non-empty, max 255 characters
- `description`: Optional, max 65535 characters
- `due_date`: Required, valid YYYY-MM-DD format
- `due_time`: Optional, valid HH:mm format (00:00 to 23:59)

**Success Response** (201 Created):

```json
{
  "todo": {
    "id": 3,
    "title": "Complete project proposal",
    "description": "Draft and submit the Q1 proposal",
    "due_date": "2026-02-05",
    "due_time": "14:30",
    "status": "À faire",
    "created_at": "2026-02-05T12:00:00.000Z",
    "updated_at": "2026-02-05T12:00:00.000Z"
  }
}
```

**Behavior**:

- `user_id` automatically set from `auth.user.id`
- `status` defaults to 'À faire'
- Inertia response redirects back to todos page with flash message

**Error Responses**:

_422 Unprocessable Entity_ (title missing):

```json
{
  "errors": [
    {
      "field": "title",
      "message": "The title field is required",
      "rule": "required"
    }
  ]
}
```

_422 Unprocessable Entity_ (invalid time format):

```json
{
  "errors": [
    {
      "field": "due_time",
      "message": "The due_time field must be in HH:mm format",
      "rule": "regex"
    }
  ]
}
```

---

### PATCH /todos/:id

Update an existing todo (partial update).

**Authentication**: Required

**URL Parameters**:

- `id`: Todo ID to update

**Request** (all fields optional):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "due_date": "2026-02-06",
  "due_time": "15:00",
  "status": "Terminé"
}
```

**Validation**:

- `title`: Optional, non-empty if provided, max 255 characters
- `description`: Optional, max 65535 characters
- `due_date`: Optional, valid YYYY-MM-DD format if provided
- `due_time`: Optional, valid HH:mm format if provided
- `status`: Optional, must be 'À faire' or 'Terminé' if provided

**Success Response** (200 OK):

```json
{
  "todo": {
    "id": 3,
    "title": "Updated title",
    "description": "Updated description",
    "due_date": "2026-02-06",
    "due_time": "15:00",
    "status": "Terminé",
    "created_at": "2026-02-05T12:00:00.000Z",
    "updated_at": "2026-02-05T13:00:00.000Z"
  }
}
```

**Behavior**:

- Verifies `user_id = auth.user.id` before update (ownership check)
- Only updates provided fields (partial update)
- Inertia response updates page state without reload

**Error Responses**:

_404 Not Found_ (todo not found or not owned by user):

```json
{
  "errors": [
    {
      "message": "Todo not found"
    }
  ]
}
```

_422 Unprocessable Entity_ (invalid status):

```json
{
  "errors": [
    {
      "field": "status",
      "message": "The status field must be one of: À faire, Terminé",
      "rule": "enum"
    }
  ]
}
```

---

### DELETE /todos/:id

Delete a todo.

**Authentication**: Required

**URL Parameters**:

- `id`: Todo ID to delete

**Success Response** (200 OK):

```json
{
  "message": "Todo deleted successfully"
}
```

**Behavior**:

- Verifies `user_id = auth.user.id` before deletion (ownership check)
- Permanent deletion (no soft delete)
- Inertia response removes todo from page state

**Error Responses**:

_404 Not Found_ (todo not found or not owned by user):

```json
{
  "errors": [
    {
      "message": "Todo not found"
    }
  ]
}
```

---

## Data Isolation Enforcement

**ALL endpoints MUST filter by authenticated user**:

```typescript
// ✅ CORRECT: Always verify ownership
const todo = await Todo.query().where('id', params.id).where('user_id', auth.user.id).firstOrFail()

// ❌ WRONG: No ownership check (data leak!)
const todo = await Todo.find(params.id)
```

**Query Pattern**:

- GET /todos: `WHERE user_id = auth.user.id`
- POST /todos: `INSERT ... user_id = auth.user.id`
- PATCH /todos/:id: `UPDATE ... WHERE id = :id AND user_id = auth.user.id`
- DELETE /todos/:id: `DELETE ... WHERE id = :id AND user_id = auth.user.id`

---

## Performance Optimizations

**Database Indexes**:

```sql
CREATE INDEX idx_todos_user_date ON todos(user_id, due_date);
```

**Query Optimization**:

- Load only current month's todos for calendar view
- Use composite index for fast user + date filtering
- Limit results to 100 per day (SC-009 assumption)

**Optimistic UI Updates**:

- Status changes reflected immediately in React state
- Server sync happens in background
- Revert on error

---

## Inertia.js Integration

**Page Component Props**:

```typescript
// inertia/pages/todos/index.tsx
interface TodosPageProps {
  todos: Todo[]
  selectedDate: string // YYYY-MM-DD
  user: User
  flash?: {
    success?: string
    error?: string
  }
}
```

**Partial Reloads**:

```typescript
// Only refresh todos prop (avoid full page reload)
router.reload({ only: ['todos'], preserveScroll: true })
```

---

## Testing Requirements

**Functional Tests** (`tests/functional/todos.spec.ts`):

- ✅ GET /todos returns only authenticated user's todos
- ✅ GET /todos?date=YYYY-MM-DD filters by date
- ✅ GET /todos?month=YYYY-MM filters by month
- ✅ POST /todos creates todo with title required
- ✅ POST /todos validation error on missing title
- ✅ PATCH /todos/:id updates todo status
- ✅ PATCH /todos/:id returns 404 for other user's todo
- ✅ DELETE /todos/:id removes todo
- ✅ DELETE /todos/:id returns 404 for other user's todo
- ✅ Data isolation: User A cannot access User B's todos

**Browser Tests** (`tests/browser/todo_creation_flow.spec.ts`):

- ✅ Click calendar day updates right panel
- ✅ Create todo form submits successfully
- ✅ Todo appears in calendar and list immediately
- ✅ Status change (checkbox) updates without reload
- ✅ Delete button removes todo from UI

---

## Related Requirements

- **FR-004**: Calendar shows todos by day ✅
- **FR-005**: Condensed todo titles in calendar cells ✅
- **FR-007**: Right panel updates on day click ✅
- **FR-008**: Calendar displays in left zone (80% width) ✅
- **FR-009**: Two cards in right zone (20% width) ✅
- **FR-011**: Create todos with title (required), description, time (optional) ✅
- **FR-012**: View todos for selected day ✅
- **FR-013**: Modify todo status ✅
- **FR-014**: Delete todos ✅
- **FR-019**: Associate todos with specific date ✅
- **FR-020**: Persist data across sessions ✅
- **SC-004**: Create todo in under 30 seconds ✅
- **SC-006**: Calendar updates right panel in under 1 second ✅
- **SC-008**: 90% first-attempt success rate for todo creation ✅
- **SC-011**: Status changes reflected immediately without reload ✅

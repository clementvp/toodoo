# Notes API Contract

**Feature**: Super Todo & Notes Web Application
**User Story**: P3 - Notes Management with Calendar View
**Date**: 2026-02-05

## Overview

Notes CRUD endpoints with calendar integration and modal detail view. Implements FR-015 through FR-018 and enforces strict user data isolation.

---

## Endpoints

### GET /notes

Retrieve notes for the authenticated user, optionally filtered by date range.

**Authentication**: Required

**Query Parameters**:

- `month` (optional): YYYY-MM format - returns notes for entire month
- `date` (optional): YYYY-MM-DD format - returns notes for specific day
- If no parameters: returns all user's notes

**Success Response** (200 OK):

```json
{
  "notes": [
    {
      "id": 1,
      "title": "Project Ideas",
      "content": "1. Implement user profiles\n2. Add export feature\n3. Integrate with calendar apps",
      "created_at": "2026-02-05",
      "updated_at": "2026-02-05T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Meeting Notes - Q1 Planning",
      "content": "Discussed quarterly goals, team capacity, and project priorities.",
      "created_at": "2026-02-05",
      "updated_at": "2026-02-05T14:30:00.000Z"
    }
  ]
}
```

**Behavior**:

- Always filters by `user_id = auth.user.id` (data isolation)
- Results ordered by `created_at DESC` (newest first)
- Month filter: `WHERE created_at BETWEEN '2026-02-01' AND '2026-02-29'`
- Date filter: `WHERE created_at = '2026-02-05'`

**Inertia Response** (when accessed via browser):

```typescript
inertia.render('notes/index', {
  notes: notes,
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

### GET /notes/:id

Retrieve full note content for modal display.

**Authentication**: Required

**URL Parameters**:

- `id`: Note ID to retrieve

**Success Response** (200 OK):

```json
{
  "note": {
    "id": 1,
    "title": "Project Ideas",
    "content": "1. Implement user profiles\n2. Add export feature\n3. Integrate with calendar apps",
    "created_at": "2026-02-05",
    "updated_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**Behavior**:

- Verifies `user_id = auth.user.id` (ownership check)
- Returns full note content for modal display
- Used when user clicks note title in list (FR-017)

**Error Responses**:

_404 Not Found_ (note not found or not owned by user):

```json
{
  "errors": [
    {
      "message": "Note not found"
    }
  ]
}
```

---

### POST /notes

Create a new note for the authenticated user.

**Authentication**: Required

**Request**:

```json
{
  "title": "Project Ideas",
  "content": "1. Implement user profiles\n2. Add export feature\n3. Integrate with calendar apps",
  "created_at": "2026-02-05"
}
```

**Validation**:

- `title`: Required, non-empty, max 255 characters
- `content`: Required, non-empty, max 65535 characters
- `created_at`: Required, valid YYYY-MM-DD format

**Success Response** (201 Created):

```json
{
  "note": {
    "id": 3,
    "title": "Project Ideas",
    "content": "1. Implement user profiles\n2. Add export feature\n3. Integrate with calendar apps",
    "created_at": "2026-02-05",
    "updated_at": "2026-02-05T12:00:00.000Z"
  }
}
```

**Behavior**:

- `user_id` automatically set from `auth.user.id`
- Inertia response redirects back to notes page with flash message
- Note appears in calendar and list immediately

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

_422 Unprocessable Entity_ (content missing):

```json
{
  "errors": [
    {
      "field": "content",
      "message": "The content field is required",
      "rule": "required"
    }
  ]
}
```

_422 Unprocessable Entity_ (title too long):

```json
{
  "errors": [
    {
      "field": "title",
      "message": "The title field must not exceed 255 characters",
      "rule": "maxLength"
    }
  ]
}
```

---

### PATCH /notes/:id

Update an existing note (partial update).

**Authentication**: Required

**URL Parameters**:

- `id`: Note ID to update

**Request** (all fields optional):

```json
{
  "title": "Updated Project Ideas",
  "content": "1. User profiles\n2. Export to CSV\n3. Calendar sync\n4. Mobile app"
}
```

**Validation**:

- `title`: Optional, non-empty if provided, max 255 characters
- `content`: Optional, non-empty if provided, max 65535 characters

**Success Response** (200 OK):

```json
{
  "note": {
    "id": 3,
    "title": "Updated Project Ideas",
    "content": "1. User profiles\n2. Export to CSV\n3. Calendar sync\n4. Mobile app",
    "created_at": "2026-02-05",
    "updated_at": "2026-02-05T13:00:00.000Z"
  }
}
```

**Behavior**:

- Verifies `user_id = auth.user.id` before update (ownership check)
- Only updates provided fields (partial update)
- `created_at` remains unchanged (date association)
- Inertia response updates page state without reload

**Error Responses**:

_404 Not Found_ (note not found or not owned by user):

```json
{
  "errors": [
    {
      "message": "Note not found"
    }
  ]
}
```

_422 Unprocessable Entity_ (empty title):

```json
{
  "errors": [
    {
      "field": "title",
      "message": "The title field must not be empty",
      "rule": "minLength"
    }
  ]
}
```

---

### DELETE /notes/:id

Delete a note.

**Authentication**: Required

**URL Parameters**:

- `id`: Note ID to delete

**Success Response** (200 OK):

```json
{
  "message": "Note deleted successfully"
}
```

**Behavior**:

- Verifies `user_id = auth.user.id` before deletion (ownership check)
- Permanent deletion (no soft delete)
- Inertia response removes note from page state

**Error Responses**:

_404 Not Found_ (note not found or not owned by user):

```json
{
  "errors": [
    {
      "message": "Note not found"
    }
  ]
}
```

---

## Data Isolation Enforcement

**ALL endpoints MUST filter by authenticated user**:

```typescript
// ✅ CORRECT: Always verify ownership
const note = await Note.query().where('id', params.id).where('user_id', auth.user.id).firstOrFail()

// ❌ WRONG: No ownership check (data leak!)
const note = await Note.find(params.id)
```

**Query Pattern**:

- GET /notes: `WHERE user_id = auth.user.id`
- GET /notes/:id: `WHERE id = :id AND user_id = auth.user.id`
- POST /notes: `INSERT ... user_id = auth.user.id`
- PATCH /notes/:id: `UPDATE ... WHERE id = :id AND user_id = auth.user.id`
- DELETE /notes/:id: `DELETE ... WHERE id = :id AND user_id = auth.user.id`

---

## Performance Optimizations

**Database Indexes**:

```sql
CREATE INDEX idx_notes_user_date ON notes(user_id, created_at);
```

**Query Optimization**:

- Load only current month's notes for calendar view
- Use composite index for fast user + date filtering
- Limit results to 100 per day (SC-009 assumption)

---

## Modal Implementation

**Behavior**:

- Click note title triggers GET /notes/:id request
- Modal opens with full content (FR-017)
- Modal closes without page reload
- Calendar remains on same selected day (FR-017 acceptance scenario 4)

**React Implementation**:

```typescript
// inertia/pages/notes/index.tsx
const [modalVisible, setModalVisible] = useState(false)
const [selectedNote, setSelectedNote] = useState<Note | null>(null)

const handleNoteClick = async (noteId: number) => {
  const response = await fetch(`/notes/${noteId}`)
  const { note } = await response.json()
  setSelectedNote(note)
  setModalVisible(true)
}

<Modal
  open={modalVisible}
  onCancel={() => setModalVisible(false)}
  title={selectedNote?.title}
>
  <pre>{selectedNote?.content}</pre>
</Modal>
```

---

## Inertia.js Integration

**Page Component Props**:

```typescript
// inertia/pages/notes/index.tsx
interface NotesPageProps {
  notes: Note[]
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
// Only refresh notes prop (avoid full page reload)
router.reload({ only: ['notes'], preserveScroll: true })
```

---

## Testing Requirements

**Functional Tests** (`tests/functional/notes.spec.ts`):

- ✅ GET /notes returns only authenticated user's notes
- ✅ GET /notes?date=YYYY-MM-DD filters by date
- ✅ GET /notes?month=YYYY-MM filters by month
- ✅ GET /notes/:id returns full note content
- ✅ GET /notes/:id returns 404 for other user's note
- ✅ POST /notes creates note with title and content required
- ✅ POST /notes validation error on missing title/content
- ✅ PATCH /notes/:id updates note
- ✅ PATCH /notes/:id returns 404 for other user's note
- ✅ DELETE /notes/:id removes note
- ✅ DELETE /notes/:id returns 404 for other user's note
- ✅ Data isolation: User A cannot access User B's notes

**Browser Tests** (`tests/browser/note_modal_flow.spec.ts`):

- ✅ Click calendar day updates right panel
- ✅ Create note form submits successfully
- ✅ Note appears in calendar and list immediately
- ✅ Click note title opens modal with full content
- ✅ Modal opens in under 1 second (SC-007)
- ✅ Close modal returns to calendar view (same day selected)
- ✅ Delete button removes note from UI

---

## Related Requirements

- **FR-004**: Calendar shows notes by day ✅
- **FR-006**: Condensed note titles in calendar cells ✅
- **FR-007**: Right panel updates on day click ✅
- **FR-008**: Calendar displays in left zone (80% width) ✅
- **FR-009**: Two cards in right zone (20% width) ✅
- **FR-010**: Navigation between Todo and Notes pages ✅
- **FR-015**: Create notes for selected day ✅
- **FR-016**: View note titles in list ✅
- **FR-017**: Click note title opens modal with full content ✅
- **FR-018**: Delete notes ✅
- **FR-019**: Associate notes with specific date ✅
- **FR-020**: Persist data across sessions ✅
- **SC-005**: Create note in under 30 seconds ✅
- **SC-007**: Modal opens in under 1 second ✅
- **SC-011**: UI updates reflected immediately without reload ✅

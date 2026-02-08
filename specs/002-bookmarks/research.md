# Research & Technical Decisions: Bookmarks Management

**Feature**: 002-bookmarks
**Date**: 2026-02-06
**Status**: Complete

## Decision Summary

This document captures technical research and decisions made during Phase 0 planning for the bookmarks feature.

## 1. URL Validation Strategy

### Decision: Minimal Validation - Accept Any Text

**Approach**: No URL format validation. User can enter any text they want as a "bookmark".

**Rationale**:

- User explicitly requested: "Pas besoin de verification d'une url l'utilisateur rentre ce qu'il veut"
- Maximum flexibility for users
- No need for protocol normalization or format checking

**Implementation**:

```typescript
// VineJS validator
url: vine.string().trim().minLength(1).maxLength(2048)
```

**Validation Rules**:

- ✅ Required (non-empty)
- ✅ Max length: 2048 characters (prevent database overflow)
- ❌ NO URL format validation
- ❌ NO protocol requirement
- ❌ NO domain validation

**Edge Cases Handling**:

- Empty input: Rejected (required field)
- Very long text (>2048 chars): Rejected with clear error message
- Any other text: Accepted as-is (URLs, partial URLs, notes, identifiers, etc.)

**Alternatives Considered**:

- Strict URL validation with VineJS `url()` - Rejected: Too restrictive per user request
- Protocol normalization (auto-add https://) - Rejected: Not needed, user enters what they want
- Active URL verification - Rejected: Performance overhead and not required

---

## 2. Database Schema Design

### Decision: Simple Schema with User Isolation

**Table Schema**:

```sql
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);
```

**Rationale**:

- Single index on (user_id, created_at DESC) supports both filtering and ordering
- VARCHAR(2048) provides generous limit while preventing abuse
- CASCADE DELETE ensures cleanup when users are deleted
- Follows existing pattern from Notes and Todos models

**Performance Considerations**:

- Index covers the primary query: "get all user's bookmarks ordered by creation date"
- Up to 1000 bookmarks per user: No pagination needed, single query fetch
- PostgreSQL efficiently handles VARCHAR fields of this size

**Alternatives Considered**:

- TEXT field instead of VARCHAR(2048): Rejected - length constraint prevents abuse
- Separate index on created_at: Rejected - composite index is sufficient
- UUID primary key: Rejected - serial integer follows existing pattern

---

## 3. UI Pattern Consistency

### Decision: Reuse Existing Notes/Todos Pattern

**Form Component Pattern**:

- Location: `inertia/components/cards/bookmark_form_card.tsx`
- Ant Design Form with vertical layout
- Single input field for URL
- Loading state on submit button
- Alert component for server-side validation errors

**List Component Pattern**:

- Location: `inertia/components/cards/bookmark_list_card.tsx`
- Card + List component from Ant Design
- Empty state when no bookmarks: `<Empty description="Aucun bookmark" />`
- Actions: "Ouvrir" (open link) and "Supprimer" (delete)
- Modal.confirm for deletion

**Reusable Components**:

- Form validation error display (Alert component)
- List item structure (List.Item.Meta)
- Deletion confirmation modal
- Card styling and layout

**Theme Consistency**:

- Primary color: `#4F46E5` (indigo)
- Secondary text: `#64748b` (slate grey)
- Background: `#F8FAFC` (light blue-grey)
- Card shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1)`

**Alternatives Considered**:

- Custom bookmark-specific design: Rejected - maintain consistency
- Grid layout instead of list: Rejected - list better for URLs
- Inline editing: Rejected - out of scope per spec

---

## 4. Backend Implementation Pattern

### Decision: Follow AdonisJS MVC Pattern

**Controller**: `app/controllers/bookmarks_controller.ts`

- RESTful actions: index, store, destroy
- User authentication via `auth` middleware
- Data isolation: Always filter by `user_id`
- Flash messages for success feedback

**Model**: `app/models/bookmark.ts`

- Lucid ORM BaseModel
- belongsTo User relationship
- forUser query scope for automatic filtering
- Timestamps: createdAt, updatedAt

**Validator**: `app/validators/bookmark_validator.ts`

- VineJS validation
- Single required field: url (string, 1-2048 chars)

**Routes**:

```typescript
// Add to start/routes.ts
router
  .group(() => {
    router.get('/bookmarks', [BookmarksController, 'index'])
    router.post('/bookmarks', [BookmarksController, 'store'])
    router.delete('/bookmarks/:id', [BookmarksController, 'destroy'])
  })
  .middleware('auth')
```

**Alternatives Considered**:

- Service layer for bookmark logic: Rejected - YAGNI, simple CRUD doesn't need abstraction
- Soft deletes: Rejected - not in requirements
- API-only endpoints: Rejected - using Inertia for consistency

---

## 5. Opening Bookmarks Behavior

### Decision: Client-Side Link Opening

**Approach**: Render bookmarks as clickable links with `target="_blank"`

**Implementation**:

```typescript
// In bookmark list component
<a href={bookmark.url} target="_blank" rel="noopener noreferrer">
  <Button type="text" icon={<LinkOutlined />}>Ouvrir</Button>
</a>
```

**Security**:

- `rel="noopener noreferrer"` prevents window.opener access
- Since we're not validating URLs, user is responsible for link safety

**Alternatives Considered**:

- Server-side redirect tracking: Rejected - adds complexity, no tracking requirement
- Open in same window: Rejected - poor UX, loses current page
- iframe preview: Rejected - security concerns and out of scope

---

## 6. Data Ordering

### Decision: Reverse Chronological (Newest First)

**Approach**: ORDER BY created_at DESC

**Rationale**:

- Most recent bookmarks are most likely to be needed
- Consistent with Notes feature pattern
- Database index (user_id, created_at DESC) optimizes this query

**Implementation**:

```typescript
const bookmarks = await Bookmark.query().where('user_id', user.id).orderBy('created_at', 'desc')
```

**Alternatives Considered**:

- Alphabetical by URL: Rejected - URLs don't have meaningful alphabetical order
- Oldest first: Rejected - less useful for recent bookmarks
- Manual ordering: Rejected - out of scope

---

## Technology Stack Summary

| Component         | Technology | Version          | Rationale                      |
| ----------------- | ---------- | ---------------- | ------------------------------ |
| Backend Framework | AdonisJS   | v6               | Existing project stack         |
| Language          | TypeScript | ~5.8.3           | Type safety, existing stack    |
| ORM               | Lucid      | v21.6.1          | Built-in with AdonisJS         |
| Validation        | VineJS     | v3.0.1           | AdonisJS recommended validator |
| Database          | PostgreSQL | v8.18.0 (driver) | Existing project database      |
| Frontend          | React      | v19.2.4          | Existing UI stack              |
| UI Framework      | Ant Design | v6.2.3           | Existing component library     |
| SSR               | Inertia.js | v2.3.13          | Existing rendering approach    |
| Testing           | Japa       | v4.2.0           | AdonisJS native test runner    |

---

## Migration Strategy

### Database Migration

**File**: `database/migrations/[timestamp]_create_bookmarks_table.ts`

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookmarks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('url', 2048).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['user_id', 'created_at'], 'idx_bookmarks_user_created')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Rollback Strategy**: Drop table and index (standard migration down)

---

## Testing Strategy

### Test Coverage

**Functional Tests** (`tests/functional/bookmarks.spec.ts`):

- Create bookmark with valid input
- Reject empty URL
- Reject URL exceeding 2048 characters
- List bookmarks for authenticated user
- Delete bookmark (own bookmark only)
- Data isolation (cannot access other user's bookmarks)

**Unit Tests** (`tests/unit/bookmark_validator.spec.ts`):

- Validation accepts any non-empty string
- Validation rejects empty string
- Validation rejects strings exceeding 2048 chars
- Trimming whitespace works correctly

**Browser Tests** (optional):

- Complete user journey: add → view → open → delete

---

## Performance Targets

Based on Success Criteria from spec.md:

| Metric        | Target     | Implementation                                    |
| ------------- | ---------- | ------------------------------------------------- |
| Add bookmark  | <5 seconds | Single INSERT with index, minimal validation      |
| View list     | <2 seconds | Single SELECT with index on (user_id, created_at) |
| Open bookmark | 1 click    | Client-side link, no server round-trip            |
| Success rate  | 95%        | Simple validation, clear error messages           |
| List capacity | 1000 items | No pagination, single query fetch                 |

**Monitoring**:

- Use existing AdonisJS logging for database query times
- Track validation error rates via log aggregation

---

## Security Considerations

### Data Isolation

- Always filter by authenticated user's ID
- Verify ownership before delete operations
- Use query scopes for automatic user filtering

### Input Validation

- Required field check (prevents empty bookmarks)
- Length limit (prevents database overflow attacks)
- String trimming (normalize whitespace)

### XSS Prevention

- React automatically escapes rendered text
- Use `rel="noopener noreferrer"` on external links

### Authentication

- All routes protected with `auth` middleware
- Reuse existing session-based authentication

---

## Open Questions (Resolved)

1. ✅ **URL Validation**: Resolved - No validation, accept any text
2. ✅ **Max Length**: Resolved - 2048 characters (database limit)
3. ✅ **Ordering**: Resolved - Newest first
4. ✅ **Opening Links**: Resolved - Client-side with target="\_blank"

---

## References

- Existing Notes implementation: `/Users/clement/Desktop/test-speckit/app/models/note.ts`
- Existing Todos implementation: `/Users/clement/Desktop/test-speckit/app/models/todo.ts`
- VineJS documentation: https://vinejs.dev/docs/introduction
- AdonisJS Lucid ORM: https://lucid.adonisjs.com/docs/introduction
- Ant Design List component: https://ant.design/components/list

---

**Next Phase**: Generate data-model.md, contracts/, and quickstart.md (Phase 1)

# Data Model: Bookmarks Management

**Feature**: 002-bookmarks
**Date**: 2026-02-06
**Status**: Complete

## Overview

The bookmarks feature introduces a single new entity: **Bookmark**. This entity represents a user-saved text entry (typically a URL, but can be any text) with minimal metadata.

---

## Entities

### Bookmark

**Purpose**: Store user-saved text entries (URLs, links, notes, identifiers) for quick access.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| userId | Integer | FOREIGN KEY → users.id, NOT NULL | Owner of the bookmark |
| url | String (2048) | NOT NULL, 1-2048 chars | The bookmark content (any text) |
| createdAt | Timestamp | NOT NULL, AUTO | Creation timestamp |
| updatedAt | Timestamp | NOT NULL, AUTO UPDATE | Last modification timestamp |

**Relationships**:
- **belongsTo User**: Each bookmark belongs to exactly one user

**Validation Rules**:
- `url` field is required (cannot be empty after trimming)
- `url` maximum length: 2048 characters
- `url` minimum length: 1 character (after trimming)
- No format validation on `url` content

**Indexes**:
- Primary: `id` (automatic)
- Composite: `(user_id, created_at DESC)` - optimizes user filtering + ordering

**Query Scopes**:
- `forUser(userId)`: Automatically filter bookmarks by user ID

**Cascade Rules**:
- When a User is deleted → CASCADE DELETE all their bookmarks

---

## Relationships Diagram

```
┌─────────────────┐
│     User        │
│  (existing)     │
│─────────────────│
│ id (PK)         │
│ email           │
│ password        │
│ ...             │
└─────────────────┘
         │
         │ 1
         │
         │
         │ *
         ▼
┌─────────────────┐
│    Bookmark     │
│─────────────────│
│ id (PK)         │
│ userId (FK) ────┼──► User.id
│ url             │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

---

## Database Schema (PostgreSQL)

### Table: `bookmarks`

```sql
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_bookmarks_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_user_created
  ON bookmarks(user_id, created_at DESC);
```

**Index Rationale**:
- `idx_bookmarks_user_created`: Composite index on (user_id, created_at DESC)
  - Supports filtering by user: `WHERE user_id = ?`
  - Supports ordering: `ORDER BY created_at DESC`
  - Single index serves both needs efficiently

---

## Lucid ORM Model (TypeScript)

**File**: `app/models/bookmark.ts`

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Bookmark extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare url: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Query scope for automatic user filtering (data isolation)
  static forUser(query: any, userId: number) {
    query.where('user_id', userId)
  }
}
```

---

## TypeScript Interface (Frontend)

**File**: `inertia/lib/types.ts`

```typescript
export interface Bookmark {
  id: number
  userId: number
  url: string
  createdAt: string  // ISO 8601 format
  updatedAt: string  // ISO 8601 format
}
```

**Serialization**:
- Lucid model's `serialize()` method converts DateTime objects to ISO strings
- Frontend receives plain objects matching this interface

---

## Data Access Patterns

### Common Queries

**1. Get all user's bookmarks (newest first)**
```typescript
const bookmarks = await Bookmark.query()
  .where('user_id', userId)
  .orderBy('created_at', 'desc')
```

**2. Create new bookmark**
```typescript
const bookmark = await Bookmark.create({
  userId: user.id,
  url: validatedUrl,
})
```

**3. Delete bookmark (with ownership verification)**
```typescript
const bookmark = await Bookmark.query()
  .where('id', bookmarkId)
  .where('user_id', userId)
  .firstOrFail()

await bookmark.delete()
```

**4. Using query scope**
```typescript
const bookmarks = await Bookmark.query()
  .apply((scopes) => scopes.forUser(userId))
  .orderBy('created_at', 'desc')
```

---

## State Transitions

Bookmarks have minimal state:

```
         [User creates bookmark]
                  │
                  ▼
            ┌──────────┐
            │ CREATED  │ ◄──── (exists in database)
            └──────────┘
                  │
                  │ [User deletes bookmark]
                  ▼
            ┌──────────┐
            │ DELETED  │ ◄──── (removed from database)
            └──────────┘
```

**Note**: No intermediate states. Bookmarks are either present or absent.

---

## Validation Rules Summary

| Rule | Level | Description |
|------|-------|-------------|
| Required | Application | `url` field cannot be empty |
| Length Check | Application | `url` must be 1-2048 characters |
| Data Type | Database | `url` is VARCHAR(2048) |
| Ownership | Application | Users can only access their own bookmarks |
| Foreign Key | Database | `user_id` must reference existing user |
| Cascade | Database | Deleting user removes all their bookmarks |

**No format validation**: The `url` field accepts any text content.

---

## Performance Characteristics

**Query Performance**:
- Primary queries use composite index (user_id, created_at)
- Expected performance: <100ms for up to 1000 bookmarks per user
- Single query fetch (no N+1 problems)

**Storage Estimates**:
- Average URL length: ~100 characters
- 1000 bookmarks per user: ~100KB per user
- Negligible storage impact

**Scalability Considerations**:
- No pagination needed up to 1000 items per user
- If needed later, implement cursor-based pagination on `created_at`

---

## Migration Script

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

---

## Future Extensibility (Out of Scope)

Potential future enhancements that would require schema changes:

- **Tags/Categories**: Add `category` string field or separate `tags` many-to-many table
- **Titles**: Add optional `title` field
- **Descriptions**: Add optional `description` text field
- **Favorites**: Add `is_favorite` boolean field
- **Visit Count**: Add `visit_count` integer field + `last_visited_at` timestamp
- **Sharing**: Add `is_public` boolean + `share_token` string

**Note**: These are explicitly out of scope per the current specification.

---

## References

- Lucid ORM documentation: https://lucid.adonisjs.com/docs/models
- PostgreSQL VARCHAR documentation: https://www.postgresql.org/docs/current/datatype-character.html
- Existing User model: `/Users/clement/Desktop/test-speckit/app/models/user.ts`
- Existing Note model pattern: `/Users/clement/Desktop/test-speckit/app/models/note.ts`

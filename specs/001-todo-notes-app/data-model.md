# Data Model: Super Todo & Notes Web Application

**Date**: 2026-02-05
**Feature**: Super Todo & Notes Web Application
**Branch**: `001-todo-notes-app`

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Super Todo & Notes application. All entities enforce strict user data isolation per FR-003.

---

## Entities

### 1. User

**Purpose**: Represents an authenticated user account with ownership of todos and notes.

**Fields**:

| Field      | Type         | Constraints                 | Description                                |
| ---------- | ------------ | --------------------------- | ------------------------------------------ |
| id         | Integer      | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier                     |
| email      | String (255) | UNIQUE, NOT NULL, INDEX     | User email address (login identifier)      |
| password   | String (255) | NOT NULL                    | Bcrypt hashed password (minimum 10 rounds) |
| created_at | Timestamp    | NOT NULL, DEFAULT NOW()     | Account creation timestamp                 |
| updated_at | Timestamp    | NOT NULL, DEFAULT NOW()     | Last account update timestamp              |

**Relationships**:

- Has many `Todo` (one-to-many)
- Has many `Note` (one-to-many)

**Validation Rules**:

- Email: Valid email format, unique across all users
- Password: Minimum 8 characters (enforced at application level)

**Indexes**:

- Primary key on `id`
- Unique index on `email`

**Security**:

- Passwords MUST be hashed using bcrypt before storage
- Password field MUST NEVER be exposed in API responses
- Email used for login authentication

**Lucid Model Example**:

```typescript
// app/models/user.ts
import { DateTime } from 'luxon'
import Hash from '@adonisjs/core/services/hash'
import { column, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import { BaseModel } from '@adonisjs/lucid/orm'
import Todo from './todo.js'
import Note from './note.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null }) // Never serialize password
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Todo)
  declare todos: HasMany<typeof Todo>

  @hasMany(() => Note)
  declare notes: HasMany<typeof Note>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
```

---

### 2. Todo

**Purpose**: A task item with title, description, time, status, and date association.

**Fields**:

| Field       | Type         | Constraints                             | Description                         |
| ----------- | ------------ | --------------------------------------- | ----------------------------------- |
| id          | Integer      | PRIMARY KEY, AUTO_INCREMENT             | Unique todo identifier              |
| user_id     | Integer      | FOREIGN KEY (users.id), NOT NULL, INDEX | Owner of this todo (data isolation) |
| title       | String (255) | NOT NULL                                | Todo title (required by FR-011)     |
| description | Text         | NULL                                    | Optional detailed description       |
| due_date    | Date         | NOT NULL, INDEX                         | Date this todo is associated with   |
| due_time    | Time         | NULL                                    | Optional time (HH:mm format)        |
| status      | String (50)  | NOT NULL, DEFAULT 'À faire'             | Todo completion status              |
| created_at  | Timestamp    | NOT NULL, DEFAULT NOW()                 | Creation timestamp                  |
| updated_at  | Timestamp    | NOT NULL, DEFAULT NOW()                 | Last update timestamp               |

**Relationships**:

- Belongs to `User` (many-to-one)

**Validation Rules**:

- title: Required, non-empty, max 255 characters
- description: Optional, max 65535 characters (TEXT limit)
- due_date: Required, valid ISO date format (YYYY-MM-DD)
- due_time: Optional, valid time format (HH:mm), range 00:00 to 23:59
- status: Must be one of: ['À faire', 'Terminé']
- user_id: Must reference existing user

**Indexes**:

- Primary key on `id`
- Foreign key on `user_id`
- Composite index on `(user_id, due_date)` for query performance

**Data Isolation Enforcement**:

- ALL queries MUST filter by `user_id = auth.user.id`
- Update/delete operations MUST verify ownership before execution

**State Transitions**:

```
À faire (To Do) <--> Terminé (Completed)
```

**Lucid Model Example**:

```typescript
// app/models/todo.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from './user.js'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date()
  declare dueDate: DateTime

  @column()
  declare dueTime: string | null // HH:mm format

  @column()
  declare status: 'À faire' | 'Terminé'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Query scope for automatic user filtering (data isolation)
  static scopeForUser(query: ModelQueryBuilder, userId: number) {
    query.where('user_id', userId)
  }
}
```

---

### 3. Note

**Purpose**: A content item with title, full content, and date association.

**Fields**:

| Field      | Type         | Constraints                             | Description                            |
| ---------- | ------------ | --------------------------------------- | -------------------------------------- |
| id         | Integer      | PRIMARY KEY, AUTO_INCREMENT             | Unique note identifier                 |
| user_id    | Integer      | FOREIGN KEY (users.id), NOT NULL, INDEX | Owner of this note (data isolation)    |
| title      | String (255) | NOT NULL                                | Note title (displayed in list)         |
| content    | Text         | NOT NULL                                | Full note content (displayed in modal) |
| created_at | Date         | NOT NULL, INDEX                         | Date this note is associated with      |
| updated_at | Timestamp    | NOT NULL, DEFAULT NOW()                 | Last update timestamp                  |

**Relationships**:

- Belongs to `User` (many-to-one)

**Validation Rules**:

- title: Required, non-empty, max 255 characters
- content: Required, non-empty, max 65535 characters (TEXT limit)
- created_at: Required, valid ISO date format (YYYY-MM-DD)
- user_id: Must reference existing user

**Indexes**:

- Primary key on `id`
- Foreign key on `user_id`
- Composite index on `(user_id, created_at)` for query performance

**Data Isolation Enforcement**:

- ALL queries MUST filter by `user_id = auth.user.id`
- Update/delete operations MUST verify ownership before execution

**Note**: Unlike todos, notes use `created_at` as the date association field (matching spec entity definition: "date representation").

**Lucid Model Example**:

```typescript
// app/models/note.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from './user.js'

export default class Note extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column.date()
  declare createdAt: DateTime // Used as date association

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Query scope for automatic user filtering (data isolation)
  static scopeForUser(query: ModelQueryBuilder, userId: number) {
    query.where('user_id', userId)
  }
}
```

---

## Entity Relationships Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ password        │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────────────┐  ┌─────────────────┐
│      Todo       │  │      Note       │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ user_id (FK)    │  │ user_id (FK)    │
│ title           │  │ title           │
│ description     │  │ content         │
│ due_date        │  │ created_at      │
│ due_time        │  │ updated_at      │
│ status          │  └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘
```

---

## Migrations

**Order of Execution**:

1. `create_users_table` - Base user accounts
2. `create_todos_table` - Todos with user_id foreign key
3. `create_notes_table` - Notes with user_id foreign key

**Foreign Key Constraints**:

- `ON DELETE CASCADE` - When a user is deleted, all their todos and notes are deleted
- `ON UPDATE CASCADE` - If user ID changes (rare), update todos/notes automatically

**Migration Examples**:

```typescript
// database/migrations/1_create_users_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

```typescript
// database/migrations/2_create_todos_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

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
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.date('due_date').notNullable()
      table.time('due_time').nullable()
      table.string('status', 50).notNullable().defaultTo('À faire')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Composite index for query performance
      table.index(['user_id', 'due_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

```typescript
// database/migrations/3_create_notes_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

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
      table.string('title', 255).notNullable()
      table.text('content').notNullable()
      table.date('created_at').notNullable() // Date association
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Composite index for query performance
      table.index(['user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

---

## Data Validation

### Request Validators

**VineJS Validators** (AdonisJS v6 validation library):

```typescript
// app/validators/todo_validator.ts
import vine from '@vinejs/vine'

export const createTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(65535).optional(),
    due_date: vine.date({ formats: ['YYYY-MM-DD'] }),
    due_time: vine
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
  })
)

export const updateTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(65535).optional(),
    due_date: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    due_time: vine
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    status: vine.enum(['À faire', 'Terminé']).optional(),
  })
)
```

```typescript
// app/validators/note_validator.ts
import vine from '@vinejs/vine'

export const createNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    content: vine.string().trim().minLength(1).maxLength(65535),
    created_at: vine.date({ formats: ['YYYY-MM-DD'] }),
  })
)

export const updateNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    content: vine.string().trim().minLength(1).maxLength(65535).optional(),
  })
)
```

---

## Query Patterns

### Data Isolation Query Examples

**Always use query scopes for user filtering**:

```typescript
// CORRECT: Using query scope (recommended)
const todos = await Todo.query().forUser(auth.user.id)

// CORRECT: Manual filtering (fallback)
const todos = await Todo.query().where('user_id', auth.user.id)

// WRONG: No user filtering (data leak!)
const todos = await Todo.all() // ❌ NEVER DO THIS
```

### Performance-Optimized Queries

**Load only current month's data**:

```typescript
// Get todos for current month
const startOfMonth = dayjs().startOf('month').toDate()
const endOfMonth = dayjs().endOf('month').toDate()

const todos = await Todo.query()
  .forUser(auth.user.id)
  .whereBetween('due_date', [startOfMonth, endOfMonth])
  .orderBy('due_date', 'asc')
```

**Verify ownership before update/delete**:

```typescript
// Verify todo belongs to user
const todo = await Todo.query().where('id', todoId).where('user_id', auth.user.id).firstOrFail() // Throws 404 if not found or not owned

await todo.merge(request.only(['title', 'description', 'status'])).save()
```

---

## Summary

**3 Core Entities**: User, Todo, Note
**Foreign Keys**: Todos → Users, Notes → Users (CASCADE delete)
**Data Isolation**: All queries filter by `user_id = auth.user.id`
**Validation**: VineJS validators for all user inputs
**Indexes**: Composite indexes on `(user_id, due_date)` and `(user_id, created_at)`
**State Management**: Simple todo status toggle ('À faire' ↔ 'Terminé')

This data model supports all 20 functional requirements and enforces strict user data isolation per FR-003 and SC-003.

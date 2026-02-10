# Data Model: Drag & Drop Todo Reordering

**Feature**: 004-todo-drag-and-drop

---

## Schema Changes

### Table: `todos` (altered)

| Column   | Type      | Nullable | Default | Description                          |
|----------|-----------|----------|---------|--------------------------------------|
| `order`  | `INTEGER` | YES      | NULL    | Manual sort position (lower = first) |

**Notes**:
- Existing rows get `NULL` — treated as last in sort order (`NULLS LAST`)
- No compaction after deletion (gaps are acceptable — ordering is relative)
- New todos assigned `MAX(order) + 1` at creation time

---

## Updated Sort Order

Queries on `todos` must now use:

```sql
ORDER BY "order" ASC NULLS LAST, due_date ASC
```

This ensures:
1. Todos with a defined order appear first, in that order
2. Todos without an order (legacy data or edge cases) appear last
3. Within the same order value (shouldn't happen, but defensive), sorted by due date

---

## API Contract

### New endpoint

**`PATCH /todos/reorder`**

Request body:
```json
{ "ids": [42, 17, 8, 31] }
```

The server assigns `order = index` for each ID in the array:
- `42` → order 0
- `17` → order 1
- `8`  → order 2
- `31` → order 3

Response: `200 OK` (no body)

**Ownership**: Only todos belonging to the authenticated user are updated. Any ID not owned by the user causes a 403.

---

## Model Changes

### `app/models/todo.ts`

```ts
@column()
declare order: number | null
```

### `inertia/lib/types.ts`

```ts
export interface Todo {
  // ...existing fields...
  order: number | null
}
```

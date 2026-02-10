# Implementation Plan: Drag & Drop Todo Reordering

**Feature**: 004-todo-drag-and-drop
**Date**: 2026-02-10
**Input**: Feature specification from `/specs/004-todo-drag-and-drop/spec.md`

## Summary

Implement manual todo reordering via drag & drop on the `/todos` page. The custom order is persisted in the database via a new `order` column on the `todos` table. The feature uses `@dnd-kit/core` + `@dnd-kit/sortable` on the frontend, and a new `PATCH /todos/reorder` endpoint on the backend.

---

## Phase 0: Research & Discovery (Completed)

**Status**: ✅ Complete

**Key Decisions**:

- **Library**: `@dnd-kit/core` + `@dnd-kit/sortable` — modern, React-native, accessible, no conflicts with Ant Design
- **Order scope**: Global `order` integer per todo (not per day). Simpler, consistent across day views.
- **NULL handling**: Existing todos get `NULL` order → sorted last (`NULLS LAST`). No backfill migration needed.
- **Reorder endpoint**: `PATCH /todos/reorder` accepts `{ ids: number[] }` and bulk-updates `order = index`
- **Optimistic UI**: Local state updated immediately on drop, rolled back on error
- **Dashboard**: Drag & drop également activé sur la `TodosCard` du dashboard (liste des tâches du jour)
- **Calendrier**: Drag & drop NOT enabled sur le `CalendarView` — uniquement les listes

---

## Phase 1: Backend — Data Layer

### 1.1 Migration — Add `order` column to `todos`

**File**: `database/migrations/[timestamp]_add_order_to_todos.ts`

**Actions**:
- `ALTER TABLE todos ADD COLUMN order INTEGER NULL`
- No default, no backfill (existing rows get NULL, sorted last)

**Success Criteria**:
- Migration runs without errors
- Existing todos unaffected (order = NULL)

---

### 1.2 Model — Update `Todo`

**File**: `app/models/todo.ts`

**Actions**:
- Add `@column() declare order: number | null`

**Success Criteria**:
- TypeScript compilation passes
- Model serializes `order` field correctly

---

### 1.3 Validator — `reorderTodosValidator`

**File**: `app/validators/todo_validator.ts`

**Actions**:
- Add `reorderTodosValidator`: `vine.object({ ids: vine.array(vine.number()) })`

**Success Criteria**:
- Accepts array of numeric IDs
- Rejects non-numeric values or missing field

---

### 1.4 Controller — `reorder` method

**File**: `app/controllers/todos_controller.ts`

**Actions**:
- Add `reorder({ auth, request, response }: HttpContext)` method
- Validate payload with `reorderTodosValidator`
- For each `id` in `ids`, verify ownership then set `order = index`
- Use a transaction for atomicity
- Return 200 on success

**Success Criteria**:
- Only updates todos belonging to the authenticated user
- Order values match array index positions
- Rolls back on error (transaction)
- Returns error if any ID doesn't belong to user

---

### 1.5 Route

**File**: `start/routes.ts`

**Actions**:
- Add `router.patch('/todos/reorder', [TodosController, 'reorder'])` (with auth middleware)
- Must be declared **before** `router.patch('/todos/:id', ...)` to avoid `:id` capturing `reorder`

**Success Criteria**:
- `PATCH /todos/reorder` routes correctly
- `PATCH /todos/:id` still works for status/priority updates

---

### 1.6 Update existing queries

**File**: `app/controllers/todos_controller.ts`, `app/controllers/dashboard_controller.ts`

**Actions**:
- Update `Todo.query()` in `index` to `.orderBy('order', 'asc').orderByRaw('order NULLS LAST').orderBy('due_date', 'asc')`
- Update `create` to assign `order = MAX(order) + 1` for the user before insert

**Success Criteria**:
- Todos returned in custom order on `/todos`
- New todos appear at the bottom of the list

---

## Phase 2: Frontend — Sortable List

### 2.1 Install dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Success Criteria**: Package installed, no peer dependency conflicts

---

### 2.2 New component — `SortableTodoItem`

**File**: `inertia/components/cards/sortable_todo_item.tsx`

**Actions**:
- Wraps the existing `List.Item` content from `TodoListCard`
- Uses `useSortable({ id: todo.id })` from `@dnd-kit/sortable`
- Applies `transform` and `transition` CSS from `useSortable`
- Sets `cursor: grab` on the drag handle (or the full row)
- Reduces opacity to 0.5 on the item being dragged (`isDragging`)

**Success Criteria**:
- Item can be grabbed and dragged
- Visual feedback during drag (opacity, cursor)
- No interaction conflicts with existing Checkbox and Button actions

---

### 2.3 Shared hook — `useSortableTodos`

**File**: `inertia/lib/use_sortable_todos.ts`

**Actions**:
- Encapsule la logique commune : état local trié, snapshot pré-drag, `onDragEnd` avec appel `PATCH /todos/reorder`, rollback sur erreur
- Expose : `{ sortedTodos, onDragStart, onDragEnd, activeId }`
- Réutilisé par `TodoListCard` ET `TodosCard`

**Success Criteria**:
- Logique non dupliquée entre les deux composants
- Rollback fonctionne dans les deux contextes

---

### 2.4 Update `TodoListCard`

**File**: `inertia/components/cards/todo_list_card.tsx`

**Actions**:
- Replace `List` with `DndContext` + `SortableContext` wrapping a `div` de `SortableTodoItem`
- Use `verticalListSortingStrategy`
- Utilise `useSortableTodos` pour la logique de tri et persistance
- Add `DragOverlay` for smooth drag ghost rendering

**Success Criteria**:
- List reorders visually on drop
- Network request sent only when position actually changed
- Rollback works on error
- Existing checkbox toggle, delete, and print actions still work

---

### 2.5 Update `TodosCard` (dashboard)

**File**: `inertia/components/cards/todos_card.tsx`

**Actions**:
- Même intégration que `TodoListCard` : `DndContext` + `SortableContext` + `SortableTodoItem`
- Utilise `useSortableTodos` (même hook partagé)
- Synchroniser avec `localTodos` existant

**Success Criteria**:
- Drag & drop fonctionne sur la card du dashboard
- Ordre persisté de la même façon que sur la page todos
- Partial reload `only: ['todosToday']` non déclenché par le drag (uniquement sur drop)

---

### 2.4 Update `types.ts`

**File**: `inertia/lib/types.ts`

**Actions**:
- Add `order: number | null` to `Todo` interface

**Success Criteria**:
- TypeScript compilation passes across all files using `Todo`

---

## Phase 3: Testing & Quality

### 3.1 Manual test checklist

- [ ] Drag todo from position 1 to position 3 on `/todos` → list reorders immediately
- [ ] Drag todo on dashboard card → list reorders immediately
- [ ] Reload page → order preserved in both views
- [ ] Create new todo → appears at bottom in both views
- [ ] Delete a todo → remaining todos keep their relative order
- [ ] Simulate network error → list rolls back in both views
- [ ] Calendar view → no drag handles visible, no drag behavior
- [ ] Keyboard accessibility → tab to item, space to lift, arrow keys to move

---

## Dependencies & Blockers

### External
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (npm)

### Internal
- Existing `Todo` model and `todos_controller.ts`
- Existing `TodoListCard` component et `TodosCard` component
- `start/routes.ts` route ordering (reorder before :id)

### Blockers
- None. All internal dependencies exist.

---

## Risks & Mitigation

### Risk 1: Route conflict `/todos/reorder` vs `/todos/:id`
**Impact**: `reorder` captured as `:id` → wrong controller method called
**Mitigation**: Declare `/todos/reorder` route before `/todos/:id` in `routes.ts`

### Risk 2: Simultaneous reorder from two devices
**Impact**: Last write wins → one user's reorder is lost
**Likelihood**: Very low (single-user app)
**Mitigation**: Acceptable for now. Future: optimistic locking.

### Risk 3: Performance on large lists
**Impact**: Drag lag on 50+ items
**Likelihood**: Low (typical daily todo list is < 20 items)
**Mitigation**: `@dnd-kit` uses CSS transforms (no reflow) — performant by design

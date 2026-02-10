# Feature Specification: Drag & Drop Todo Reordering

**Feature Branch**: `004-todo-drag-and-drop`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Drag and drop dans la liste des tâches pour les réordonner à la main. Sur la page /todos ET sur la card du dashboard. Uniquement dans les listes (pas dans le calendrier). L'ordre est persisté en base de données."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Reorder Todos by Drag & Drop (Priority: P1)

A user wants to manually reorder their tasks for a selected day by dragging them to a new position in the list.

**Why this priority**: Core feature of this spec. Without drag & drop, the feature doesn't exist.

**Independent Test**: Can be fully tested by opening the todos page OR the dashboard, dragging a todo to a new position in the list, and verifying the new order persists after page reload.

**Acceptance Scenarios**:

1. **Given** a day has multiple todos, **When** the user drags a todo to a new position, **Then** the list reorders immediately (optimistic UI)
2. **Given** the user has reordered todos, **When** they reload the page, **Then** the custom order is preserved
3. **Given** the user is dragging a todo, **When** they drag over other items, **Then** visual feedback indicates the drop target position
4. **Given** the user drops a todo in the same position, **When** the drop completes, **Then** no network request is made and state is unchanged

---

### User Story 2 - Order Persists Across Sessions (Priority: P1)

A user expects the order they defined to be remembered the next time they open the app.

**Why this priority**: Without persistence, the reorder feature has no lasting value.

**Independent Test**: Reorder todos, close the browser, reopen the app — verify order is preserved.

**Acceptance Scenarios**:

1. **Given** a user reorders their todos, **When** they log out and log back in, **Then** the custom order is maintained
2. **Given** two users have the same todos visible, **When** one reorders, **Then** only that user's order is affected
3. **Given** a user reorders todos across multiple days, **When** they switch between days, **Then** each day's order is independent

---

### User Story 3 - New Todos Appended at Bottom (Priority: P2)

When a user creates a new todo, it appears at the bottom of the list for its day, after all previously ordered items.

**Why this priority**: Necessary to keep the ordering consistent when new items are added.

**Independent Test**: Create a new todo for a day that already has ordered items — verify it appears last.

**Acceptance Scenarios**:

1. **Given** a day has 3 ordered todos, **When** the user adds a new todo, **Then** it appears at position 4 (last)
2. **Given** a day has no todos, **When** the user creates the first todo, **Then** it appears at position 1
3. **Given** a user creates todos in quick succession, **When** viewing the list, **Then** they are ordered by creation sequence

---

### Edge Cases

- What happens when the user reorders and loses network connection?
- What happens when a todo is deleted — do remaining todos' order values get compacted?
- What happens with todos that have a `NULL` order value (existing data before migration)?
- What if two devices reorder simultaneously?
- What if a day has only one todo — can the user still interact with it?
- What if a day has 50+ todos — does drag & drop remain performant?

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to reorder todos via drag & drop on the `/todos` page list AND on the dashboard list card
- **FR-002**: System MUST persist the custom order in the database per user
- **FR-003**: System MUST show visual drag feedback (ghost element, drop indicator) during drag
- **FR-004**: System MUST apply the new order optimistically (before server confirmation)
- **FR-005**: System MUST rollback to previous order if the server request fails
- **FR-006**: System MUST assign new todos the highest order value (appended at bottom)
- **FR-007**: System MUST NOT enable drag & drop on the calendar view
- **FR-008**: System MUST preserve per-user order isolation (user A's order does not affect user B)
- **FR-009**: System MUST handle existing todos without an order value (NULL → sorted last)

### Non-Functional Requirements

- **NFR-001**: Drag interaction must feel responsive (< 16ms frame time)
- **NFR-002**: Reorder network request must be debounced or sent only on drop (not on every drag move)
- **NFR-003**: The feature must be keyboard-accessible
- **NFR-004**: La librairie utilisée DOIT être **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`** — choix justifié par sa compatibilité native React, l'absence de conflit avec Ant Design, son accessibilité intégrée, et son maintien actif. Les alternatives (`react-beautiful-dnd` abandonné, `react-dnd` vieillissant) sont explicitement exclues.

### Key Entities _(include if feature involves data)_

- **Todo**: Gains an `order` column (integer, nullable). Queries sorted by `order ASC NULLS LAST`, then `due_date ASC`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: User can drag and drop a todo to a new position with visible feedback
- **SC-002**: New order persists after page reload
- **SC-003**: New todos are always appended at the end of the list
- **SC-004**: Order rollback occurs correctly when the server returns an error
- **SC-005**: No visual glitches during drag on lists of up to 50 items

---

## Assumptions

- Drag & drop is enabled on both the `/todos` list and the dashboard `TodosCard` list
- Order is a global integer per todo (not scoped per day) — simpler to implement and consistent across both views
- Todos with `NULL` order (existing data) are treated as last in sort order (`NULLS LAST`)
- No compaction of order values after deletion (gaps are acceptable)
- Single-column vertical list only (no grid or kanban reordering)
- No cross-day drag & drop (reordering within the currently selected day's list only)

---

## Out of Scope

- Drag & drop on the calendar view
- Cross-day reordering
- Automatic reordering by priority, status, or due time
- Reordering notes or bookmarks
- Drag & drop on mobile (touch events are supported by dnd-kit but not a hard requirement)
- Undo/redo of reorder actions
- Bulk reordering

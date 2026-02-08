# Tasks: Bookmarks Management

**Input**: Design documents from `/specs/002-bookmarks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only included if explicitly requested in feature specification. This feature does NOT explicitly request tests, so test tasks are omitted per constitution (tests optional by default).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is an AdonisJS web application with:

- Backend: `app/`, `database/`, `start/`
- Frontend: `inertia/`
- Tests: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for bookmarks feature

- [x] T001 Create database migration file at `database/migrations/[timestamp]_create_bookmarks_table.ts`
- [x] T002 [P] Create Bookmark type definition in `inertia/lib/types.ts`
- [x] T003 [P] Add bookmarks route group to `start/routes.ts` with auth middleware

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Bookmark Lucid model at `app/models/bookmark.ts` with userId, url, timestamps, belongsTo User relationship, and forUser query scope
- [x] T005 Create bookmark validator at `app/validators/bookmark_validator.ts` with createBookmarkValidator (url: required, trimmed, 1-2048 chars, NO format validation)
- [x] T006 Create BookmarksController skeleton at `app/controllers/bookmarks_controller.ts` with empty index, store, destroy methods
- [x] T007 Run database migration to create bookmarks table with composite index on (user_id, created_at DESC)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Bookmark (Priority: P1) 🎯 MVP

**Goal**: Allow users to save a URL/text by entering it in a form, with immediate storage and confirmation

**Independent Test**: Submit a URL through the interface and verify it gets stored in the database and appears in the list

### Implementation for User Story 1

- [x] T008 [US1] Implement BookmarksController.store() method in `app/controllers/bookmarks_controller.ts` - validate input, create bookmark, flash success, redirect to /bookmarks
- [x] T009 [US1] Implement BookmarksController.index() method in `app/controllers/bookmarks_controller.ts` - query user's bookmarks ordered by created_at DESC, render inertia page
- [x] T010 [P] [US1] Create BookmarkFormCard component at `inertia/components/cards/bookmark_form_card.tsx` - Form with url input, submit button, loading state, error display
- [x] T011 [P] [US1] Create BookmarkListCard component at `inertia/components/cards/bookmark_list_card.tsx` - Card with List, Empty state, display url as text
- [x] T012 [US1] Create bookmarks index page at `inertia/pages/bookmarks/index.tsx` - Layout with Header, BookmarkFormCard, BookmarkListCard, handle usePage props
- [x] T013 [US1] Add POST /bookmarks route handler in `start/routes.ts` pointing to BookmarksController.store with auth middleware
- [x] T014 [US1] Add GET /bookmarks route handler in `start/routes.ts` pointing to BookmarksController.index with auth middleware

**Checkpoint**: At this point, User Story 1 should be fully functional - users can add bookmarks and see them immediately in the list

---

## Phase 4: User Story 2 - View Bookmark List (Priority: P2)

**Goal**: Display all saved bookmarks in one place, ordered by newest first, with empty state when no bookmarks exist

**Independent Test**: Pre-populate bookmarks in the database and verify they display correctly in the list view with proper ordering

### Implementation for User Story 2

- [x] T015 [US2] Update BookmarkListCard component in `inertia/components/cards/bookmark_list_card.tsx` - Add proper empty state message "Aucun bookmark", ensure reverse chronological ordering display
- [x] T016 [US2] Add date/time display formatting in BookmarkListCard to show creation timestamp for each bookmark
- [x] T017 [US2] Verify BookmarksController.index() properly serializes bookmarks with all fields (id, userId, url, createdAt, updatedAt)
- [x] T018 [US2] Test empty state by accessing /bookmarks with no bookmarks in database

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can add bookmarks and view them with proper ordering

---

## Phase 5: User Story 3 - Open Saved Bookmark (Priority: P3)

**Goal**: Allow users to click on a bookmark to open the URL in a new browser tab

**Independent Test**: Click on a bookmark entry and verify it opens the correct URL in a new tab

### Implementation for User Story 3

- [x] T019 [US3] Update BookmarkListCard component in `inertia/components/cards/bookmark_list_card.tsx` - Add "Ouvrir" button with LinkOutlined icon in List.Item actions
- [x] T020 [US3] Implement bookmark link opening in BookmarkListCard - Use anchor tag with href={bookmark.url}, target="\_blank", rel="noopener noreferrer"
- [x] T021 [US3] Test bookmark opening behavior - Click opens new tab, page loads, user can return to /bookmarks without losing place

**Checkpoint**: All user stories should now be independently functional - full bookmark workflow (add, view, open) is complete

---

## Phase 6: User Story 4 - Delete Bookmark (Priority: P4)

**Goal**: Allow users to delete a saved bookmark with confirmation

**Independent Test**: Click delete button, confirm modal, verify bookmark is removed from list and database

### Implementation for User Story 4

- [x] T022 [US4] Implement BookmarksController.destroy() method in `app/controllers/bookmarks_controller.ts` - Query bookmark by id and user_id, delete, flash success, redirect
- [x] T023 [US4] Add DELETE /bookmarks/:id route handler in `start/routes.ts` pointing to BookmarksController.destroy with auth middleware
- [x] T024 [US4] Update BookmarkListCard component in `inertia/components/cards/bookmark_list_card.tsx` - Add "Supprimer" button with DeleteOutlined icon in List.Item actions
- [x] T025 [US4] Add deletion confirmation modal in BookmarkListCard - Modal.confirm with title, content showing bookmark url, danger okType, router.delete on confirm
- [x] T026 [US4] Test deletion flow - Click delete, modal appears, confirm deletes bookmark, cancel preserves bookmark

**Checkpoint**: Complete bookmark management - users can add, view, open, and delete bookmarks

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T027 [P] Add navigation link to bookmarks in Header component at `inertia/components/layout/header.tsx` - Menu.Item with BookOutlined icon and /bookmarks link
- [x] T028 [P] Verify validation error messages are in French and user-friendly in `app/validators/bookmark_validator.ts`
- [x] T029 [P] Add console logging for bookmark creation, deletion in BookmarksController for observability
- [x] T030 [P] Verify CSRF protection is enabled for POST and DELETE routes (should be automatic via AdonisJS Shield middleware)
- [x] T031 Test complete user journey: login → navigate to bookmarks → add bookmark → view list → open bookmark → delete bookmark
- [x] T032 Verify performance targets: add <5s, view list <2s, support 1000 bookmarks without pagination
- [x] T033 [P] Update CLAUDE.md if needed with any bookmark-specific patterns or conventions (likely not needed as follows existing patterns)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1 - Add): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2 - View): Can start after Foundational - Enhances US1 but independently testable
  - User Story 3 (P3 - Open): Can start after Foundational - Requires US2 for UI but independently testable
  - User Story 4 (P4 - Delete): Can start after Foundational - Requires US2 for UI but independently testable
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Add)**: No dependencies on other stories - Can start immediately after Foundational
- **User Story 2 (P2 - View)**: Technically independent, but builds on US1's list component - Should be done after US1 for practical reasons
- **User Story 3 (P3 - Open)**: Independent of US1, works with US2's list display - Should be done after US2
- **User Story 4 (P4 - Delete)**: Independent of US1/US3, works with US2's list display - Should be done after US2

### Within Each User Story

**User Story 1 sequence**:

1. T008 (Controller.store) + T009 (Controller.index) can be done together
2. T010 (FormCard) + T011 (ListCard) can be done in parallel [P]
3. T012 (Index page) depends on T010, T011
4. T013 (POST route) + T014 (GET route) can be done in parallel

**User Story 2 sequence**:

1. All US2 tasks can be done in any order as they're enhancements/verifications

**User Story 3 sequence**:

1. All US3 tasks can be done in any order as they're UI enhancements

**User Story 4 sequence**:

1. T022 (Controller.destroy) and T023 (DELETE route) should be done first
2. T024 (Delete button) + T025 (Modal) + T026 (Testing) can follow

### Parallel Opportunities

**Setup Phase (Phase 1)**:

- T002 [P] (Type definition) and T003 [P] (Routes) can run in parallel with T001 (Migration)

**User Story 1 (Phase 3)**:

- T010 [P] (FormCard) and T011 [P] (ListCard) can run in parallel - different files, no dependencies

**Polish Phase (Phase 7)**:

- T027 [P], T028 [P], T029 [P], T030 [P], T033 [P] can all run in parallel - different files

**Cross-Story Parallelism**:

- With multiple developers, after Foundational phase:
  - Developer A: User Story 1 (T008-T014)
  - Developer B: Can start on Foundational enhancements or wait
  - Once US1 complete, stories 2, 3, 4 can proceed in parallel if desired

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these in parallel:

# Frontend components (different files, no dependencies):
Task: T010 - "Create BookmarkFormCard component at inertia/components/cards/bookmark_form_card.tsx"
Task: T011 - "Create BookmarkListCard component at inertia/components/cards/bookmark_list_card.tsx"

# Then sequentially:
Task: T012 - "Create bookmarks index page" (depends on T010, T011)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T008-T014)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Add a bookmark via form
   - Verify it appears in the list immediately
   - Verify validation errors for empty input
   - Verify validation errors for >2048 char input
5. Deploy/demo if ready ✅ MVP complete!

### Incremental Delivery

1. Complete Setup + Foundational (T001-T007) → Foundation ready
2. Add User Story 1 (T008-T014) → Test independently → **Deploy/Demo (MVP!)** 🎯
3. Add User Story 2 (T015-T018) → Test independently → Deploy/Demo (Enhanced view)
4. Add User Story 3 (T019-T021) → Test independently → Deploy/Demo (Full interaction)
5. Add User Story 4 (T022-T026) → Test independently → Deploy/Demo (Complete CRUD)
6. Polish (T027-T033) → Final deployment
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Phase 1-2**: Team completes Setup + Foundational together (T001-T007)
2. **Phase 3**: Developer A implements User Story 1 (T008-T014)
   - Within US1, T010 + T011 can be split between 2 devs
3. **Phase 4-6**: Once US1 is complete and validated:
   - Developer A: User Story 2 (T015-T018)
   - Developer B: User Story 3 (T019-T021)
   - Developer C: User Story 4 (T022-T026)
4. **Phase 7**: Team does Polish together (T027-T033)
5. Stories complete and integrate independently

---

## Task Statistics

- **Total Tasks**: 33
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 4 tasks (BLOCKING)
- **User Story 1 (P1 - MVP)**: 7 tasks
- **User Story 2 (P2)**: 4 tasks
- **User Story 3 (P3)**: 3 tasks
- **User Story 4 (P4)**: 5 tasks
- **Polish Phase**: 7 tasks

**Parallel Tasks**: 9 tasks marked [P] can run in parallel within their phases
**MVP Scope**: Phases 1-3 only (14 tasks) delivers working add + view bookmarks

---

## Notes

- [P] tasks = different files, no dependencies within their phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- NO tests included per constitution (tests optional by default, not explicitly requested in spec)
- Follow existing Notes/Todos patterns for consistency
- Validation is minimal: required + length check, NO URL format validation per user request
- All routes protected by existing auth middleware
- Uses existing session-based authentication
- Inertia.js handles page updates automatically (no manual refresh needed)

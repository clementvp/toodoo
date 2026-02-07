# Tasks: Super Todo & Notes Web Application

**Input**: Design documents from `/specs/001-todo-notes-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **AdonisJS v6 Fullstack**: `app/` (backend), `inertia/` (frontend), `database/` (migrations)
- Backend: `app/controllers/`, `app/models/`, `app/middleware/`, `app/validators/`
- Frontend: `inertia/pages/`, `inertia/components/`, `inertia/lib/`
- Tests: `tests/unit/`, `tests/functional/`, `tests/browser/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize AdonisJS v6 project with Inertia.js/React starter kit in project root
- [x] T002 [P] Install backend dependencies (Lucid ORM, PostgreSQL driver) via npm
- [x] T003 [P] Install frontend dependencies (Ant Design v6.2.2, Day.js) via npm
- [x] T004 [P] Install testing dependencies (Japa, Playwright, Vitest, React Testing Library) via npm
- [x] T005 Configure Lucid ORM for PostgreSQL connection in config/database.ts
- [x] T006 Create docker-compose.yml for PostgreSQL 15 Alpine with health check in project root
- [x] T007 Configure environment variables in .env (database, session, app key)
- [x] T008 [P] Configure TypeScript for strict mode in tsconfig.json
- [x] T009 [P] Configure ESLint and Prettier for code quality
- [x] T010 Start PostgreSQL container and verify connection with docker-compose up -d

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create users table migration in database/migrations/xxx_create_users_table.ts
- [x] T012 Create todos table migration with foreign key in database/migrations/xxx_create_todos_table.ts
- [x] T013 Create notes table migration with foreign key in database/migrations/xxx_create_notes_table.ts
- [x] T014 Run migrations to create database schema with node ace migration:run
- [x] T015 [P] Create User model with bcrypt password hashing in app/models/user.ts
- [x] T016 [P] Create Todo model with user query scope in app/models/todo.ts
- [x] T017 [P] Create Note model with user query scope in app/models/note.ts
- [x] T018 Configure AdonisJS session-based authentication in config/auth.ts
- [x] T019 Create auth middleware for route protection in app/middleware/auth.ts
- [x] T020 [P] Configure Ant Design theme (Modern Productivity colors) in inertia/app.tsx
- [x] T021 [P] Create global Header component with navigation in inertia/components/layout/header.tsx
- [x] T022 [P] Create 80/20 CalendarLayout component with flexbox in inertia/components/layout/calendar_layout.tsx
- [x] T023 [P] Create Day.js utility helpers for date formatting in inertia/lib/date_utils.ts
- [x] T024 [P] Create TypeScript interfaces for User, Todo, Note in inertia/lib/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Secure user accounts with complete data isolation

**Independent Test**: Register account → Login → Create todo → Logout → Login as different user → Verify first user's todos not visible

### Implementation for User Story 1

- [x] T025 [P] [US1] Create registration validator in app/validators/register_validator.ts
- [x] T026 [P] [US1] Create login validator in app/validators/login_validator.ts
- [x] T027 [US1] Create AuthController with register method in app/controllers/auth_controller.ts
- [x] T028 [US1] Implement login method in app/controllers/auth_controller.ts
- [x] T029 [US1] Implement logout method in app/controllers/auth_controller.ts
- [x] T030 [P] [US1] Create registration page component in inertia/pages/auth/register.tsx
- [x] T031 [P] [US1] Create login page component in inertia/pages/auth/login.tsx
- [x] T032 [US1] Configure authentication routes (POST /register, /login, /logout) in start/routes.ts
- [x] T033 [US1] Implement session creation on successful registration
- [x] T034 [US1] Implement session creation on successful login
- [x] T035 [US1] Implement session destruction on logout
- [x] T036 [US1] Add form validation error display on registration page
- [x] T037 [US1] Add form validation error display on login page
- [x] T038 [US1] Configure Inertia redirect to /todos after successful authentication
- [x] T039 [US1] Add data isolation verification - User A cannot see User B's data

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Todo Management with Calendar View (Priority: P2)

**Goal**: Create, view, update status, and delete todos organized by date in calendar interface

**Independent Test**: After authentication, create todos for different dates → Click calendar days → Verify todos appear in right panel → Modify status → Delete items

### Implementation for User Story 2

- [x] T040 [P] [US2] Create todo validators (create, update) in app/validators/todo_validator.ts
- [x] T041 [US2] Create TodosController with index method (GET /todos) in app/controllers/todos_controller.ts
- [x] T042 [US2] Implement create method (POST /todos) in app/controllers/todos_controller.ts
- [x] T043 [US2] Implement update method (PATCH /todos/:id) in app/controllers/todos_controller.ts
- [x] T044 [US2] Implement delete method (DELETE /todos/:id) in app/controllers/todos_controller.ts
- [x] T045 [US2] Add ownership verification before update/delete operations in TodosController
- [x] T046 [US2] Configure todos routes with auth middleware in start/routes.ts
- [x] T047 [P] [US2] Create CalendarView component with Ant Design Calendar in inertia/components/calendar/calendar_view.tsx
- [x] T048 [P] [US2] Create TodoListCard component (top card) in inertia/components/cards/todo_list_card.tsx
- [x] T049 [P] [US2] Create TodoFormCard component (bottom card) in inertia/components/cards/todo_form_card.tsx
- [x] T050 [US2] Create Todos page with calendar + side panel layout in inertia/pages/todos/index.tsx
- [x] T051 [US2] Implement calendar day click handler to update right panel state
- [x] T052 [US2] Implement todo status toggle (À faire ↔ Terminé) with optimistic UI update
- [x] T053 [US2] Implement todo delete with immediate UI removal
- [x] T054 [US2] Implement todo creation form submission with Inertia router
- [x] T055 [US2] Add title required validation error display in form
- [x] T056 [US2] Implement calendar cell rendering with condensed todo titles (badges)
- [x] T057 [US2] Add month navigation handlers in calendar component
- [x] T058 [US2] Filter todos by selected day for display in top card
- [x] T059 [US2] Add navigation link from Header to Todos page

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Notes Management with Calendar View (Priority: P3)

**Goal**: Create, view, and delete notes with modal detail view organized by date

**Independent Test**: With authentication and calendar working, navigate to Notes → Create notes for different dates → Click calendar days → Click note title to open modal → Delete notes

### Implementation for User Story 3

- [x] T060 [P] [US3] Create note validators (create, update) in app/validators/note_validator.ts
- [x] T061 [US3] Create NotesController with index method (GET /notes) in app/controllers/notes_controller.ts
- [x] T062 [US3] Implement show method (GET /notes/:id) for modal content in app/controllers/notes_controller.ts
- [x] T063 [US3] Implement create method (POST /notes) in app/controllers/notes_controller.ts
- [x] T064 [US3] Implement delete method (DELETE /notes/:id) in app/controllers/notes_controller.ts
- [x] T065 [US3] Add ownership verification before show/delete operations in NotesController
- [x] T066 [US3] Configure notes routes with auth middleware in start/routes.ts
- [x] T067 [P] [US3] Create NoteListCard component (top card) in inertia/components/cards/note_list_card.tsx
- [x] T068 [P] [US3] Create NoteFormCard component (bottom card) in inertia/components/cards/note_form_card.tsx
- [x] T069 [US3] Create Notes page with calendar + side panel layout in inertia/pages/notes/index.tsx
- [x] T070 [US3] Implement calendar day click handler to update right panel state
- [x] T071 [US3] Implement note title click handler to fetch and display modal
- [x] T072 [US3] Create Ant Design Modal for note detail view in Notes page
- [x] T073 [US3] Implement note delete with immediate UI removal
- [x] T074 [US3] Implement note creation form submission with Inertia router
- [x] T075 [US3] Add title and content required validation error display in form
- [x] T076 [US3] Implement calendar cell rendering with condensed note titles (badges)
- [x] T077 [US3] Filter notes by selected day for display in top card
- [x] T078 [US3] Add navigation link from Header to Notes page
- [x] T079 [US3] Ensure modal close returns to calendar view with same day selected

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T080 [P] Apply "Modern Productivity" color palette to all components (primary: #4F46E5, background: #F8FAFC)
- [x] T081 [P] Add accent colors for todos (emerald #10B981) and notes (amber #F59E0B) in calendar badges
- [x] T082 [P] Implement responsive design breakpoints (mobile: vertical stack) in CalendarLayout
- [x] T083 [P] Add overflow-x: hidden to body to prevent horizontal scroll in public/assets/app.css
- [x] T084 [P] Add structured logging for all state-changing operations (create, update, delete)
- [x] T085 [P] Add performance timing instrumentation for calendar updates (<1s goal)
- [x] T086 [P] Add error boundary component for React error handling in inertia/components/error_boundary.tsx
- [x] T087 [P] Implement session timeout handling (redirect to login after 30min inactivity)
- [x] T088 [P] Add loading states for asynchronous operations (spinners, skeleton screens)
- [x] T089 [P] Optimize database queries with composite indexes verification
- [x] T090 [P] Add CSRF protection verification for all forms
- [x] T091 [P] Implement graceful error messages with actionable guidance
- [x] T092 [P] Add accessibility attributes (ARIA labels) to interactive elements
- [x] T093 [P] Test calendar display with edge cases (28, 29, 30, 31 day months)
- [x] T094 [P] Test handling of long titles/descriptions (truncation in calendar)
- [x] T095 Verify all routes require authentication except /register and /login
- [x] T096 Run quickstart.md validation to ensure setup instructions work
- [x] T097 Create seed data for development/testing (optional)
- [x] T098 Document environment variables in README or .env.example

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
  - User Story 3 (P3): Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 auth but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1 auth but independently testable

### Within Each User Story

- Validators before controllers (T025-T026 before T027-T029 for US1)
- Models before services (already in Foundational phase)
- Controllers before pages (T027-T029 before T030-T031 for US1)
- Core implementation before integration (T040-T046 before T050-T059 for US2)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T004, T008-T009)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T015-T017, T020-T024)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel:
  - US1: T025-T026 (validators), T030-T031 (pages)
  - US2: T047-T049 (components)
  - US3: T067-T068 (components)
- All Polish tasks marked [P] can run in parallel (T080-T094)

---

## Parallel Example: User Story 1 (Authentication)

```bash
# Launch all validators for User Story 1 together:
Task: "Create registration validator in app/validators/register_validator.ts"
Task: "Create login validator in app/validators/login_validator.ts"

# After controllers complete, launch both page components together:
Task: "Create registration page component in inertia/pages/auth/register.tsx"
Task: "Create login page component in inertia/pages/auth/login.tsx"
```

---

## Parallel Example: User Story 2 (Todos)

```bash
# Launch all components for User Story 2 together:
Task: "Create CalendarView component with Ant Design Calendar in inertia/components/calendar/calendar_view.tsx"
Task: "Create TodoListCard component (top card) in inertia/components/cards/todo_list_card.tsx"
Task: "Create TodoFormCard component (bottom card) in inertia/components/cards/todo_form_card.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T024) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T025-T039)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Register new account
   - Login with credentials
   - Create a todo item (requires basic todo model, but full CRUD not needed)
   - Logout
   - Login as different user
   - Verify first user's todos not visible (data isolation)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP with authentication!)
3. Add User Story 2 → Test independently → Deploy/Demo (Full todo management)
4. Add User Story 3 → Test independently → Deploy/Demo (Complete app with notes)
5. Polish phase → Final refinements → Production deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T024)
2. Once Foundational is done:
   - Developer A: User Story 1 (T025-T039)
   - Developer B: User Story 2 (T040-T059)
   - Developer C: User Story 3 (T060-T079)
3. Stories complete and integrate independently
4. Team reconvenes for Polish phase (T080-T098)

---

## Implementation Notes

### Critical Requirements

**Data Isolation (FR-003, SC-003)**:

- EVERY database query MUST filter by `user_id = auth.user.id`
- EVERY update/delete MUST verify ownership before execution
- Tasks T039, T045, T065 specifically enforce this
- All controllers MUST use query scopes from models (T015-T017)

**Performance Goals**:

- Calendar updates <1s (SC-006) - optimistic UI updates (T052-T053, T071, T073)
- Modal opens <1s (SC-007) - client-side rendering (T071-T072)
- No page reloads for CRUD (SC-011) - Inertia partial reloads (T054, T074)

**Authentication Flow**:

- All routes except /register and /login require auth middleware (T095)
- Session timeout 30min (T087)
- Redirect to /todos after successful auth (T038)

### File Path Conventions

**Backend**:

- Controllers: `app/controllers/{entity}_controller.ts`
- Models: `app/models/{entity}.ts`
- Validators: `app/validators/{entity}_validator.ts`
- Middleware: `app/middleware/{name}.ts`
- Migrations: `database/migrations/{timestamp}_create_{table}_table.ts`

**Frontend**:

- Pages: `inertia/pages/{feature}/index.tsx`
- Components: `inertia/components/{category}/{name}.tsx`
- Utilities: `inertia/lib/{name}.ts`

**Tests** (if implemented):

- Unit: `tests/unit/{category}/test_{name}.ts`
- Functional: `tests/functional/test_{entity}.ts`
- Browser: `tests/browser/test_{flow}_flow.ts`

### Technology Stack References

- **AdonisJS v6**: Fullstack framework with Lucid ORM, session auth
- **Inertia.js**: Server-side rendering adapter for React
- **React + TypeScript**: Frontend UI components
- **Ant Design v6.2.2**: UI component library (Calendar, Modal, Form, Card)
- **Day.js**: Date manipulation and timezone handling
- **PostgreSQL 15**: Database with Docker Compose
- **VineJS**: Request validation (AdonisJS v6 built-in)
- **Japa**: Test runner (backend unit/functional/browser tests)
- **Vitest**: Test runner (React component tests)

### Testing Strategy (Optional)

Tests are NOT included in this task list because they were NOT explicitly requested in the feature specification. If tests are needed:

1. **Unit Tests** (70%): Models, validators, utilities
   - Test user password hashing (T015)
   - Test query scopes for data isolation (T016-T017)
   - Test validators (T025-T026, T040, T060)

2. **Functional Tests** (25%): HTTP endpoints, Inertia responses
   - Test authentication flow (T027-T029)
   - Test data isolation (T039, T045, T065)
   - Test CRUD operations (T041-T044, T061-T064)

3. **Browser Tests** (5%): Critical user flows
   - Registration → Login → Create todo → Logout (US1 acceptance)
   - Calendar interaction + todo CRUD (US2 acceptance)
   - Calendar interaction + note modal (US3 acceptance)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are OPTIONAL - only add if explicitly requested or user asks for TDD approach

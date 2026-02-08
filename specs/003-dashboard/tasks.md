# Tasks: Dashboard Home Screen

**Feature**: 003-dashboard
**Input**: Design documents from `/specs/003-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: NOT REQUIRED - Tests not explicitly requested in specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project structure per plan.md:

- Backend: `app/models/`, `app/controllers/`, `app/validators/`, `app/services/`
- Frontend: `inertia/pages/`, `inertia/components/`, `inertia/lib/`
- Database: `database/migrations/`
- Routes: `start/routes.ts`
- Environment: `.env`, `start/env.ts`
- Tests: `tests/functional/`, `tests/unit/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration and database schema setup

- [x] T001 Add OPENWEATHERMAP_API_KEY to .env file
- [x] T002 Add OPENWEATHERMAP_API_KEY validation in start/env.ts
- [x] T003 Create user_settings table migration in database/migrations/[timestamp]\_create_user_settings_table.ts
- [x] T004 Run migration: node ace migration:run

**Checkpoint**: Database schema ready, environment configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, validators, and services that multiple user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create UserSetting model in app/models/user_setting.ts
- [x] T006 Add UserSetting validator in app/validators/user_setting_validator.ts
- [x] T007 Create WeatherService in app/services/weather_service.ts
- [x] T008 [P] Add TypeScript interfaces (UserSettings, WeatherData, DashboardProps) in inertia/lib/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Dashboard Overview (Priority: P1) 🎯 MVP Core

**Goal**: User can access dashboard at root route and see date/time + placeholders for other cards

**Independent Test**: Navigate to `/`, verify dashboard renders with current date/time display

### Implementation for User Story 1

- [x] T009 [US1] Create DashboardController with index() method in app/controllers/dashboard_controller.ts
- [x] T010 [US1] Add route GET / → dashboard_controller.index with auth middleware in start/routes.ts
- [x] T011 [P] [US1] Create dashboard main page component in inertia/pages/dashboard/index.tsx
- [x] T012 [P] [US1] Create DateTimeCard component with real-time clock in inertia/components/cards/datetime_card.tsx
- [x] T013 [US1] Implement Ant Design Grid layout (responsive: xs=24, md=12, lg=6) in dashboard/index.tsx
- [x] T014 [US1] Integrate DateTime card into dashboard page

**Checkpoint**: User can access dashboard, see current date and time updating every minute

---

## Phase 4: User Story 4 - Check Weather Information (Priority: P1) 🌤️ MVP Weather

**Goal**: If city configured, user sees weather data; otherwise sees prompt to configure

**Independent Test**: Configure city in settings, verify weather displays correctly on dashboard

**Note**: Implementing US4 before US2/US3 because weather + date/time = complete P1 MVP

### Implementation for User Story 4

- [x] T015 [P] [US4] Create WeatherCard component with weather display in inertia/components/cards/weather_card.tsx
- [x] T016 [US4] Update DashboardController.index() to fetch user settings and weather data in app/controllers/dashboard_controller.ts
- [x] T017 [US4] Integrate weather card into dashboard page in inertia/pages/dashboard/index.tsx
- [x] T018 [US4] Add settings icon link to weather card header in inertia/components/cards/weather_card.tsx
- [x] T019 [US4] Implement empty state (no city configured) in weather card
- [x] T020 [US4] Implement error state (API unavailable) in weather card

**Checkpoint**: Dashboard shows weather when configured, helpful prompts when not configured or API fails

---

## Phase 5: User Story 5 - Configure Weather Settings (Priority: P2) ⚙️ Settings

**Goal**: User can configure their weather city preference via settings page

**Independent Test**: Access settings, enter city, save, return to dashboard and see updated weather

### Implementation for User Story 5

- [x] T021 [P] [US5] Create SettingsController with index() and update() methods in app/controllers/settings_controller.ts
- [x] T022 [P] [US5] Create settings page component in inertia/pages/settings/index.tsx
- [x] T023 [US5] Add routes: GET /settings → settings_controller.index, PATCH /settings → settings_controller.update in start/routes.ts
- [x] T024 [US5] Implement settings form with weatherCity field in inertia/pages/settings/index.tsx
- [x] T025 [US5] Add validation and success message handling in settings page
- [x] T026 [US5] Update main navigation to include "Paramètres" menu item in inertia/components/layout/header.tsx

**Checkpoint**: User can configure weather city, changes persist and reflect on dashboard

---

## Phase 6: User Story 2 - Manage Daily Todos (Priority: P2) ✅ Todos

**Goal**: User can toggle todo status and delete todos directly from dashboard

**Independent Test**: View dashboard with today's todos, toggle status, delete todo, verify changes persist

### Implementation for User Story 2

- [x] T027 [P] [US2] Create TodosCard component in inertia/components/cards/todos_card.tsx
- [x] T028 [US2] Update DashboardController.index() to fetch today's todos in app/controllers/dashboard_controller.ts
- [x] T029 [US2] Integrate todos card into dashboard page in inertia/pages/dashboard/index.tsx
- [x] T030 [US2] Implement status checkbox with optimistic UI in todos card
- [x] T031 [US2] Implement delete button with confirmation modal in todos card
- [x] T032 [US2] Add empty state (no todos today) with link to /todos in todos card
- [x] T033 [US2] Verify existing PATCH /todos/:id and DELETE /todos/:id routes work correctly

**Checkpoint**: User can manage daily todos from dashboard without navigating away

---

## Phase 7: User Story 3 - View Today's Notes (Priority: P3) 📝 Notes

**Goal**: User can see today's notes and view full content without leaving dashboard

**Independent Test**: Create notes today, verify they appear on dashboard, click to view content

### Implementation for User Story 3

- [x] T034 [P] [US3] Create NotesCard component in inertia/components/cards/notes_card.tsx
- [x] T035 [US3] Update DashboardController.index() to fetch today's notes in app/controllers/dashboard_controller.ts
- [x] T036 [US3] Integrate notes card into dashboard page in inertia/pages/dashboard/index.tsx
- [x] T037 [US3] Implement note list with click-to-view modal in notes card
- [x] T038 [US3] Add empty state (no notes today) with link to /notes in notes card

**Checkpoint**: All user stories implemented, dashboard fully functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, testing, and documentation

- [ ] T039 [P] Verify dashboard loads in < 2 seconds (performance check)
- [ ] T040 [P] Test responsive layout on mobile, tablet, desktop
- [ ] T041 [P] Verify all empty states display correctly
- [ ] T042 [P] Verify error handling (weather API timeout, invalid city, etc.)
- [ ] T043 [P] Test date filtering for todos and notes (timezone handling)
- [x] T044 [P] Update README.md with dashboard feature documentation
- [x] T045 [P] Update .env.example with OPENWEATHERMAP_API_KEY entry
- [ ] T046 Run quickstart.md validation workflow
- [ ] T047 Code cleanup and final review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T004) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T005-T008) completion
- **User Story 4 (Phase 4)**: Depends on Foundational (T005-T008) completion
- **User Story 5 (Phase 5)**: Depends on Foundational (T005-T008) completion
- **User Story 2 (Phase 6)**: Depends on Foundational (T005-T008) completion
- **User Story 3 (Phase 7)**: Depends on Foundational (T005-T008) completion
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start after Foundational
- **User Story 4 (P1)**: Independent - can start after Foundational (but benefits from US5 for testing)
- **User Story 5 (P2)**: Independent - can start after Foundational (required for US4 to be useful)
- **User Story 2 (P2)**: Independent - can start after Foundational
- **User Story 3 (P3)**: Independent - can start after Foundational

**Recommended Order**: US1 → US4 → US5 (P1 MVP complete), then US2 → US3 (P2/P3 enhancements)

### Within Each User Story

- Models/validators/services before controllers
- Controllers before routes
- Backend before frontend
- Core components before integration
- Empty/error states after main functionality

### Parallel Opportunities

**Setup Phase**:

- T001, T002 can be done together (different files)
- T003 depends on T001-T002 (needs env validated)

**Foundational Phase**:

- T005, T006, T007, T008 can all run in parallel (different files, no dependencies)

**User Stories**:

- After Foundational completes, US1, US4, US5, US2, US3 can all start in parallel (different files)
- Within each story, tasks marked [P] can run in parallel

**Polish Phase**:

- T039-T045 can all run in parallel (independent validation tasks)

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together:
Task: "Create UserSetting model in app/models/user_setting.ts"
Task: "Add UserSetting validator in app/validators/user_setting_validator.ts"
Task: "Create WeatherService in app/services/weather_service.ts"
Task: "Add TypeScript interfaces in inertia/lib/types.ts"
```

---

## Parallel Example: User Story 1

```bash
# Launch independent tasks together:
Task: "Create dashboard main page component in inertia/pages/dashboard/index.tsx"
Task: "Create DateTimeCard component in inertia/components/cards/datetime_card.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 4 Only) - Recommended for Initial Release

1. ✅ Complete Phase 1: Setup (T001-T004)
2. ✅ Complete Phase 2: Foundational (T005-T008) - CRITICAL
3. ✅ Complete Phase 3: User Story 1 (T009-T014) - Dashboard with date/time
4. ✅ Complete Phase 4: User Story 4 (T015-T020) - Weather display
5. ⚠️ Complete Phase 5: User Story 5 (T021-T026) - Settings (needed to configure weather)
6. **STOP and VALIDATE**: Test dashboard with date/time + weather
7. Deploy/demo MVP (dashboard overview + weather)

**MVP Value**: User has a functional daily dashboard with real-time clock and weather

---

### Incremental Delivery (Full Feature)

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Dashboard accessible with date/time
3. Add User Story 4 + 5 → Weather functional (deploy P1 MVP!)
4. Add User Story 2 → Todo management from dashboard
5. Add User Story 3 → Notes viewing from dashboard
6. Polish → Production-ready

---

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T008)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T009-T014) - Dashboard skeleton
   - **Developer B**: User Story 4 + 5 (T015-T026) - Weather + Settings
   - **Developer C**: User Story 2 + 3 (T027-T038) - Todos + Notes
3. Stories integrate naturally through shared DashboardController and page

---

## Task Summary

**Total Tasks**: 47

**By Phase**:

- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US1 - Dashboard): 6 tasks
- Phase 4 (US4 - Weather): 6 tasks
- Phase 5 (US5 - Settings): 6 tasks
- Phase 6 (US2 - Todos): 7 tasks
- Phase 7 (US3 - Notes): 5 tasks
- Phase 8 (Polish): 9 tasks

**By User Story**:

- User Story 1 (View Dashboard): 6 tasks
- User Story 2 (Manage Todos): 7 tasks
- User Story 3 (View Notes): 5 tasks
- User Story 4 (Weather): 6 tasks
- User Story 5 (Settings): 6 tasks
- Setup/Foundation: 8 tasks
- Polish: 9 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phase

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story can be independently completed and tested
- Existing Todo/Note models and routes are reused (no modification needed)
- Weather API errors are handled gracefully with null returns
- Real-time clock uses client-side interval (no server polling)
- Date filtering uses server-side SQL queries for accuracy
- Settings use firstOrCreate pattern to avoid missing records
- Commit after each task or logical group for clean git history
- Stop at any checkpoint to validate story independently

---

## Validation Checklist

- ✅ All user stories from spec.md are represented
- ✅ Tasks follow strict checklist format (- [ ] [ID] [P?] [Story?] Description with path)
- ✅ Tasks organized by user story for independent delivery
- ✅ Clear file paths specified for each task
- ✅ Dependencies documented and enforced through phase structure
- ✅ Parallel opportunities identified with [P] markers
- ✅ MVP scope clearly defined (US1 + US4 + US5)
- ✅ Incremental delivery strategy documented
- ✅ Tests NOT included (not requested in specification)
- ✅ Tech stack matches plan.md (AdonisJS, Lucid, Inertia, React, Ant Design)

---

**Ready for implementation!**

Run `/speckit.implement` to execute tasks sequentially following this plan.

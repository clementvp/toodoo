# Implementation Plan: Dashboard Home Screen

**Feature**: 003-dashboard
**Date**: 2026-02-08
**Input**: Feature specification from `/specs/003-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a dashboard home screen at the root route (`/`) that displays a daily overview with four main cards:

1. Current date and real-time clock (HH:MM)
2. Today's todos (filtered by `dueDate`) with inline status toggle and delete
3. Today's notes (filtered by `createdAt`) with view capability
4. Weather information from OpenWeatherMap API (requires user city configuration)

Additionally, implement a settings page for users to configure their weather city preference, accessible from main navigation and weather card.

**Technical Approach**: Leverage existing Todo and Note models, create new UserSettings model for preferences, integrate OpenWeatherMap API, and build responsive React UI with Ant Design components.

---

## Phase 0: Research & Discovery (Completed)

**Status**: ✅ Complete

**Outputs**:

- `specs/003-dashboard/research.md` - Technical decisions documented
- `specs/003-dashboard/data-model.md` - Database schema and models defined
- `specs/003-dashboard/contracts/api.md` - API contracts specified

**Key Decisions**:

- Real-time clock: Client-side React interval
- Date filtering: Server-side SQL queries
- Weather: OpenWeatherMap Current Weather API
- Settings storage: Dedicated `user_settings` table (one-to-one with User)
- Layout: Ant Design Grid with responsive Card components
- Todo updates: Inline checkbox with optimistic UI
- Notes: Read-only list with modal view

---

## Phase 1: Foundation & Data Layer

**Goal**: Set up database schema, models, and backend services for dashboard and settings.

### Tasks

#### 1.1 Database Migration - UserSettings Table

**File**: `database/migrations/[timestamp]_create_user_settings_table.ts`

**Actions**:

- Create `user_settings` table with columns: `id`, `user_id` (unique FK), `weather_city`, `created_at`, `updated_at`
- Add unique index on `user_id`
- Set up CASCADE DELETE on user deletion
- Run migration: `node ace migration:run`

**Success Criteria**:

- Migration runs without errors
- `user_settings` table exists in database
- Unique constraint on `user_id` is enforced

---

#### 1.2 Lucid Model - UserSetting

**File**: `app/models/user_setting.ts`

**Actions**:

- Create UserSetting model extending BaseModel
- Define columns: `id`, `userId`, `weatherCity`, `createdAt`, `updatedAt`
- Add `belongsTo` relationship to User
- Implement `forUser` query scope

**Success Criteria**:

- Model loads without errors
- Can create/read/update user settings records
- Relationship with User works correctly

---

#### 1.3 Validator - UserSettings

**File**: `app/validators/user_setting_validator.ts`

**Actions**:

- Create VineJS validator for settings update
- Validate `weatherCity`: optional, string, 1-100 characters

**Success Criteria**:

- Validator accepts valid city names
- Validator rejects cities > 100 characters
- Validator allows null/empty (optional field)

---

#### 1.4 Weather Service

**File**: `app/services/weather_service.ts`

**Actions**:

- Create `fetchWeatherData(city: string)` function
- Integrate OpenWeatherMap API (current weather endpoint)
- Parse response into `WeatherData` interface
- Handle errors gracefully (return null on failure)
- Add API key to `.env`: `OPENWEATHERMAP_API_KEY`

**Success Criteria**:

- Fetches weather data for valid city (e.g., "Paris")
- Returns null for invalid city
- Returns null on API timeout/error
- Respects 5-second timeout

**Dependencies**: Environment variable setup

---

#### 1.5 Environment Configuration

**File**: `.env`, `start/env.ts`

**Actions**:

- Add `OPENWEATHERMAP_API_KEY` to `.env` file
- Add validation in `start/env.ts` for API key

**Success Criteria**:

- API key loads correctly from environment
- Application fails gracefully if key is missing (with helpful error)

---

### Phase 1 Deliverables

```text
specs/003-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

**Files Created**:

- Migration: `database/migrations/[timestamp]_create_user_settings_table.ts`
- Model: `app/models/user_setting.ts`
- Validator: `app/validators/user_setting_validator.ts`
- Service: `app/services/weather_service.ts`
- Environment: `.env` (updated), `start/env.ts` (updated)

**Tests**: Unit tests for weather service and validator (Phase 2)

---

## Phase 2: Backend - Controllers & Routes

**Goal**: Implement backend endpoints for dashboard data and settings management.

### Tasks

#### 2.1 Dashboard Controller

**File**: `app/controllers/dashboard_controller.ts`

**Actions**:

- Create `index()` method to render dashboard
- Fetch today's todos (where `dueDate = today`)
- Fetch today's notes (where `DATE(createdAt) = today`)
- Fetch or create user settings (`firstOrCreate` pattern)
- Fetch weather data if city is configured
- Use `Promise.all` for parallel queries
- Render `dashboard/index` Inertia page with data

**Success Criteria**:

- Returns correct todos for current date
- Returns correct notes for current date
- Returns user settings (creates if not exists)
- Returns weather data if city configured
- Loads in < 2 seconds

---

#### 2.2 Settings Controller

**File**: `app/controllers/settings_controller.ts`

**Actions**:

- Create `index()` method to render settings page
- Create `update()` method to update user settings
- Validate city input using VineJS validator
- Use `firstOrCreate` pattern for settings record
- Return to dashboard or settings page with success message

**Success Criteria**:

- Can view current settings
- Can update weather city
- Validates city name (1-100 chars)
- Persists changes to database
- Redirects with success feedback

---

#### 2.3 Routes Configuration

**File**: `start/routes.ts`

**Actions**:

- Add route: `GET /` → `dashboard_controller.index` (with `auth` middleware)
- Add route: `GET /settings` → `settings_controller.index` (with `auth` middleware)
- Add route: `PATCH /settings` → `settings_controller.update` (with `auth` middleware)
- Ensure existing `/todos/:id` PATCH and DELETE routes are accessible (reuse for dashboard actions)

**Success Criteria**:

- `/` renders dashboard (authenticated users only)
- `/settings` renders settings page (authenticated users only)
- `PATCH /settings` updates settings
- Existing todo routes work for status updates and deletions

---

#### 2.4 Update Existing Todo Routes (Verification)

**File**: `start/routes.ts`, `app/controllers/todos_controller.ts`

**Actions**:

- Verify `PATCH /todos/:id` exists and handles status updates
- Verify `DELETE /todos/:id` exists and handles deletions
- Ensure user ownership validation is in place

**Success Criteria**:

- Dashboard can reuse existing todo endpoints
- User can only update/delete their own todos
- Returns proper error codes for unauthorized access

---

### Phase 2 Deliverables

**Files Created**:

- `app/controllers/dashboard_controller.ts`
- `app/controllers/settings_controller.ts`
- `start/routes.ts` (updated)

**Tests**: Functional tests for dashboard and settings endpoints (Phase 3)

---

## Phase 3: Frontend - Dashboard UI

**Goal**: Build responsive dashboard interface with all cards.

### Tasks

#### 3.1 TypeScript Interfaces

**File**: `inertia/lib/types.ts`

**Actions**:

- Add `UserSettings` interface
- Add `WeatherData` interface
- Add `DashboardProps` interface
- Ensure `Todo` and `Note` interfaces exist (from previous features)

**Success Criteria**:

- All interfaces match backend data structures
- TypeScript compilation passes
- Proper type safety in components

---

#### 3.2 Dashboard Main Page

**File**: `inertia/pages/dashboard/index.tsx`

**Actions**:

- Create dashboard page component
- Set up Ant Design Grid layout (4 columns on desktop, responsive)
- Import and render 4 card components (placeholders initially)
- Handle props from backend (`todosToday`, `notesToday`, `weather`, `userSettings`)

**Success Criteria**:

- Page renders without errors
- Grid layout is responsive (mobile: 1 col, tablet: 2 cols, desktop: 4 cols)
- Receives data from backend correctly

---

#### 3.3 DateTime Card Component

**File**: `inertia/components/cards/datetime_card.tsx`

**Actions**:

- Display current date (formatted in French, e.g., "Samedi 8 février 2026")
- Display current time (HH:MM format)
- Use React `useState` and `useEffect` with `setInterval` to update time every minute
- Clean up interval on component unmount

**Success Criteria**:

- Shows correct current date
- Shows correct current time
- Time updates automatically every minute
- No memory leaks (interval cleaned up)

---

#### 3.4 Weather Card Component

**File**: `inertia/components/cards/weather_card.tsx`

**Actions**:

- Display weather data: temperature, description, icon, min/max, humidity, wind
- Show weather icon from OpenWeatherMap (`https://openweathermap.org/img/wn/{icon}@2x.png`)
- Add settings icon in card header (links to `/settings`)
- Handle empty state: "Configurez votre ville" with link to settings
- Handle error state: "Météo indisponible" when API fails

**Success Criteria**:

- Displays all weather fields correctly
- Shows icon from OpenWeatherMap
- Settings icon links to `/settings`
- Empty state shows when no city configured
- Error state shows when weather data is null

---

#### 3.5 Todos Card Component

**File**: `inertia/components/cards/todos_card.tsx`

**Actions**:

- Display list of today's todos
- Each todo shows: checkbox (status), title, delete button
- Checkbox toggles status (À faire ⟷ Terminé)
- Delete button opens confirmation modal
- Handle empty state: "Aucun todo pour aujourd'hui" with link to `/todos`
- Implement optimistic UI updates

**Success Criteria**:

- Lists today's todos correctly
- Checkbox toggles status and persists change
- Delete button works with confirmation
- Empty state shows when no todos
- Optimistic UI provides instant feedback

**Dependencies**: Existing `PATCH /todos/:id` and `DELETE /todos/:id` routes

---

#### 3.6 Notes Card Component

**File**: `inertia/components/cards/notes_card.tsx`

**Actions**:

- Display list of today's notes (titles only)
- Each note clickable to view full content
- Open modal with note title and content on click
- Handle empty state: "Aucune note créée aujourd'hui" with link to `/notes`

**Success Criteria**:

- Lists today's notes (titles)
- Clicking note opens modal with full content
- Modal displays title and content correctly
- Empty state shows when no notes

---

### Phase 3 Deliverables

**Files Created**:

- `inertia/pages/dashboard/index.tsx`
- `inertia/components/cards/datetime_card.tsx`
- `inertia/components/cards/weather_card.tsx`
- `inertia/components/cards/todos_card.tsx`
- `inertia/components/cards/notes_card.tsx`
- `inertia/lib/types.ts` (updated)

**Tests**: Component tests and integration tests (Phase 4)

---

## Phase 4: Frontend - Settings Page

**Goal**: Build settings page for weather city configuration.

### Tasks

#### 4.1 Settings Page

**File**: `inertia/pages/settings/index.tsx`

**Actions**:

- Create settings page component
- Display form with single field: "Ville météo"
- Pre-fill with current `weatherCity` from props
- Submit to `PATCH /settings` on save
- Show success message on save
- Add link back to dashboard

**Success Criteria**:

- Form displays current city (if set)
- Can update city and submit
- Shows success message after save
- Redirects or stays on page with feedback

---

#### 4.2 Update Main Navigation

**File**: `inertia/layouts/main_layout.tsx` (or equivalent)

**Actions**:

- Add "Paramètres" menu item with link to `/settings`
- Use Ant Design `<SettingOutlined />` icon

**Success Criteria**:

- "Paramètres" appears in navigation menu
- Links to `/settings` correctly

---

### Phase 4 Deliverables

**Files Created**:

- `inertia/pages/settings/index.tsx`
- `inertia/layouts/main_layout.tsx` (updated)

**Tests**: Settings page tests (Phase 5)

---

## Phase 5: Testing & Quality Assurance

**Goal**: Comprehensive testing of dashboard and settings functionality.

### Tasks

#### 5.1 Unit Tests - Weather Service

**File**: `tests/unit/weather_service.spec.ts`

**Actions**:

- Mock axios requests
- Test successful weather fetch
- Test invalid city (returns null)
- Test API timeout (returns null)
- Test API error (returns null)

**Success Criteria**: All tests pass

---

#### 5.2 Unit Tests - UserSetting Validator

**File**: `tests/unit/user_setting_validator.spec.ts`

**Actions**:

- Test valid city name (accepted)
- Test city > 100 chars (rejected)
- Test null/empty city (accepted - optional)

**Success Criteria**: All tests pass

---

#### 5.3 Functional Tests - Dashboard

**File**: `tests/functional/dashboard.spec.ts`

**Actions**:

- Test unauthenticated access (redirects to login)
- Test dashboard loads with correct data
- Test todos filtered by today's date
- Test notes filtered by today's date
- Test weather displays when city configured
- Test empty states (no todos, no notes, no city)

**Success Criteria**: All tests pass

---

#### 5.4 Functional Tests - Settings

**File**: `tests/functional/settings.spec.ts`

**Actions**:

- Test settings page loads
- Test updating weather city
- Test validation (city too long)
- Test firstOrCreate logic (creates settings if not exists)

**Success Criteria**: All tests pass

---

#### 5.5 Integration Tests - Todo Actions

**File**: `tests/functional/dashboard_todo_actions.spec.ts`

**Actions**:

- Test toggling todo status from dashboard
- Test deleting todo from dashboard
- Test user can only modify their own todos

**Success Criteria**: All tests pass

---

### Phase 5 Deliverables

**Files Created**:

- `tests/unit/weather_service.spec.ts`
- `tests/unit/user_setting_validator.spec.ts`
- `tests/functional/dashboard.spec.ts`
- `tests/functional/settings.spec.ts`
- `tests/functional/dashboard_todo_actions.spec.ts`

**Command**: `npm test`

---

## Phase 6: Documentation & Deployment Prep

**Goal**: Document feature and prepare for deployment.

### Tasks

#### 6.1 Quickstart Guide

**File**: `specs/003-dashboard/quickstart.md`

**Actions**:

- Document environment setup (API key)
- Document running migrations
- Document accessing dashboard and settings
- Document testing workflow

**Success Criteria**: New developers can set up and use feature

---

#### 6.2 Update Project README

**File**: `README.md`

**Actions**:

- Add dashboard feature to feature list
- Document OpenWeatherMap API key requirement
- Add screenshot or description of dashboard

**Success Criteria**: README accurately reflects new feature

---

#### 6.3 Environment Setup Guide

**Actions**:

- Document how to get OpenWeatherMap API key
- Add example `.env.example` entry

**Success Criteria**: Clear instructions for API key setup

---

### Phase 6 Deliverables

**Files Created/Updated**:

- `specs/003-dashboard/quickstart.md`
- `README.md` (updated)
- `.env.example` (updated)

---

## User Story Implementation Order

### Story 1: View Dashboard Overview (P1) ✅ Foundation

**Phases**: 1, 2, 3
**Components**: Dashboard page, DateTime card, Weather card (empty state)
**Backend**: Dashboard controller, routes
**Test**: Can access dashboard and see date/time

---

### Story 2: Check Weather Information (P1) 🌤️ Weather

**Phases**: 1, 2, 3
**Components**: Weather card (with data), Weather service
**Backend**: Weather API integration
**Test**: Weather displays correctly when city configured

---

### Story 3: Configure Weather Settings (P2) ⚙️ Settings

**Phases**: 2, 4
**Components**: Settings page, Navigation update
**Backend**: Settings controller, routes
**Test**: Can configure city and see weather update

---

### Story 4: Manage Daily Todos (P2) ✅ Todos

**Phases**: 3
**Components**: Todos card (with actions)
**Backend**: Reuse existing todo endpoints
**Test**: Can toggle status and delete todos from dashboard

---

### Story 5: View Today's Notes (P3) 📝 Notes

**Phases**: 3
**Components**: Notes card (with modal view)
**Backend**: Dashboard controller (notes query)
**Test**: Can view today's notes from dashboard

---

## Dependencies & Blockers

### External Dependencies

- **OpenWeatherMap API**: Requires valid API key (user-provided)
- **Ant Design**: Already in project
- **Luxon**: Already in project (for date/time handling)

### Internal Dependencies

- **Todo Model**: Already exists (Phase 1 blocker resolved)
- **Note Model**: Already exists (Phase 1 blocker resolved)
- **User Model**: Already exists (Phase 1 blocker resolved)
- **Authentication**: Already implemented (required for dashboard)

### Blockers

- None identified. All dependencies exist or are user-provided (API key).

---

## Validation Checklist ✅

- ✅ **Incremental Delivery**: Each user story deliverable independently
  - P1 stories (dashboard overview + weather) can deploy first
  - Settings (P2) can deploy next
  - Todo actions (P2) and notes (P3) can follow

- ✅ **Testability**: Clear acceptance criteria for each story
  - Unit tests for services and validators
  - Functional tests for controllers
  - Integration tests for UI interactions

- ✅ **Dependencies Identified**: All external and internal dependencies documented
  - OpenWeatherMap API (external, user-provided key)
  - Existing models (internal, already exist)

- ✅ **Data Privacy**: User data isolation enforced
  - User settings one-to-one with user
  - Dashboard shows only authenticated user's data
  - Todo/note queries filtered by user ID

- ✅ **Performance**: Acceptable load times
  - Parallel queries (Promise.all)
  - Single weather API call per dashboard load
  - Estimated < 2 second load time

- ✅ **Error Handling**: Graceful degradation
  - Weather API failures return null (show error card)
  - Missing city shows empty state with prompt
  - Invalid cities handled by API (returns null)

- ✅ **Responsive Design**: Mobile-friendly
  - Ant Design Grid with responsive breakpoints
  - Cards stack on mobile, grid on desktop

---

## Risks & Mitigation

### Risk 1: Weather API Rate Limits

**Impact**: Users may see stale/missing weather data if rate limit exceeded
**Likelihood**: Low (free tier: 60 calls/min, 1M/month)
**Mitigation**:

- Monitor API usage
- Future: Implement caching (15-30 min TTL)
- Graceful error handling (show error card)

### Risk 2: Timezone Confusion

**Impact**: Users in different timezones may see incorrect "today's" data
**Likelihood**: Medium (depends on user base geography)
**Mitigation**:

- Use server timezone consistently for all users (documented assumption)
- Future: Allow user timezone configuration

### Risk 3: Clock Interval Memory Leaks

**Impact**: Browser memory leaks if interval not cleaned up
**Likelihood**: Low (handled by React cleanup)
**Mitigation**:

- Proper useEffect cleanup function
- Test for memory leaks during QA

---

## Phase 2: Implementation Planning

_This section is NOT filled by `/speckit.plan`. Run `/speckit.tasks` to generate the task breakdown._

## Validation Checklist ✅

- ✅ All user stories have clear acceptance criteria
- ✅ Data model is complete and normalized
- ✅ API contracts are well-defined
- ✅ Dependencies are identified and available
- ✅ Risks are documented with mitigation strategies
- ✅ Testing strategy is comprehensive
- ✅ No constitution violations detected

**Ready for implementation!**

Run `/speckit.tasks` to generate the task breakdown for implementation.

The task generation will create `tasks.md` with:

- Granular implementation tasks
- Task dependencies and ordering
- Estimated effort per task
- Test tasks for each component

**Expected workflow after `/speckit.tasks`**:

1. Review generated tasks in `specs/003-dashboard/tasks.md`
2. Run `/speckit.implement` to execute tasks sequentially
3. Test each user story independently as implemented
4. Deploy incrementally after each story completes

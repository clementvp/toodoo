# Feature Specification: Dashboard Home Screen

**Feature Branch**: `003-dashboard`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Écran d'accueil en mode dashboard avec des cards pour visualiser:

- La date du jour et l'heure courante (HH:MM) en temps réel
- Les todos du jour (filtrés par due_date = aujourd'hui) avec possibilité de modifier leur status et les supprimer
- Les notes du jour (filtrées par created_at = aujourd'hui) et pouvoir les consulter
- La météo du jour (via OpenWeatherMap API, clé API disponible)
- Settings utilisateur pour configurer la ville météo (table DB, écran settings)
- Route: / (page d'accueil)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Dashboard Overview (Priority: P1)

A user opens the application and immediately sees their daily overview: current date/time, today's todos, today's notes, and weather information in a single glance.

**Why this priority**: This is the core value proposition - providing a centralized daily overview. Without this, the dashboard doesn't exist. This is the minimum viable product.

**Independent Test**: Can be fully tested by accessing the root route and verifying all cards render with correct data. Delivers immediate value by consolidating daily information.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they navigate to `/`, **Then** they see the dashboard with date/time, todos, notes, and weather cards
2. **Given** the user has todos due today, **When** they view the dashboard, **Then** only todos with dueDate = today are displayed
3. **Given** the user has notes created today, **When** they view the dashboard, **Then** only notes with createdAt = today are displayed
4. **Given** the current time changes, **When** the user is viewing the dashboard, **Then** the time display updates automatically without page refresh

---

### User Story 2 - Manage Daily Todos (Priority: P2)

A user wants to quickly manage their daily tasks directly from the dashboard by changing task status and deleting completed items.

**Why this priority**: After viewing todos, managing them is the next essential action. This prevents users from having to navigate away to update simple status changes.

**Independent Test**: Can be tested by interacting with todo items on the dashboard and verifying status changes and deletions persist. Delivers value by enabling quick task management.

**Acceptance Scenarios**:

1. **Given** a todo is displayed on the dashboard, **When** the user checks/unchecks the status checkbox, **Then** the todo status toggles between "À faire" and "Terminé"
2. **Given** a todo is displayed on the dashboard, **When** the user clicks the delete button, **Then** the todo is removed from the list
3. **Given** the user updates a todo status, **When** the change is saved, **Then** the update persists without page refresh

---

### User Story 3 - View Today's Notes (Priority: P3)

A user wants to see notes they created today and access them for reading without leaving the dashboard.

**Why this priority**: Completes the daily overview by including notes. While useful, it's lower priority than actionable todos. Users can still navigate to the notes page if needed.

**Independent Test**: Can be tested by creating notes today and verifying they appear on the dashboard with ability to view them. Delivers convenience by surfacing recent notes.

**Acceptance Scenarios**:

1. **Given** the user created notes today, **When** they view the dashboard, **Then** all notes created today are listed
2. **Given** a note is displayed on the dashboard, **When** the user clicks to view it, **Then** the full note content is accessible
3. **Given** no notes were created today, **When** the user views the dashboard, **Then** an empty state or message is shown

---

### User Story 4 - Check Weather Information (Priority: P1)

A user wants to see current weather conditions for their configured location without leaving the application.

**Why this priority**: Weather is a core dashboard feature that provides contextual daily information. Essential for the "daily overview" value proposition.

**Independent Test**: Can be tested by configuring a city and verifying weather data from OpenWeatherMap API displays correctly. Delivers immediate contextual value.

**Acceptance Scenarios**:

1. **Given** the user has configured a city, **When** they view the dashboard, **Then** current weather (temperature, description, icon) is displayed
2. **Given** weather data is available, **When** displayed on dashboard, **Then** min/max temperatures, humidity, and wind speed are shown
3. **Given** the user has not configured a city, **When** they view the dashboard, **Then** a prompt to configure weather settings is shown
4. **Given** the weather API is unavailable, **When** loading the dashboard, **Then** a graceful error message is displayed instead of the weather card

---

### User Story 5 - Configure Weather Settings (Priority: P2)

A user needs to set their preferred city to receive accurate weather information on their dashboard.

**Why this priority**: Required for weather feature to function, but users only need to do this once. Can be delayed slightly after initial dashboard implementation.

**Independent Test**: Can be tested by accessing settings, entering a city name, saving, and verifying weather data updates on dashboard. Delivers personalization.

**Acceptance Scenarios**:

1. **Given** the user accesses settings via menu navigation, **When** they enter a city name and save, **Then** the city is stored in their user settings
2. **Given** the user accesses settings via weather card icon, **When** they update their city, **Then** the dashboard weather updates immediately
3. **Given** the user enters an invalid city name, **When** they try to save, **Then** validation feedback is provided
4. **Given** the user has no city configured, **When** they first access settings, **Then** the city field is empty with helpful placeholder text

---

### Edge Cases

- What happens when a user has no todos due today?
- What happens when a user has no notes created today?
- What happens when the OpenWeatherMap API is down or rate-limited?
- What happens when a user enters a city that doesn't exist?
- What happens when a user has configured a city but the weather data is stale?
- What happens when the user's browser time zone differs from server time zone?
- What happens when a user deletes a todo while another device has the dashboard open?
- How does the dashboard handle very long city names or special characters?
- What happens when the user has 100+ todos due today?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display current date in readable format on dashboard
- **FR-002**: System MUST display current time (HH:MM) that updates in real-time without page refresh
- **FR-003**: System MUST filter and display only todos with dueDate = current date
- **FR-004**: System MUST allow users to change todo status (À faire ⟷ Terminé) from dashboard
- **FR-005**: System MUST allow users to delete todos from dashboard
- **FR-006**: System MUST filter and display only notes created today (createdAt = current date)
- **FR-007**: System MUST allow users to view/read notes from dashboard
- **FR-008**: System MUST fetch weather data from OpenWeatherMap API
- **FR-009**: System MUST display weather: temperature, description, icon, min/max, humidity, wind
- **FR-010**: System MUST allow users to configure their city for weather via settings page
- **FR-011**: System MUST persist user weather city preference in database
- **FR-012**: Settings page MUST be accessible from main navigation menu
- **FR-013**: Settings page MUST be accessible from weather card on dashboard
- **FR-014**: Dashboard MUST be the root route (/) of the application
- **FR-015**: Dashboard MUST require authentication
- **FR-016**: System MUST handle gracefully when weather API is unavailable
- **FR-017**: System MUST show empty states when no todos/notes exist for today

### Key Entities _(include if feature involves data)_

- **UserSettings**: Stores user-specific configuration (weather city preference). One-to-one relationship with User.
- **Dashboard**: Aggregates data from existing Todos, Notes, and external Weather API.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Dashboard loads and displays all cards within 2 seconds
- **SC-002**: Time display updates every minute without user intervention
- **SC-003**: Todo status changes reflect immediately (< 500ms)
- **SC-004**: Weather data loads within 3 seconds or shows error state
- **SC-005**: Users can configure city and see updated weather within 5 seconds
- **SC-006**: Dashboard correctly filters todos/notes by current date in user's timezone
- **SC-007**: Dashboard remains functional with 0-100 todos/notes per day

## Assumptions

- Users are authenticated and have user accounts
- Existing Todo and Note models/tables are available
- User has provided OpenWeatherMap API key (stored in environment variables)
- OpenWeatherMap free tier rate limits are acceptable (60 calls/minute, 1M calls/month)
- Real-time time display is client-side (no server polling needed)
- Date filtering uses server's timezone or user's browser timezone
- Weather data refreshes on dashboard reload (no automatic background refresh)
- One city per user (no multiple locations support)
- Dashboard layout is responsive and works on desktop and mobile

## Out of Scope

- Multiple city support (user can only configure one city)
- Weather forecast (only current weather)
- Historical weather data
- Weather alerts or notifications
- Customizable dashboard layout (drag-and-drop cards)
- Widget selection (all cards always visible)
- Editing todo title/description from dashboard (only status and delete)
- Creating new todos/notes from dashboard
- Editing notes from dashboard
- Calendar view or date picker for different dates
- Dashboard themes or appearance customization
- Export dashboard data
- Dashboard widgets for other features (bookmarks, etc.)
- Weather data caching or background refresh
- Timezone selection (uses system/browser timezone)

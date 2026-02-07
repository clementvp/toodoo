# Research: Super Todo & Notes Web Application

**Date**: 2026-02-05
**Feature**: Super Todo & Notes Web Application
**Branch**: `001-todo-notes-app`

## Overview

This document captures technical research and decisions made during Phase 0 of the implementation planning workflow. All "NEEDS CLARIFICATION" items from the Technical Context have been resolved through this research.

---

## 1. Testing Strategy Resolution

### Decision

Implement a multi-layered testing pyramid with:

- **Backend**: Japa test runner (AdonisJS v6 official framework)
  - Unit tests (70%): Business logic, models, validators
  - Functional tests (25%): HTTP endpoints and Inertia responses using Japa API Client
  - Browser tests (5%): Critical user flows using Japa + Playwright
- **Frontend**: Vitest + React Testing Library for React component unit tests
- **Data Isolation**: Global transaction pattern per test (`testUtils.db().withGlobalTransaction()`)
- **Test Database**: SQLite in-memory for unit/functional tests, PostgreSQL for browser tests

### Rationale

1. **Official Framework**: Japa is the official AdonisJS v6 test runner with first-class integration
2. **Data Isolation Critical**: FR-003 requires 100% data isolation - comprehensive testing at all levels is essential
3. **Performance Requirements**: Specific goals (calendar <1s, modal <1s) best validated through functional and browser tests
4. **Hybrid Architecture**: Inertia.js requires both server-side (controllers) and client-side (React) testing strategies
5. **Fast Feedback**: 70/25/5 pyramid split balances speed with comprehensive coverage

### Alternatives Considered

- **HTTP Tests Only**: Rejected - misses unit-level validation and real browser interaction testing
- **Full E2E with Playwright Only**: Rejected - slow execution, fragile, expensive maintenance
- **Jest for Everything**: Rejected - Japa is official framework with built-in AdonisJS utilities
- **No Frontend Component Tests**: Rejected - React components contain non-trivial UI logic requiring isolation testing

### Implementation Details

**Test Organization**:

```
tests/
├── unit/              # Business logic, models, validators (70%)
├── functional/        # HTTP endpoints, Inertia responses (25%)
└── browser/           # Critical user flows (5%)

inertia/components/__tests__/  # React component tests (Vitest)
```

**Database Strategy**:

- Use `testUtils.db().withGlobalTransaction()` for test isolation (fast, automatic rollback)
- Fallback to `testUtils.db().truncate()` if nested transactions are needed
- SQLite in-memory for speed in unit/functional tests
- PostgreSQL for browser tests to match production

**Key Testing Patterns**:

- Authentication + data isolation tests for User Story 1
- Calendar interaction + CRUD tests for User Stories 2 & 3
- Mock Inertia.js routing in React component tests
- Performance timing assertions for SC-006 (<1s) and SC-007 (<1s)

---

## 2. AdonisJS v6 Best Practices

### Framework Structure

**Decision**: Use standard AdonisJS v6 monolithic structure with Inertia.js integration

**Rationale**:

- AdonisJS v6 is a fullstack framework designed for monolithic applications
- Inertia.js bridges server-side and client-side with minimal configuration
- Monolithic structure appropriate for small-to-medium web applications
- Reduces deployment complexity compared to separate backend/frontend repos

**Directory Conventions**:

- `app/` - Backend logic (controllers, models, middleware, validators)
- `inertia/` - React frontend components and pages
- `database/` - Migrations and seeders
- `config/` - Application configuration
- `start/` - Bootstrapping and routes

### Authentication Pattern

**Decision**: Use AdonisJS native session-based authentication with Lucid Auth Guard

**Rationale**:

- Built-in session management handles FR-002 (user login with session management)
- Session cookies provide secure, stateless authentication
- Standard ~30 minute timeout aligns with spec assumptions
- Auth middleware protects routes requiring authentication
- Supports optional Opaque Token upgrade if API access needed later

**Implementation**:

```typescript
// app/middleware/auth.ts
// Middleware checks for authenticated session
// Redirects to login if not authenticated

// app/controllers/auth_controller.ts
// register() - Creates user with hashed password
// login() - Validates credentials, creates session
// logout() - Destroys session
```

### Data Isolation Enforcement

**Decision**: Implement data isolation through Lucid ORM query scopes and middleware

**Rationale**:

- FR-003 requires strict user data isolation (highest priority security requirement)
- SC-003 mandates 100% isolation - zero instances of cross-user access
- Every database query must include `where('user_id', auth.user.id)`
- Model scopes enforce isolation automatically at ORM level

**Implementation Strategy**:

```typescript
// app/models/todo.ts
export default class Todo extends BaseModel {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Query scope for automatic user filtering
  static scopeForUser(query: ModelQueryBuilder, userId: number) {
    query.where('user_id', userId)
  }
}

// app/controllers/todos_controller.ts
async index({ auth, inertia }: HttpContext) {
  const todos = await Todo.query()
    .forUser(auth.user!.id)  // Always filter by authenticated user
    .orderBy('due_date', 'asc')

  return inertia.render('todos/index', { todos })
}
```

**Additional Safeguards**:

- Middleware validates auth.user exists on all protected routes
- Validators check todo/note ownership before update/delete operations
- Database foreign keys enforce referential integrity
- Comprehensive functional tests verify isolation (see Testing Strategy)

---

## 3. Calendar Implementation with Ant Design

### Component Selection

**Decision**: Use Ant Design Calendar component (`<Calendar>`) with custom cell rendering

**Rationale**:

- antd v6.2.2 provides mature, accessible Calendar component
- Built-in month view with customizable cell rendering
- Handles month navigation automatically (addresses edge case: "What happens when user navigates between months")
- Responsive design support for mobile browsers
- Integrates with Day.js for date manipulation

**Customization Requirements**:

```typescript
// inertia/components/calendar/calendar_view.tsx
<Calendar
  mode="month"
  fullscreen={true}
  headerRender={({ value, onChange }) => (
    // Custom header hiding mode selector (Year/Month only)
    <CustomMonthYearSelector value={value} onChange={onChange} />
  )}
  dateCellRender={(date) => (
    // Render condensed todo/note titles as badges
    <TodoBadgeList date={date} todos={todosForDate(date)} />
  )}
  onSelect={(date) => {
    // Update right panel on day click
    setSelectedDate(date)
  }}
/>
```

### Layout Implementation

**Decision**: CSS Flexbox for 80/20 split with responsive breakpoints

**Rationale**:

- Flexbox provides flexible, maintainable layout
- CSS media queries handle responsive requirement: "cards pass under calendar on small screens"
- No scroll horizontal with `overflow-x: hidden` on body

**CSS Structure**:

```css
/* Desktop: 80/20 horizontal split */
.calendar-layout {
  display: flex;
  gap: 1rem;
}

.calendar-section {
  flex: 0 0 80%;
}

.side-panel {
  flex: 0 0 20%;
  min-width: 300px;
}

/* Mobile: Stack vertically */
@media (max-width: 768px) {
  .calendar-layout {
    flex-direction: column;
  }

  .calendar-section,
  .side-panel {
    flex: 1 1 100%;
  }
}
```

---

## 4. Date Handling Strategy

### Library Decision

**Decision**: Use Day.js for all date manipulation

**Rationale**:

- Explicitly specified in technical requirements
- Lightweight alternative to Moment.js (2KB vs 67KB)
- Immutable API prevents date mutation bugs
- Plugin system for timezone support
- Compatible with Ant Design Calendar (antd uses Day.js internally)

### Timezone Handling

**Decision**: Store dates in UTC database, display in user's browser timezone

**Rationale**:

- Spec assumption: "Date/time handling uses user's browser timezone"
- PostgreSQL `timestamptz` type stores UTC, converts on retrieval
- Day.js automatically uses browser timezone for display
- Avoids DST and timezone conversion bugs

**Implementation**:

```typescript
// Backend: Store in UTC
const todo = await Todo.create({
  user_id: auth.user.id,
  title: request.input('title'),
  due_date: dayjs(request.input('date')).utc().toDate(),
  due_time: request.input('time'), // Store as time string (HH:mm)
})

// Frontend: Display in browser timezone
const displayDate = dayjs(todo.due_date).local().format('YYYY-MM-DD')
const displayTime = todo.due_time // Already in HH:mm format
```

### Calendar Week Start

**Decision**: Monday week start (European convention) with optional configuration

**Rationale**:

- Spec assumption: "Calendar starts weeks on Monday (European convention)"
- Ant Design Calendar supports `locale` prop for week start configuration
- Can be made configurable later without code changes

```typescript
import frFR from 'antd/locale/fr_FR'

<Calendar locale={frFR} />  // Monday week start
```

---

## 5. State Management Strategy

### Decision

Use React local state with Inertia.js shared data (no additional state library)

### Rationale

**Simplicity Principle**: Aligns with Constitution Principle I (YAGNI)

- No Redux, MobX, or Zustand needed for this application
- Inertia.js handles server-client state synchronization automatically
- Component state sufficient for UI interactions (selected day, modal visibility)
- Shared data passed via Inertia props

**State Distribution**:

- **Server State** (database): Users, todos, notes - managed by AdonisJS controllers
- **Shared State** (Inertia props): Todos/notes for current month, user info
- **Local State** (React): Selected calendar day, modal open/closed, form inputs

**Implementation**:

```typescript
// inertia/pages/todos/index.tsx
interface TodosPageProps {
  todos: Todo[]  // Server-provided via Inertia
  user: User
}

export default function TodosPage({ todos, user }: TodosPageProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [modalVisible, setModalVisible] = useState(false)

  const todosForSelectedDay = todos.filter(
    todo => dayjs(todo.due_date).isSame(selectedDate, 'day')
  )

  return (
    <CalendarLayout
      todos={todos}
      selectedDate={selectedDate}
      onDaySelect={setSelectedDate}
      todosForDay={todosForSelectedDay}
    />
  )
}
```

**CRUD Operations**: Use Inertia.js router for server communication

```typescript
import { router } from '@inertiajs/react'

const handleCreateTodo = (formData: TodoFormData) => {
  router.post('/todos', formData, {
    onSuccess: () => {
      // Inertia automatically reloads page with fresh data
      // No manual state update needed
    },
  })
}
```

### Alternatives Considered

- **Redux**: Rejected - overkill for application of this size, violates simplicity principle
- **React Context**: Rejected - Inertia props provide sufficient shared state
- **TanStack Query**: Rejected - Inertia handles server state synchronization

---

## 6. UI/UX Design System

### Color Palette

**Decision**: "Modern Productivity" color scheme as specified

**Colors**:

- **Primary (Action/Focus)**: `#4F46E5` (Indigo) - Buttons, selected day
- **Background**: `#F8FAFC` (Light blue-grey) - Page background
- **Cards & Calendar**: `#FFFFFF` (White) - With soft shadows
- **Text**: `#1E293B` (Dark slate) - Primary text
- **Accent - Todos**: `#10B981` (Emerald green)
- **Accent - Notes**: `#F59E0B` (Amber)

**Rationale**:

- Explicitly specified in requirements
- Soft colors reduce visual fatigue
- Distinct accents differentiate todos vs notes
- Meets WCAG AA contrast standards for accessibility

### Ant Design Theming

**Implementation**: Configure Ant Design theme via ConfigProvider

```typescript
// inertia/app.tsx
import { ConfigProvider } from 'antd'

const theme = {
  token: {
    colorPrimary: '#4F46E5',
    colorBgContainer: '#FFFFFF',
    colorText: '#1E293B',
    borderRadius: 8,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  }
}

<ConfigProvider theme={theme}>
  <App />
</ConfigProvider>
```

### Responsive Design

**Decision**: Mobile-first CSS with flexbox breakpoints

**Breakpoints**:

- Desktop (>768px): 80/20 horizontal split
- Mobile (≤768px): Vertical stack, calendar above cards

**Constraint**: `overflow-x: hidden` on body prevents horizontal scroll

---

## 7. Docker Compose Configuration

### Database Setup

**Decision**: PostgreSQL 15 via Docker Compose with persistent volume

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: todo_notes
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**Rationale**:

- Specified in requirements
- Alpine image reduces container size
- Health check ensures database ready before app starts
- Persistent volume preserves data across container restarts
- Port 5432 exposed for development database tools

**Environment Configuration** (`.env`):

```env
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=todo_notes
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## 8. Performance Optimization

### Strategy

**Decision**: Server-side filtering with limited client-side caching

**Rationale**:

- Success criteria require <1s updates (SC-006, SC-007)
- Initial load fetches current month's todos/notes only
- Month navigation triggers new server request
- Client-side filtering for selected day from month data
- No pagination needed (SC-009: <100 items per day assumption)

**Optimization Techniques**:

1. **Database Indexes**:

   ```sql
   CREATE INDEX idx_todos_user_date ON todos(user_id, due_date);
   CREATE INDEX idx_notes_user_date ON notes(user_id, created_at);
   ```

2. **Query Optimization**:
   - Load only current month's data
   - Eager load relationships (`await Todo.query().preload('user')`)
   - Use database-level filtering over JavaScript filtering

3. **Inertia Partial Reloads**:

   ```typescript
   router.reload({ only: ['todos'] }) // Refresh only todos prop
   ```

4. **Optimistic UI Updates**:
   - Update UI immediately on status change
   - Revert on server error

   ```typescript
   const handleStatusChange = (todoId: number) => {
     // Optimistic update
     setTodos((prev) =>
       prev.map((todo) => (todo.id === todoId ? { ...todo, status: 'Terminé' } : todo))
     )

     // Server sync
     router.patch(
       `/todos/${todoId}`,
       { status: 'Terminé' },
       {
         preserveScroll: true,
         onError: () => {
           // Revert on error
           router.reload({ only: ['todos'] })
         },
       }
     )
   }
   ```

---

## 9. Security Considerations

### Implementation

**Password Security**:

- Use AdonisJS Hash service with bcrypt (minimum 10 rounds)
- Enforce minimum password length (8 characters)
- Store only hashed passwords in database

**Session Security**:

- HTTP-only session cookies (prevent XSS)
- Secure flag in production (HTTPS only)
- CSRF protection via AdonisJS middleware

**Input Validation**:

- Validate all user inputs at controller level using VineJS validators
- Sanitize HTML in note content (prevent XSS)
- Enforce title length limits (address edge case: "extremely long title")

**SQL Injection Protection**:

- Lucid ORM parameterizes queries automatically
- Never use raw SQL with user input

**Authorization**:

- Middleware checks authentication on all protected routes
- Controllers verify resource ownership before update/delete

```typescript
// Verify todo belongs to authenticated user
const todo = await Todo.query().where('id', todoId).where('user_id', auth.user.id).firstOrFail() // Throws 404 if not found or not owned
```

---

## 10. Migration Strategy

### Database Schema

**Migrations** (in order):

1. `create_users_table` - Users table with email, password
2. `create_todos_table` - Todos with user_id foreign key, due_date, due_time, status
3. `create_notes_table` - Notes with user_id foreign key, title, content, created_at

**Lucid Migration Commands**:

```bash
node ace make:migration users
node ace make:migration todos
node ace make:migration notes

node ace migration:run       # Apply migrations
node ace migration:rollback  # Rollback last batch
```

**Foreign Key Constraints**:

```typescript
// database/migrations/xxx_create_todos_table.ts
table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE') // Delete user's todos when user deleted
```

---

## Summary

All technical unknowns have been resolved:

| Original Question       | Resolution                                                                      |
| ----------------------- | ------------------------------------------------------------------------------- |
| Testing strategy        | Multi-layered pyramid: Japa (backend) + Vitest (frontend), 70/25/5 split        |
| AdonisJS best practices | Monolithic structure, session auth, query scopes for data isolation             |
| Calendar implementation | Ant Design Calendar with custom cell rendering, Day.js integration              |
| Date handling           | Day.js for all operations, UTC storage with browser timezone display            |
| State management        | React local state + Inertia shared props (no Redux)                             |
| UI/UX design            | "Modern Productivity" palette, Ant Design theming, responsive flexbox           |
| Docker setup            | PostgreSQL 15 Alpine with health checks and persistent volumes                  |
| Performance             | Database indexes, limited client caching, optimistic UI updates                 |
| Security                | bcrypt passwords, HTTP-only cookies, CSRF protection, resource ownership checks |
| Migrations              | Lucid migrations with foreign key CASCADE constraints                           |

**No remaining NEEDS CLARIFICATION items** - Ready to proceed to Phase 1 (Design & Contracts).

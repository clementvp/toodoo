# Research & Technical Decisions: Dashboard Home Screen

**Feature**: 003-dashboard
**Date**: 2026-02-08
**Status**: Complete

## Decision Summary

This document captures technical research and decisions made during Phase 0 planning for the dashboard feature.

## 1. Real-Time Clock Implementation

### Decision: Client-Side JavaScript Interval

**Approach**: Use React state with `setInterval` to update time display every minute.

**Rationale**:

- No server polling needed (reduces load)
- Accurate to the minute (HH:MM format requirement)
- Works offline after initial page load
- Standard React pattern

**Implementation**:

```typescript
// In dashboard component
const [currentTime, setCurrentTime] = useState(new Date())

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date())
  }, 60000) // Update every minute

  return () => clearInterval(timer)
}, [])

// Display
{
  currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
```

**Edge Cases Handling**:

- Component unmount: Cleanup interval to prevent memory leaks
- Initial render: Show current time immediately (no delay)
- Timezone: Uses browser's local timezone automatically

**Alternatives Considered**:

- Server-sent events for time updates - Rejected: Unnecessary complexity and server load
- Update every second - Rejected: Overkill for HH:MM display, wastes resources
- No auto-update (static time) - Rejected: Violates "temps réel" requirement

---

## 2. Date Filtering Strategy

### Decision: Server-Side Date Filtering Using SQL DATE Functions

**Approach**: Filter todos by `due_date = today` and notes by `DATE(created_at) = today` in SQL queries.

**Rationale**:

- Accurate filtering at database level
- Uses existing indexed columns
- Handles timezone consistently (server timezone)
- Efficient query performance

**Implementation**:

```typescript
// Todos: Direct date comparison (due_date is DATE column)
const todosToday = await Todo.query()
  .where('user_id', auth.user.id)
  .where('due_date', DateTime.now().toSQLDate()) // '2026-02-08'
  .orderBy('created_at', 'asc')

// Notes: Extract date from timestamp
const notesToday = await Note.query()
  .where('user_id', auth.user.id)
  .whereRaw('DATE(created_at) = ?', [DateTime.now().toSQLDate()])
  .orderBy('created_at', 'desc')
```

**Timezone Considerations**:

- Server generates "today" using server timezone
- Consistent across all users
- Alternative: Pass client timezone and adjust (more complex, not needed for MVP)

**Alternatives Considered**:

- Client-side filtering - Rejected: Less efficient, loads unnecessary data
- Store timezone per user - Rejected: Over-engineering for current scope
- UTC-based filtering - Rejected: Complicates user experience (they expect local dates)

---

## 3. Weather API Integration

### Decision: OpenWeatherMap Current Weather API (Free Tier)

**API Endpoint**: `https://api.openweathermap.org/data/2.5/weather`

**Rationale**:

- User already has API key
- Free tier: 60 calls/minute, 1M calls/month (sufficient)
- Supports metric units (°C)
- French language support
- Comprehensive weather data (temp, description, humidity, wind)

**Implementation**:

```typescript
// app/services/weather_service.ts
export async function fetchWeatherData(city: string): Promise<WeatherData | null> {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: env.get('OPENWEATHERMAP_API_KEY'),
        units: 'metric', // Celsius
        lang: 'fr', // French descriptions
      },
      timeout: 5000,
    })

    return {
      city: response.data.name,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      tempMin: Math.round(response.data.main.temp_min),
      tempMax: Math.round(response.data.main.temp_max),
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed * 3.6), // m/s to km/h
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return null // Graceful degradation
  }
}
```

**Error Handling**:

- API timeout: Return `null`, display error state in UI
- Invalid city: Return `null`, prompt user to update settings
- Rate limit exceeded: Return `null`, show cached data or error message
- Network failure: Return `null`, graceful error card

**Alternatives Considered**:

- Weather.gov API - Rejected: US-only coverage
- WeatherAPI.com - Rejected: User already has OpenWeatherMap key
- Build weather caching layer - Deferred to future enhancement

**Weather Icon Display**:

- OpenWeatherMap provides icon codes (e.g., "01d", "10n")
- Use icon URL: `https://openweathermap.org/img/wn/{icon}@2x.png`
- Alternative: Map icon codes to custom icons (future enhancement)

---

## 4. User Settings Storage

### Decision: Dedicated `user_settings` Table (One-to-One with User)

**Table Schema**:

```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weather_city VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Rationale**:

- **Scalability**: Easy to add new settings fields in future (theme, language, etc.)
- **Performance**: One-to-one relationship ensures O(1) lookup
- **Separation of Concerns**: User table remains focused on authentication
- **Nullable Fields**: Allows gradual adoption (users configure as needed)

**Alternatives Considered**:

- Store in User table - Rejected: Pollutes user model, harder to extend
- JSON column in User table - Rejected: Less type-safe, harder to query
- Separate table per setting - Rejected: Over-engineered for current needs
- Environment variables - Rejected: Not user-specific

---

## 5. Dashboard Layout & Responsiveness

### Decision: Ant Design Grid with Card Components

**Layout Pattern**:

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} md={12} lg={6}>
    <DateTimeCard />
  </Col>
  <Col xs={24} md={12} lg={6}>
    <WeatherCard />
  </Col>
  <Col xs={24} md={12} lg={6}>
    <TodosCard />
  </Col>
  <Col xs={24} md={12} lg={6}>
    <NotesCard />
  </Col>
</Row>
```

**Rationale**:

- Ant Design Grid is already used in project
- Responsive breakpoints: mobile (xs), tablet (md), desktop (lg)
- Consistent card styling across dashboard
- Easy to add/remove cards in future

**Responsive Behavior**:

- **Mobile (xs)**: Stack all cards vertically (24/24 columns)
- **Tablet (md)**: Two cards per row (12/24 columns each)
- **Desktop (lg)**: Four cards per row (6/24 columns each)

**Alternatives Considered**:

- CSS Grid - Rejected: Ant Design Grid provides better consistency with existing UI
- Flexbox - Rejected: Grid is more suitable for dashboard layout
- Fixed layout - Rejected: Must support mobile users

---

## 6. Todo Status Update Strategy

### Decision: Inline Checkbox Update with Optimistic UI

**Approach**: Update status immediately in UI, persist to backend asynchronously.

**Rationale**:

- Instant feedback for users
- Follows existing pattern from todos page
- Graceful error handling if backend fails

**Implementation**:

```tsx
// Frontend
const handleStatusToggle = async (todoId: number, currentStatus: string) => {
  const newStatus = currentStatus === 'À faire' ? 'Terminé' : 'À faire'

  // Optimistic UI update
  setTodos(todos.map((t) => (t.id === todoId ? { ...t, status: newStatus } : t)))

  try {
    await router.patch(`/todos/${todoId}`, { status: newStatus })
  } catch (error) {
    // Revert on failure
    setTodos(todos.map((t) => (t.id === todoId ? { ...t, status: currentStatus } : t)))
    message.error('Échec de la mise à jour')
  }
}
```

**Backend Endpoint**:

- Reuse existing todos update endpoint (PATCH `/todos/:id`)
- Validate user ownership before update
- Return updated todo

**Alternatives Considered**:

- Wait for backend before UI update - Rejected: Slower user experience
- WebSocket real-time sync - Rejected: Over-engineering for MVP
- Batch updates - Rejected: Not needed for single status changes

---

## 7. Todo Deletion Strategy

### Decision: Confirmation Dialog + DELETE Request

**Approach**: Show Ant Design modal confirmation before deleting.

**Rationale**:

- Prevents accidental deletions
- Consistent with common UX patterns
- Gives users chance to cancel

**Implementation**:

```tsx
// Frontend
const handleDelete = (todo: Todo) => {
  Modal.confirm({
    title: 'Supprimer ce todo ?',
    content: `Êtes-vous sûr de vouloir supprimer "${todo.title}" ?`,
    okText: 'Supprimer',
    okType: 'danger',
    cancelText: 'Annuler',
    onOk: async () => {
      await router.delete(`/todos/${todo.id}`)
    },
  })
}
```

**Backend**:

- Reuse existing DELETE `/todos/:id` endpoint
- Verify user ownership
- Cascade delete handled by database

**Alternatives Considered**:

- No confirmation - Rejected: Too risky for users
- Undo/trash feature - Deferred to future enhancement
- Soft delete - Deferred: Not in current scope

---

## 8. Notes Display Strategy

### Decision: Read-Only List with Click-to-View

**Approach**: Display note titles in card, click to view full content in modal or expand.

**Rationale**:

- Quick overview of today's notes
- No editing clutter on dashboard
- Keeps dashboard focused on viewing/quick actions

**Implementation Options**:

**Option A: Modal** (Recommended)

```tsx
const handleViewNote = (note: Note) => {
  Modal.info({
    title: note.title,
    content: note.content,
    width: 600,
  })
}
```

**Option B: Expandable List Items**

```tsx
<List.Item onClick={() => setExpandedNote(note.id === expandedNote ? null : note.id)}>
  {note.title}
  {expandedNote === note.id && <div>{note.content}</div>}
</List.Item>
```

**Recommendation**: Use Modal for better focus and readability.

**Alternatives Considered**:

- Navigate to notes page - Rejected: Disrupts dashboard experience
- Inline editing - Rejected: Out of scope (viewing only)
- Preview truncated content - Considered: Good future enhancement

---

## 9. Settings Page Access

### Decision: Dual Access (Menu + Weather Card Icon)

**Access Points**:

1. **Main Navigation Menu**: Add "Paramètres" link
2. **Weather Card**: Small settings icon in card header

**Rationale**:

- Menu: Discoverable, consistent with app navigation patterns
- Card icon: Contextual, quick access when weather needs updating
- Dual access increases usability

**Implementation**:

```tsx
// Navigation menu (update existing layout)
<Menu.Item key="settings" icon={<SettingOutlined />}>
  <Link href="/settings">Paramètres</Link>
</Menu.Item>

// Weather card header
<Card
  title="Météo"
  extra={
    <Link href="/settings">
      <SettingOutlined style={{ fontSize: 16 }} />
    </Link>
  }
>
  {/* Weather content */}
</Card>
```

**Alternatives Considered**:

- Settings icon only - Rejected: Less discoverable
- Menu only - Rejected: Less convenient when on dashboard
- Inline editing in card - Rejected: Clutters dashboard UI

---

## 10. Empty States Handling

### Decision: Friendly Empty State Messages with Actions

**Approach**: Show helpful messages when no data exists for today.

**Rationale**:

- Better UX than blank cards
- Guides users to take action
- Maintains visual consistency

**Implementation Examples**:

```tsx
// No todos today
<Empty
  description="Aucun todo pour aujourd'hui"
  image={Empty.PRESENTED_IMAGE_SIMPLE}
>
  <Button type="link" href="/todos">
    Créer un todo
  </Button>
</Empty>

// No notes today
<Empty
  description="Aucune note créée aujourd'hui"
  image={Empty.PRESENTED_IMAGE_SIMPLE}
>
  <Button type="link" href="/notes">
    Créer une note
  </Button>
</Empty>

// No weather city configured
<Empty
  description="Configurez votre ville pour voir la météo"
  image={Empty.PRESENTED_IMAGE_SIMPLE}
>
  <Button type="link" href="/settings">
    Configurer
  </Button>
</Empty>
```

**Alternatives Considered**:

- Hide cards when empty - Rejected: Inconsistent layout, confusing
- Show generic "No data" - Rejected: Less helpful
- Pre-populate with sample data - Rejected: Not appropriate for personal app

---

## 11. Performance Optimization

### Decision: Parallel Data Fetching with Promise.all

**Approach**: Fetch todos, notes, and settings concurrently.

**Rationale**:

- Reduces total page load time
- Independent queries can run in parallel
- Simple to implement with Promise.all

**Implementation**:

```typescript
// Dashboard controller
const today = DateTime.now().toSQLDate()

const [todosToday, notesToday, userSettings] = await Promise.all([
  Todo.query().where('user_id', auth.user.id).where('due_date', today).orderBy('created_at', 'asc'),

  Note.query()
    .where('user_id', auth.user.id)
    .whereRaw('DATE(created_at) = ?', [today])
    .orderBy('created_at', 'desc'),

  UserSetting.firstOrCreate({ userId: auth.user.id }, { userId: auth.user.id, weatherCity: null }),
])

// Fetch weather after settings (depends on city)
let weather = null
if (userSettings.weatherCity) {
  weather = await fetchWeatherData(userSettings.weatherCity)
}
```

**Performance Metrics**:

- DB queries: ~100-200ms (3 parallel queries)
- Weather API: ~500-2000ms (external call)
- Total estimated load time: < 2 seconds

**Future Optimizations** (Out of Scope):

- Cache weather data in Redis (15-30 min TTL)
- Add loading skeletons for weather card
- Implement stale-while-revalidate pattern

---

## References

- OpenWeatherMap API Docs: https://openweathermap.org/current
- Ant Design Grid: https://ant.design/components/grid
- Ant Design Empty: https://ant.design/components/empty
- Ant Design Card: https://ant.design/components/card
- React useEffect cleanup: https://react.dev/reference/react/useEffect#cleanup
- Luxon DateTime: https://moment.github.io/luxon/
- Existing Todos implementation: `/Users/clement/projects/perso/TooDoo/app/models/todo.ts`
- Existing Notes implementation: `/Users/clement/projects/perso/TooDoo/app/models/note.ts`

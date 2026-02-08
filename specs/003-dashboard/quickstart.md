# Quickstart Guide: Dashboard Home Screen

**Feature**: 003-dashboard
**Date**: 2026-02-08
**Audience**: Developers implementing or testing the dashboard feature

---

## Prerequisites

- Node.js 20.6+ installed
- PostgreSQL running and configured
- Project dependencies installed (`npm install`)
- Database configured in `.env` file
- **OpenWeatherMap API key** (get free key at https://openweathermap.org/api)

---

## Setup

### 1. Configure OpenWeatherMap API Key

Add your API key to `.env` file:

```bash
# .env
OPENWEATHERMAP_API_KEY=your_api_key_here
```

Get a free API key:

1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to API keys section
4. Copy your API key

Verify environment configuration in `start/env.ts`:

```typescript
OPENWEATHERMAP_API_KEY: Env.schema.string()
```

### 2. Run Database Migration

Create the `user_settings` table:

```bash
node ace migration:run
```

Expected output:

```
✔ Executed 1 migration in 45ms
  ❯ database/migrations/[timestamp]_create_user_settings_table
```

### 3. Verify Migration

Check that the table was created:

```bash
node ace db:query "SELECT table_name FROM information_schema.tables WHERE table_name = 'user_settings'"
```

Or use your PostgreSQL client:

```sql
\dt user_settings
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3333` with hot module reloading.

### Access Dashboard Feature

1. Navigate to `http://localhost:3333/login`
2. Log in with your user credentials
3. Dashboard loads automatically at `http://localhost:3333/` (root route)

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Dashboard-Specific Tests

**Functional tests (dashboard endpoints):**

```bash
node ace test tests/functional/dashboard.spec.ts
```

**Functional tests (settings):**

```bash
node ace test tests/functional/settings.spec.ts
```

**Unit tests (weather service):**

```bash
node ace test tests/unit/weather_service.spec.ts
```

**Unit tests (validator):**

```bash
node ace test tests/unit/user_setting_validator.spec.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

---

## Usage Examples

### 1. View Dashboard

**Via Browser:**

1. Navigate to `http://localhost:3333/` (must be logged in)
2. See 4 cards: Date/Time, Weather, Todos, Notes
3. Time updates automatically every minute

**Expected Dashboard Cards:**

- **Date/Time**: "Samedi 8 février 2026 - 14:30"
- **Weather**: Temperature, description, icon, details (if city configured)
- **Todos Today**: List of todos due today with checkboxes and delete buttons
- **Notes Today**: List of notes created today with click-to-view

### 2. Configure Weather City

**Via Navigation Menu:**

1. Click "Paramètres" in main navigation menu
2. Enter city name (e.g., "Paris", "London", "Tokyo")
3. Click "Enregistrer"
4. Return to dashboard to see weather

**Via Weather Card:**

1. On dashboard, click settings icon in weather card header
2. Enter city name
3. Save and return to dashboard

**Via curl:**

```bash
curl -X PATCH http://localhost:3333/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: adonis-session=YOUR_SESSION_COOKIE" \
  -d '{"weatherCity": "Paris"}'
```

### 3. Manage Todos from Dashboard

**Toggle Todo Status:**

1. On dashboard, locate "Todos Today" card
2. Click checkbox next to a todo
3. Status toggles between "À faire" and "Terminé"
4. Change persists immediately

**Delete Todo:**

1. Click "Supprimer" button next to a todo
2. Confirm deletion in modal dialog
3. Todo is removed from dashboard and database

**Via curl (update status):**

```bash
curl -X PATCH http://localhost:3333/todos/42 \
  -H "Content-Type: application/json" \
  -H "Cookie: adonis-session=YOUR_SESSION_COOKIE" \
  -d '{"status": "Terminé"}'
```

### 4. View Today's Notes

**Via Dashboard:**

1. On dashboard, locate "Notes Today" card
2. See list of notes created today (titles only)
3. Click on a note title to view full content in modal
4. Modal displays note title and content

**Empty State:**

- If no notes created today, card shows "Aucune note créée aujourd'hui"
- Link to `/notes` page to create new note

---

## Code Structure

### Backend Files

```
app/
├── models/
│   ├── user_setting.ts                # UserSettings model (NEW)
│   ├── todo.ts                         # Todo model (existing)
│   └── note.ts                         # Note model (existing)
├── controllers/
│   ├── dashboard_controller.ts         # Dashboard endpoint (NEW)
│   └── settings_controller.ts          # Settings CRUD (NEW)
├── validators/
│   └── user_setting_validator.ts       # VineJS validation (NEW)
└── services/
    └── weather_service.ts               # OpenWeatherMap integration (NEW)

database/
└── migrations/
    └── [timestamp]_create_user_settings_table.ts  (NEW)

start/
└── routes.ts                            # Route definitions (updated)
```

### Frontend Files

```
inertia/
├── pages/
│   ├── dashboard/
│   │   └── index.tsx                    # Main dashboard page (NEW)
│   └── settings/
│       └── index.tsx                    # Settings page (NEW)
├── components/
│   └── cards/
│       ├── datetime_card.tsx            # Date/time display (NEW)
│       ├── weather_card.tsx             # Weather display (NEW)
│       ├── todos_card.tsx               # Today's todos (NEW)
│       └── notes_card.tsx               # Today's notes (NEW)
└── lib/
    └── types.ts                         # TypeScript interfaces (updated)
```

### Test Files

```
tests/
├── functional/
│   ├── dashboard.spec.ts                # Dashboard endpoint tests (NEW)
│   ├── settings.spec.ts                 # Settings tests (NEW)
│   └── dashboard_todo_actions.spec.ts   # Todo actions tests (NEW)
└── unit/
    ├── weather_service.spec.ts          # Weather service tests (NEW)
    └── user_setting_validator.spec.ts   # Validator tests (NEW)
```

---

## API Endpoints

| Method | Endpoint     | Purpose                     | Auth Required |
| ------ | ------------ | --------------------------- | ------------- |
| GET    | `/`          | Render dashboard            | Yes           |
| GET    | `/settings`  | Render settings page        | Yes           |
| PATCH  | `/settings`  | Update user settings (city) | Yes           |
| PATCH  | `/todos/:id` | Update todo (status, etc.)  | Yes           |
| DELETE | `/todos/:id` | Delete todo                 | Yes           |

All endpoints require authentication (handled by `auth` middleware).

---

## Database Schema

### Table: `user_settings`

```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weather_city VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_settings_user ON user_settings(user_id);
```

### Relationships

- **UserSettings ↔ User**: One-to-one (each user has one settings record)
- **Dashboard queries existing Todo and Note tables** (many-to-one with User)

---

## Common Tasks

### Reset User Settings

```bash
node ace tinker
```

Then in the REPL:

```javascript
const { default: UserSetting } = await import('#models/user_setting')
await UserSetting.query().where('user_id', 1).delete()
```

### Create Sample Settings

```bash
node ace tinker
```

Then:

```javascript
const { default: UserSetting } = await import('#models/user_setting')
await UserSetting.create({
  userId: 1,
  weatherCity: 'Paris',
})
```

### Test Weather API Directly

```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=YOUR_API_KEY&units=metric&lang=fr"
```

### Check Migration Status

```bash
node ace migration:status
```

### Rollback Migration

```bash
node ace migration:rollback
```

---

## Troubleshooting

### Migration Fails

**Error**: `relation "user_settings" already exists`

**Solution**: The table was already created. Either:

- Skip this migration: Already complete
- Drop and recreate: `node ace migration:rollback` then `node ace migration:run`

### Cannot Access Dashboard (Redirected to /login)

**Error**: Redirected to `/login` when accessing `/`

**Cause**: Not authenticated

**Solution**: Log in first at `/login`

### Weather Not Showing

**Error**: Weather card shows "Configurez votre ville"

**Cause**: No city configured in user settings

**Solution**: Access `/settings` and enter a city name

### Weather API Error

**Error**: Weather card shows "Météo indisponible"

**Causes**:

- Invalid or missing API key
- Invalid city name
- API rate limit exceeded
- Network timeout

**Solutions**:

1. Verify API key in `.env` file
2. Check city name spelling
3. Wait if rate limited (60 calls/min limit)
4. Check network connectivity

### Todos/Notes Not Showing

**Error**: Dashboard shows empty state but user has todos/notes

**Cause**: No todos/notes are due/created **today**

**Solution**: Verify data:

```bash
node ace db:query "SELECT * FROM todos WHERE user_id = 1 AND due_date = CURRENT_DATE"
node ace db:query "SELECT * FROM notes WHERE user_id = 1 AND DATE(created_at) = CURRENT_DATE"
```

Create a todo due today or a note created today to see them on dashboard.

### Time Not Updating

**Error**: Time display is static

**Cause**: JavaScript error or interval not set up

**Solution**:

1. Check browser console for errors
2. Verify `useEffect` cleanup in `datetime_card.tsx`
3. Refresh the page

---

## Development Workflow

### Adding Weather API Parameters

1. Update `weather_service.ts` to modify API call parameters
2. Update `WeatherData` interface in `types.ts` if adding new fields
3. Update `weather_card.tsx` to display new data
4. Write tests in `weather_service.spec.ts`

### Adding New User Settings

1. Add column to `user_settings` table (new migration)
2. Update `UserSetting` model
3. Update `user_setting_validator.ts`
4. Update settings form in `settings/index.tsx`
5. Write tests

### Debugging Dashboard Queries

**Enable SQL query logging:**

Edit `config/database.ts`:

```typescript
debug: true // Log all SQL queries
```

**Check server logs:**

```bash
npm run dev  # Watch terminal output
```

**Inspect database:**

```bash
node ace db:query "SELECT * FROM user_settings WHERE user_id = 1"
node ace db:query "SELECT * FROM todos WHERE user_id = 1 AND due_date = CURRENT_DATE"
```

---

## Performance Tips

### Weather API

- Free tier: 60 calls/minute, 1,000,000 calls/month
- Dashboard loads weather on each visit (no caching in MVP)
- **Future**: Implement Redis caching (15-30 min TTL) to reduce API calls

### Dashboard Queries

- Uses `Promise.all` for parallel execution (todos, notes, settings)
- Indexed columns ensure fast filtering (user_id, due_date, created_at)
- Typical load time: < 2 seconds (including weather API)

### Real-Time Clock

- Updates every 60 seconds (sufficient for HH:MM display)
- Client-side interval (no server load)
- Cleaned up on component unmount

---

## Security Notes

- All routes protected by `auth` middleware
- Users can only access their own data (enforced by `user_id` filtering)
- Weather API key stored securely in environment variables (not exposed to frontend)
- CSRF protection enabled by default (AdonisJS Shield)
- SQL injection prevented by Lucid query builder
- XSS prevented by React's automatic escaping

---

## Next Steps

After confirming the feature works:

1. Run `/speckit.tasks` to generate implementation task breakdown
2. Follow task order for implementation
3. Test each user story independently (P1 → P2 → P3)
4. Deploy incrementally after each story is complete

---

## Resources

- **Spec**: `specs/003-dashboard/spec.md`
- **Plan**: `specs/003-dashboard/plan.md`
- **Data Model**: `specs/003-dashboard/data-model.md`
- **Research**: `specs/003-dashboard/research.md`
- **API Contract**: `specs/003-dashboard/contracts/api.md`
- **AdonisJS Docs**: https://docs.adonisjs.com
- **Lucid ORM**: https://lucid.adonisjs.com
- **VineJS**: https://vinejs.dev
- **Inertia.js**: https://inertiajs.com
- **Ant Design**: https://ant.design
- **OpenWeatherMap API**: https://openweathermap.org/api
- **Luxon (DateTime)**: https://moment.github.io/luxon/

---

## Support

For issues or questions:

1. Check existing Todos/Notes/Bookmarks implementation for patterns
2. Review AdonisJS and OpenWeatherMap documentation
3. Check test files for usage examples
4. Consult the spec and plan documents in `specs/003-dashboard/`

---

**Happy coding!** 🚀

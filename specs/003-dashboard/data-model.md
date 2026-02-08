# Data Model: Dashboard Home Screen

**Feature**: 003-dashboard
**Date**: 2026-02-08
**Status**: Complete

## Overview

The dashboard feature introduces one new entity: **UserSettings**. This entity stores user-specific configuration preferences (currently only weather city). The dashboard itself aggregates data from existing entities (Todo, Note) and external APIs (OpenWeatherMap).

---

## Entities

### UserSettings (New)

**Purpose**: Store user-specific application settings and preferences.

**Attributes**:

| Field       | Type         | Constraints                              | Description                   |
| ----------- | ------------ | ---------------------------------------- | ----------------------------- |
| id          | Integer      | PRIMARY KEY, AUTO INCREMENT              | Unique identifier             |
| userId      | Integer      | FOREIGN KEY → users.id, UNIQUE, NOT NULL | Owner (one-to-one with User)  |
| weatherCity | String (100) | NULLABLE                                 | City name for weather display |
| createdAt   | Timestamp    | NOT NULL, AUTO                           | Creation timestamp            |
| updatedAt   | Timestamp    | NOT NULL, AUTO UPDATE                    | Last modification timestamp   |

**Relationships**:

- **belongsTo User**: Each UserSettings belongs to exactly one user (one-to-one)

**Validation Rules**:

- `weatherCity` is optional (nullable)
- `weatherCity` maximum length: 100 characters
- `weatherCity` minimum length: 1 character (if provided)
- `userId` must be unique (one settings record per user)

**Indexes**:

- Primary: `id` (automatic)
- Unique: `user_id` - ensures one-to-one relationship with User

**Query Scopes**:

- `forUser(userId)`: Retrieve settings for a specific user

**Cascade Rules**:

- When a User is deleted → CASCADE DELETE their settings

---

### Todo (Existing - Dashboard Query Pattern)

**Dashboard Query**: Fetch todos where `dueDate` equals current date and `userId` equals authenticated user.

```typescript
// Query pattern for dashboard
const todosToday = await Todo.query()
  .where('user_id', auth.user.id)
  .where('due_date', DateTime.now().toSQLDate())
  .orderBy('created_at', 'asc')
```

**Fields Used**:

- `dueDate` - Filter for today's todos
- `status` - Display and allow updates (À faire ⟷ Terminé)
- `title` - Display in card
- `id` - For delete operations

---

### Note (Existing - Dashboard Query Pattern)

**Dashboard Query**: Fetch notes where `createdAt` date equals current date and `userId` equals authenticated user.

```typescript
// Query pattern for dashboard
const notesToday = await Note.query()
  .where('user_id', auth.user.id)
  .whereRaw('DATE(created_at) = ?', [DateTime.now().toSQLDate()])
  .orderBy('created_at', 'desc')
```

**Fields Used**:

- `createdAt` - Filter for today's notes
- `title` - Display in card
- `content` - Display when viewing note
- `id` - For navigation/viewing

---

## Relationships Diagram

```
┌─────────────────┐
│      User       │
│   (existing)    │
│─────────────────│
│ id (PK)         │
│ email           │
│ password        │
│ ...             │
└─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│  UserSettings   │
│     (NEW)       │
│─────────────────│
│ id (PK)         │
│ userId (FK) ────┼──► User.id (UNIQUE)
│ weatherCity     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│      User       │
└─────────────────┘
         │
         │ 1:*
         ▼
┌─────────────────┐
│      Todo       │
│   (existing)    │
│─────────────────│
│ id              │
│ userId (FK)     │
│ dueDate ◄───────┼── Filtered by current date
│ status ◄────────┼── Updatable from dashboard
│ ...             │
└─────────────────┘

┌─────────────────┐
│      User       │
└─────────────────┘
         │
         │ 1:*
         ▼
┌─────────────────┐
│      Note       │
│   (existing)    │
│─────────────────│
│ id              │
│ userId (FK)     │
│ createdAt ◄─────┼── Filtered by current date
│ ...             │
└─────────────────┘
```

---

## Database Schema (PostgreSQL)

### Table: `user_settings` (NEW)

```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  weather_city VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_user_settings_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_settings_user
  ON user_settings(user_id);
```

**Index Rationale**:

- `idx_user_settings_user`: Unique index on user_id
  - Enforces one-to-one relationship with User
  - Optimizes lookup by user ID
  - Single query to fetch user's settings

**Migration Strategy**:

- Create table with nullable weather_city (allows gradual adoption)
- No default city (users configure on first use)
- Existing users get settings record created on first dashboard visit or settings access

---

## Lucid ORM Model (TypeScript)

**File**: `app/models/user_setting.ts`

```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare weatherCity: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Query scope for automatic user filtering
  static forUser(query: any, userId: number) {
    query.where('user_id', userId)
  }
}
```

---

## VineJS Validation Schema

**File**: `app/validators/user_setting_validator.ts`

```typescript
import vine from '@vinejs/vine'

export const updateUserSettingValidator = vine.compile(
  vine.object({
    weatherCity: vine.string().trim().minLength(1).maxLength(100).optional(),
  })
)
```

**Validation Rules**:

- `weatherCity`: Optional string, 1-100 characters after trimming
- Allow empty/null to support clearing the city setting

---

## Database Queries

### Fetch or Create User Settings

```typescript
// In controller
const settings = await UserSetting.firstOrCreate(
  { userId: auth.user.id },
  { userId: auth.user.id, weatherCity: null }
)
```

### Update Weather City

```typescript
// In controller
const settings = await UserSetting.query().where('user_id', auth.user.id).firstOrFail()

settings.weatherCity = validatedData.weatherCity
await settings.save()
```

### Dashboard Data Aggregation

```typescript
// In dashboard controller
const today = DateTime.now().toSQLDate()

const [todosToday, notesToday, userSettings] = await Promise.all([
  Todo.query().where('user_id', auth.user.id).where('due_date', today).orderBy('created_at', 'asc'),

  Note.query()
    .where('user_id', auth.user.id)
    .whereRaw('DATE(created_at) = ?', [today])
    .orderBy('created_at', 'desc'),

  UserSetting.firstOrCreate({ userId: auth.user.id }, { userId: auth.user.id, weatherCity: null }),
])

// Fetch weather if city configured
let weather = null
if (userSettings.weatherCity) {
  weather = await fetchWeatherData(userSettings.weatherCity)
}

return inertia.render('dashboard/index', {
  todosToday,
  notesToday,
  weather,
  userSettings,
})
```

---

## External Data: OpenWeatherMap API

### Weather Data Structure (Response)

```typescript
interface WeatherData {
  city: string
  temperature: number // Current temp in °C
  description: string // "Partly cloudy", etc.
  icon: string // Icon code (e.g., "01d")
  tempMin: number // Min temp today
  tempMax: number // Max temp today
  humidity: number // Humidity %
  windSpeed: number // Wind speed in m/s
}
```

### API Call Pattern

```typescript
// Service: app/services/weather_service.ts
import axios from 'axios'
import env from '#start/env'

export async function fetchWeatherData(city: string): Promise<WeatherData | null> {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: env.get('OPENWEATHERMAP_API_KEY'),
        units: 'metric',
        lang: 'fr',
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
      windSpeed: Math.round(response.data.wind.speed * 3.6), // Convert m/s to km/h
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}
```

---

## TypeScript Interfaces (Frontend)

**File**: `inertia/lib/types.ts`

```typescript
export interface UserSettings {
  id: number
  userId: number
  weatherCity: string | null
  createdAt: string
  updatedAt: string
}

export interface WeatherData {
  city: string
  temperature: number
  description: string
  icon: string
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number
}

export interface DashboardProps {
  todosToday: Todo[]
  notesToday: Note[]
  weather: WeatherData | null
  userSettings: UserSettings
}
```

---

## Performance Considerations

### Query Optimization

- **Dashboard Load**: Single parallel query execution (Promise.all) for todos, notes, and settings
- **Date Filtering**: Uses indexed columns (due_date for todos, created_at for notes)
- **Settings Lookup**: Unique index on user_id ensures O(1) lookup

### Caching Strategy

- **Weather Data**: No caching initially (fetch on each dashboard load)
- **Future Enhancement**: Cache weather data for 15-30 minutes per city in Redis/memory

### Expected Load

- Dashboard queries: 3 DB queries + 1 external API call
- Estimated response time: < 2 seconds (including weather API)
- Weather API rate limit: 60 calls/min (sufficient for expected traffic)

---

## Migration Plan

### Phase 1: Create UserSettings Table

```typescript
// database/migrations/[timestamp]_create_user_settings_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
        .unique()
      table.string('weather_city', 100).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### Phase 2: Seed Default Settings (Optional)

```typescript
// For existing users, create empty settings on first dashboard access
// No seeder needed - use firstOrCreate pattern in controller
```

---

## Data Access Patterns Summary

| Operation           | Query Pattern                                | Index Used               |
| ------------------- | -------------------------------------------- | ------------------------ |
| Get user settings   | `WHERE user_id = ?`                          | idx_user_settings_user   |
| Get today's todos   | `WHERE user_id = ? AND due_date = ?`         | idx_todos_user_due       |
| Get today's notes   | `WHERE user_id = ? AND DATE(created_at) = ?` | idx_notes_user_created   |
| Update todo status  | `UPDATE WHERE id = ? AND user_id = ?`        | Primary key + user check |
| Delete todo         | `DELETE WHERE id = ? AND user_id = ?`        | Primary key + user check |
| Update weather city | `UPDATE user_settings WHERE user_id = ?`     | idx_user_settings_user   |

---

## References

- AdonisJS Lucid ORM: https://lucid.adonisjs.com/docs/models
- VineJS Validation: https://vinejs.dev/docs/introduction
- OpenWeatherMap Current Weather API: https://openweathermap.org/current
- Existing Todo model: `/Users/clement/projects/perso/TooDoo/app/models/todo.ts`
- Existing Note model: `/Users/clement/projects/perso/TooDoo/app/models/note.ts`
- Existing User model: `/Users/clement/projects/perso/TooDoo/app/models/user.ts`

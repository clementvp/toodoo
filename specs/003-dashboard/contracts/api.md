# API Contracts: Dashboard Home Screen

**Feature**: 003-dashboard
**Date**: 2026-02-08
**Status**: Complete

---

## Overview

This document defines the API contracts for the dashboard and settings endpoints. The dashboard aggregates data from existing models (Todo, Note) and external APIs (OpenWeatherMap), while settings manages user preferences.

---

## Endpoints Summary

| Method | Endpoint    | Purpose                          | Auth Required |
| ------ | ----------- | -------------------------------- | ------------- |
| GET    | `/`         | Render dashboard with daily data | Yes           |
| GET    | `/settings` | Render user settings page        | Yes           |
| PATCH  | `/settings` | Update user settings             | Yes           |

**Note**: Todo manipulation endpoints (`PATCH /todos/:id`, `DELETE /todos/:id`) are existing routes reused by the dashboard.

---

## 1. Dashboard - GET /

**Purpose**: Render the main dashboard page with aggregated daily data.

### Request

**Method**: `GET`

**URL**: `/`

**Headers**:

```
Cookie: adonis-session=<session_id>
```

**Query Parameters**: None

**Authentication**: Required (redirects to `/login` if not authenticated)

---

### Response

**Status Code**: `200 OK`

**Content-Type**: `text/html` (Inertia.js renders React page)

**Inertia Props**:

```typescript
{
  todosToday: Todo[],
  notesToday: Note[],
  weather: WeatherData | null,
  userSettings: UserSettings
}
```

---

### Response Data Structures

#### `Todo` (existing model)

```typescript
interface Todo {
  id: number
  userId: number
  title: string
  description: string | null
  dueDate: string // ISO date: "2026-02-08"
  dueTime: string | null // Time: "14:30:00"
  status: 'À faire' | 'Terminé'
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}
```

**Filter Applied**: Only todos where `dueDate === today` and `userId === authenticated user`

---

#### `Note` (existing model)

```typescript
interface Note {
  id: number
  userId: number
  title: string
  content: string
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}
```

**Filter Applied**: Only notes where `DATE(createdAt) === today` and `userId === authenticated user`

---

#### `WeatherData`

```typescript
interface WeatherData {
  city: string // City name: "Paris"
  temperature: number // Current temp in °C: 18
  description: string // Description: "partly cloudy"
  icon: string // Icon code: "02d"
  tempMin: number // Min temp today: 12
  tempMax: number // Max temp today: 22
  humidity: number // Humidity %: 65
  windSpeed: number // Wind speed in km/h: 15
}
```

**Source**: OpenWeatherMap API (https://api.openweathermap.org/data/2.5/weather)

**Null Handling**: Returns `null` if:

- User has not configured a city (`userSettings.weatherCity` is null)
- Weather API request fails (timeout, invalid city, rate limit)
- Network error

---

#### `UserSettings`

```typescript
interface UserSettings {
  id: number
  userId: number
  weatherCity: string | null // City name or null if not configured
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}
```

**Auto-Creation**: If user has no settings record, one is created automatically with `weatherCity: null`

---

### Example Response (Inertia Props)

```json
{
  "todosToday": [
    {
      "id": 42,
      "userId": 1,
      "title": "Acheter du pain",
      "description": "Boulangerie à 18h",
      "dueDate": "2026-02-08",
      "dueTime": "18:00:00",
      "status": "À faire",
      "createdAt": "2026-02-07T10:30:00.000Z",
      "updatedAt": "2026-02-07T10:30:00.000Z"
    }
  ],
  "notesToday": [
    {
      "id": 15,
      "userId": 1,
      "title": "Idée de projet",
      "content": "Créer une app de dashboard...",
      "createdAt": "2026-02-08T09:15:00.000Z",
      "updatedAt": "2026-02-08T09:15:00.000Z"
    }
  ],
  "weather": {
    "city": "Paris",
    "temperature": 18,
    "description": "partiellement nuageux",
    "icon": "02d",
    "tempMin": 12,
    "tempMax": 22,
    "humidity": 65,
    "windSpeed": 15
  },
  "userSettings": {
    "id": 1,
    "userId": 1,
    "weatherCity": "Paris",
    "createdAt": "2026-02-08T08:00:00.000Z",
    "updatedAt": "2026-02-08T14:30:00.000Z"
  }
}
```

---

### Error Responses

#### 401 Unauthorized (Not Authenticated)

**Status**: `302 Found` (Redirect)

**Location**: `/login`

**Cause**: User is not logged in

**Solution**: User must authenticate first

---

#### 500 Internal Server Error

**Status**: `500 Internal Server Error`

**Body**:

```json
{
  "message": "Internal server error"
}
```

**Cause**: Database query failed or unexpected error

**Solution**: Check server logs, ensure database is accessible

---

## 2. Settings Page - GET /settings

**Purpose**: Render the user settings page.

### Request

**Method**: `GET`

**URL**: `/settings`

**Headers**:

```
Cookie: adonis-session=<session_id>
```

**Authentication**: Required

---

### Response

**Status Code**: `200 OK`

**Content-Type**: `text/html` (Inertia.js renders React page)

**Inertia Props**:

```typescript
{
  userSettings: UserSettings
}
```

---

### Example Response (Inertia Props)

```json
{
  "userSettings": {
    "id": 1,
    "userId": 1,
    "weatherCity": "Paris",
    "createdAt": "2026-02-08T08:00:00.000Z",
    "updatedAt": "2026-02-08T14:30:00.000Z"
  }
}
```

**Note**: If no settings exist for user, a record is auto-created with `weatherCity: null`

---

### Error Responses

Same as dashboard endpoint (401 redirect, 500 error)

---

## 3. Update Settings - PATCH /settings

**Purpose**: Update user settings (currently only weather city).

### Request

**Method**: `PATCH`

**URL**: `/settings`

**Headers**:

```
Content-Type: application/json
Cookie: adonis-session=<session_id>
```

**Authentication**: Required

**Request Body**:

```typescript
{
  weatherCity?: string | null  // Optional, 1-100 characters, or null to clear
}
```

---

### Request Body Validation

**Field**: `weatherCity`

- **Type**: `string` or `null`
- **Required**: No (optional field)
- **Min Length**: 1 character (if provided)
- **Max Length**: 100 characters
- **Trim**: Yes (whitespace trimmed before validation)
- **Nullable**: Yes (can be `null` or omitted to clear city)

---

### Example Requests

#### Set Weather City

```json
{
  "weatherCity": "Paris"
}
```

#### Clear Weather City

```json
{
  "weatherCity": null
}
```

or omit the field entirely:

```json
{}
```

---

### Response

**Status Code**: `200 OK` or `302 Found` (redirect)

**Content-Type**: `application/json` (if AJAX) or redirect (if form submission)

**Response Body** (JSON):

```typescript
{
  success: boolean,
  message: string,
  userSettings: UserSettings
}
```

**Example Response**:

```json
{
  "success": true,
  "message": "Paramètres mis à jour avec succès",
  "userSettings": {
    "id": 1,
    "userId": 1,
    "weatherCity": "Paris",
    "createdAt": "2026-02-08T08:00:00.000Z",
    "updatedAt": "2026-02-08T15:45:00.000Z"
  }
}
```

**Redirect Behavior** (if Inertia form submission):

- Redirect to: `/` (dashboard) or `/settings` (stay on settings page)
- Flash message: "Paramètres mis à jour avec succès"

---

### Error Responses

#### 400 Bad Request (Validation Error)

**Status**: `400 Bad Request`

**Body**:

```json
{
  "errors": {
    "weatherCity": ["Le nom de la ville ne peut pas dépasser 100 caractères"]
  }
}
```

**Causes**:

- City name > 100 characters
- Invalid data type

**Solution**: Provide valid city name (1-100 chars)

---

#### 401 Unauthorized

**Status**: `302 Found` (Redirect to `/login`)

**Cause**: User is not logged in

**Solution**: User must authenticate first

---

#### 404 Not Found (Settings Record Not Found)

**Status**: `404 Not Found`

**Body**:

```json
{
  "message": "User settings not found"
}
```

**Cause**: User settings record doesn't exist (should auto-create, so this is rare)

**Solution**: Backend should use `firstOrCreate` pattern to avoid this

---

#### 500 Internal Server Error

**Status**: `500 Internal Server Error`

**Body**:

```json
{
  "message": "Internal server error"
}
```

**Cause**: Database update failed

**Solution**: Check server logs

---

## 4. External API - OpenWeatherMap

**Purpose**: Fetch current weather data for a given city.

**URL**: `https://api.openweathermap.org/data/2.5/weather`

**Method**: `GET`

**Query Parameters**:

| Parameter | Value              | Description                      |
| --------- | ------------------ | -------------------------------- |
| `q`       | City name (string) | e.g., "Paris", "London", "Tokyo" |
| `appid`   | API key (string)   | OpenWeatherMap API key           |
| `units`   | `metric`           | Use Celsius for temperature      |
| `lang`    | `fr`               | French language for descriptions |

---

### Example Request

```
GET https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=YOUR_API_KEY&units=metric&lang=fr
```

---

### Example Response

**Status**: `200 OK`

**Body**:

```json
{
  "coord": {
    "lon": 2.3488,
    "lat": 48.8534
  },
  "weather": [
    {
      "id": 802,
      "main": "Clouds",
      "description": "partiellement nuageux",
      "icon": "02d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 18.5,
    "feels_like": 17.8,
    "temp_min": 12.3,
    "temp_max": 21.7,
    "pressure": 1013,
    "humidity": 65
  },
  "visibility": 10000,
  "wind": {
    "speed": 4.2,
    "deg": 220
  },
  "clouds": {
    "all": 40
  },
  "dt": 1738850400,
  "sys": {
    "type": 1,
    "id": 6550,
    "country": "FR",
    "sunrise": 1738825200,
    "sunset": 1738858800
  },
  "timezone": 3600,
  "id": 2988507,
  "name": "Paris",
  "cod": 200
}
```

---

### Response Mapping (Backend)

Backend service (`weather_service.ts`) transforms the raw API response into `WeatherData`:

```typescript
{
  city: response.data.name,                          // "Paris"
  temperature: Math.round(response.data.main.temp),  // 18
  description: response.data.weather[0].description, // "partiellement nuageux"
  icon: response.data.weather[0].icon,               // "02d"
  tempMin: Math.round(response.data.main.temp_min),  // 12
  tempMax: Math.round(response.data.main.temp_max),  // 22
  humidity: response.data.main.humidity,             // 65
  windSpeed: Math.round(response.data.wind.speed * 3.6)  // Convert m/s to km/h: 15
}
```

---

### Error Responses

#### 404 Not Found (Invalid City)

**Status**: `404`

**Body**:

```json
{
  "cod": "404",
  "message": "city not found"
}
```

**Handling**: Return `null` for weather data, display empty state in UI

---

#### 401 Unauthorized (Invalid API Key)

**Status**: `401`

**Body**:

```json
{
  "cod": 401,
  "message": "Invalid API key"
}
```

**Handling**: Return `null`, log error, notify developer

---

#### 429 Too Many Requests (Rate Limit)

**Status**: `429`

**Body**:

```json
{
  "cod": 429,
  "message": "Rate limit exceeded"
}
```

**Handling**: Return `null`, show cached data if available, or error message

**Rate Limits** (Free Tier):

- 60 calls/minute
- 1,000,000 calls/month

---

#### Timeout

**Cause**: API doesn't respond within timeout (5 seconds)

**Handling**: Return `null`, display "Météo indisponible"

---

## 5. Existing Endpoints (Reused by Dashboard)

### Update Todo - PATCH /todos/:id

**Purpose**: Update todo properties (status, title, etc.) - reused for status toggle on dashboard.

**URL**: `/todos/:id`

**Method**: `PATCH`

**Request Body**:

```json
{
  "status": "Terminé" // or "À faire"
}
```

**Response**: Updated todo object

**Used By**: Dashboard todos card (status checkbox)

**Security**: User can only update their own todos (validated by `userId`)

---

### Delete Todo - DELETE /todos/:id

**Purpose**: Delete a todo - reused for delete button on dashboard.

**URL**: `/todos/:id`

**Method**: `DELETE`

**Response**: `204 No Content` or `200 OK` with success message

**Used By**: Dashboard todos card (delete button)

**Security**: User can only delete their own todos (validated by `userId`)

---

## Backend Implementation Summary

### Dashboard Controller

**File**: `app/controllers/dashboard_controller.ts`

**Method**: `index()`

**Pseudo-code**:

```typescript
async index({ auth, inertia }: HttpContext) {
  const today = DateTime.now().toSQLDate()

  // Parallel data fetching
  const [todosToday, notesToday, userSettings] = await Promise.all([
    Todo.query()
      .where('user_id', auth.user.id)
      .where('due_date', today)
      .orderBy('created_at', 'asc'),

    Note.query()
      .where('user_id', auth.user.id)
      .whereRaw('DATE(created_at) = ?', [today])
      .orderBy('created_at', 'desc'),

    UserSetting.firstOrCreate(
      { userId: auth.user.id },
      { userId: auth.user.id, weatherCity: null }
    )
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
}
```

---

### Settings Controller

**File**: `app/controllers/settings_controller.ts`

**Methods**:

#### `index()` - Render Settings Page

```typescript
async index({ auth, inertia }: HttpContext) {
  const userSettings = await UserSetting.firstOrCreate(
    { userId: auth.user.id },
    { userId: auth.user.id, weatherCity: null }
  )

  return inertia.render('settings/index', { userSettings })
}
```

#### `update()` - Update Settings

```typescript
async update({ auth, request, response }: HttpContext) {
  const validatedData = await request.validate(updateUserSettingValidator)

  const settings = await UserSetting.query()
    .where('user_id', auth.user.id)
    .firstOrFail()

  settings.weatherCity = validatedData.weatherCity ?? null
  await settings.save()

  return response.redirect().toRoute('dashboard.index')
  // Or return JSON for AJAX: { success: true, message: '...', userSettings }
}
```

---

## Route Definitions

**File**: `start/routes.ts`

```typescript
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Dashboard (root route)
router.get('/', [DashboardController, 'index']).as('dashboard.index').use(middleware.auth())

// Settings
router.get('/settings', [SettingsController, 'index']).as('settings.index').use(middleware.auth())

router
  .patch('/settings', [SettingsController, 'update'])
  .as('settings.update')
  .use(middleware.auth())

// Existing todo routes (reused by dashboard)
router.patch('/todos/:id', [TodosController, 'update']).as('todos.update').use(middleware.auth())

router.delete('/todos/:id', [TodosController, 'destroy']).as('todos.destroy').use(middleware.auth())
```

---

## Data Flow Summary

```
User → GET / → DashboardController.index()
                    ↓
          ┌─────────┴─────────┐
          │                   │
   Fetch Todos Today    Fetch Notes Today
   (due_date = today)   (created_at = today)
          │                   │
          └─────────┬─────────┘
                    ↓
          Fetch/Create UserSettings
                    ↓
      If weatherCity configured:
        Fetch Weather from API
                    ↓
          Render dashboard/index
          with all data as props
```

---

## References

- **OpenWeatherMap API Docs**: https://openweathermap.org/current
- **AdonisJS Routing**: https://docs.adonisjs.com/guides/routing
- **Inertia.js**: https://inertiajs.com/responses
- **VineJS Validation**: https://vinejs.dev/docs/introduction
- **Existing Todos Controller**: `/Users/clement/projects/perso/TooDoo/app/controllers/todos_controller.ts`
- **Existing Notes Model**: `/Users/clement/projects/perso/TooDoo/app/models/note.ts`

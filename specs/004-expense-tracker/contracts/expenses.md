# API Contracts: Expenses

**Branch**: `004-expense-tracker` | **Phase**: 1 | **Date**: 2026-02-15

Follows AdonisJS route patterns consistent with `/todos`, `/notes`, `/bookmarks`.
All routes are protected by `middleware.auth()`.

---

## GET /expenses

**Controller**: `ExpensesController.index`
**Purpose**: Render the expenses page with all user expenses within a time window.

### Response (Inertia render)

Renders `expenses/index` with:

```typescript
{
  expenses: Expense[]       // All expenses for user within window (-3 months to +12 months)
  userSettings: UserSettings // Includes currentBalance
}
```

**Time window**: Same as todos — `DateTime.now().minus({ months: 3 })` to `DateTime.now().plus({ months: 12 })`.

---

## POST /expenses

**Controller**: `ExpensesController.create`
**Purpose**: Create a new expense or income transaction.

### Request Body

```typescript
{
  type: 'income' | 'expense'   // required
  amount: number               // required, positive, max 2 decimal places
  label?: string               // optional, max 255 chars
  date: string                 // required, format 'YYYY-MM-DD'
}
```

### Validation (VineJS)

```typescript
vine.object({
  type: vine.enum(['income', 'expense']),
  amount: vine.number().positive().decimal([0, 2]),
  label: vine.string().trim().maxLength(255).optional(),
  date: vine.date({ formats: ['YYYY-MM-DD'] }),
})
```

### Success Response

- Redirect to `/expenses` (or back to `/` if request originated from dashboard)
- Flash: `'Transaction ajoutée avec succès'`

### Error Response

- Redirect back with validation errors

---

## DELETE /expenses/:id

**Controller**: `ExpensesController.delete`
**Purpose**: Delete a transaction owned by the authenticated user.

### Route Params

- `id`: number — transaction ID

### Authorization

- Query must include `where('user_id', user.id)` — ownership enforced
- Returns 404 if not found or not owned

### Success Response

- Redirect back
- Flash: `'Transaction supprimée'`

---

## PATCH /settings (extended)

**Controller**: `SettingsController.update` (existing, extended)
**Purpose**: Update user settings including the new `currentBalance` field.

### New field in request body

```typescript
{
  currentBalance?: number   // optional, non-negative, decimal(15,2)
}
```

### Validation addition (VineJS)

```typescript
currentBalance: vine.number().min(0).decimal([0, 2]).optional()
```

---

## POST /settings/reset-balance

**Controller**: `SettingsController.resetBalance` (new action)
**Purpose**: Reset `currentBalance` to `0` for the authenticated user.

### Request Body

None required.

### Success Response

- Redirect back
- Flash: `'Solde réinitialisé'`

---

## Dashboard Controller (extended)

**Controller**: `DashboardController.index` (existing, extended)
**Purpose**: Pass today's expenses to the dashboard page.

### Additional prop added to Inertia render

```typescript
expensesToday: Expense[]   // Expenses where date = today
```

---

## Error Handling

All controllers follow the existing pattern:

- Ownership check via `.where('user_id', user.id).firstOrFail()` → 404 on miss
- Validation errors → redirect back with errors via Inertia session
- Flash messages for success/error feedback

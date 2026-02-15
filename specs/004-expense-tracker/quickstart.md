# Quickstart: Expense Tracker Implementation

**Branch**: `004-expense-tracker` | **Phase**: 1 | **Date**: 2026-02-15

---

## Prerequisites

- Node.js 20.6+, PostgreSQL running, `.env` configured
- Current branch: `004-expense-tracker`
- Install new dependency:

```bash
npm install recharts
```

---

## Step 1: Database Migrations

Create two migration files:

```bash
node ace make:migration create_expenses_table
node ace make:migration add_current_balance_to_user_settings
```

Run migrations after implementing them:

```bash
node ace migration:run
```

---

## Step 2: Backend — Model

Create `app/models/expense.ts` following the Lucid ORM pattern from `app/models/todo.ts`:

- `belongsTo(() => User)` relation
- `@column.date()` for `date`
- `type` typed as `'income' | 'expense'`

Update `app/models/user_setting.ts`:

- Add `@column() declare currentBalance: number`

---

## Step 3: Backend — Validator

Create `app/validators/expense_validator.ts`:

- `createExpenseValidator`: type, amount (positive decimal), label (optional), date

Update `app/validators/user_setting.ts`:

- Add `currentBalance: vine.number().min(0).decimal([0, 2]).optional()` to the existing validator

---

## Step 4: Backend — Controller

Create `app/controllers/expenses_controller.ts`:

- `index`: load expenses for time window (-3 to +12 months), render `expenses/index`
- `create`: validate, create expense, redirect
- `delete`: ownership check, delete, redirect

Update `app/controllers/settings_controller.ts`:

- Handle `currentBalance` in the existing `update` action
- Add `resetBalance` action: sets `currentBalance = 0`, redirects back

Update `app/controllers/dashboard_controller.ts`:

- Query today's expenses and pass as `expensesToday` prop

---

## Step 5: Backend — Routes

Add to `start/routes.ts` (inside the auth middleware group):

```typescript
const ExpensesController = () => import('#controllers/expenses_controller')
router.get('/expenses', [ExpensesController, 'index'])
router.post('/expenses', [ExpensesController, 'create'])
router.delete('/expenses/:id', [ExpensesController, 'delete'])

// Add to existing settings group:
router.post('/settings/reset-balance', [SettingsController, 'resetBalance'])
```

---

## Step 6: Frontend — Types

Update `inertia/lib/types.ts`:

- Add `Expense` interface
- Add `currentBalance: number` to `UserSettings`
- Add `expensesToday: Expense[]` to `DashboardProps`

---

## Step 7: Frontend — Components

### New calendar component

`inertia/components/calendar/expense_calendar_view.tsx`

- Extends `BaseCalendarView<Expense>` pattern
- Badge shows net daily balance (income − expenses) in green/red

### New cards

- `inertia/components/cards/expense_list_card.tsx` — list of transactions for selected day
- `inertia/components/cards/expense_form_card.tsx` — form card (type toggle + amount + label + submit)
- `inertia/components/cards/expenses_card.tsx` — dashboard card (today's summary + quick-add modal)

### New forms

- `inertia/components/forms/expense_form.tsx` — reusable form component (used in both form card and dashboard modal)

### Analytics component

- `inertia/components/expenses/expense_analytics.tsx` — three recharts charts:
  1. Bar chart: monthly income vs. expenses (last 12 months)
  2. Donut chart: expense breakdown by label (current month)
  3. Line chart: daily running balance (current month)

---

## Step 8: Frontend — Page

`inertia/pages/expenses/index.tsx`

- Tabs (from Ant Design): "Calendrier" | "Statistiques"
- Tab 1: `CalendarLayout` with `ExpenseCalendarView` + `ExpenseListCard` + `ExpenseFormCard`
- Tab 2: `ExpenseAnalytics` component

---

## Step 9: Frontend — Header & Dashboard

Update `inertia/components/layout/header.tsx`:

- Add `<Link href="/expenses">` tab with `WalletOutlined` icon after Bookmarks

Update `inertia/pages/dashboard/index.tsx`:

- Import and render `ExpensesCard` in the grid (add a new column or replace the layout)
- Pass `expensesToday` and `userSettings.currentBalance` as props

---

## Step 10: Frontend — Settings

Update `inertia/pages/settings/index.tsx`:

- Add a new `Card` titled "Finances"
- Input for `currentBalance` (number input, pre-filled from `userSettings.currentBalance`)
- "Réinitialiser le solde" button → confirmation modal → `router.post('/settings/reset-balance')`

---

## Step 11: Verify

```bash
npm run typecheck    # Ensure no TypeScript errors
npm run lint         # ESLint check
npm run dev          # Start dev server and test manually
```

---

## Key Patterns to Follow

| Concern              | Pattern source                                       |
| -------------------- | ---------------------------------------------------- |
| Calendar view        | `inertia/pages/todos/index.tsx` + `BaseCalendarView` |
| List card            | `inertia/components/cards/todos_card.tsx`            |
| Form card            | `inertia/components/cards/todo_form_card.tsx`        |
| Dashboard card       | `inertia/components/cards/notes_card.tsx`            |
| Controller structure | `app/controllers/todos_controller.ts`                |
| Validator structure  | `app/validators/todo_validator.ts`                   |
| Settings extension   | `app/controllers/settings_controller.ts`             |
| Model pattern        | `app/models/todo.ts`                                 |

# Implementation Plan: Expense Tracker

**Branch**: `004-expense-tracker` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-expense-tracker/spec.md`

---

## Summary

Add a full expense tracker to Toudoux, allowing authenticated users to record income and expense transactions per day, view them on an interactive calendar, see analytics charts, and manage a starting balance from Settings. The feature follows the established todos/notes pattern: AdonisJS controller + Lucid model + VineJS validation on the backend; React + Inertia + Ant Design on the frontend. One new dependency (`recharts`) is added for analytics charts.

---

## Technical Context

**Language/Version**: TypeScript 5.8+ / Node.js 20.6+
**Primary Dependencies**: AdonisJS v6.18, Lucid ORM v21, VineJS, React 19, Inertia.js v3, Ant Design v6.2.3, Vite 6, Day.js (frontend), Luxon (backend), `recharts` (new — for analytics charts)
**Storage**: PostgreSQL — new `expenses` table + `current_balance` column on `user_settings`
**Testing**: Japa 4 (backend), Vitest 4 (frontend), Playwright (E2E)
**Target Platform**: Web (desktop-first, responsive)
**Project Type**: Monorepo — AdonisJS backend + React/Inertia frontend (single project structure)
**Performance Goals**: Standard web app expectations; analytics computed client-side from already-loaded expense array
**Constraints**: All data strictly scoped per user; no cross-user access; amounts always positive decimal
**Scale/Scope**: Personal productivity app; single user per session; calendar window of -3 to +12 months

---

## Constitution Check

_No project-specific constitution file is configured (template placeholders only). Standard AdonisJS/React patterns apply. No gate violations._

---

## Project Structure

### Documentation (this feature)

```text
specs/004-expense-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── expenses.md      # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
app/
├── controllers/
│   ├── expenses_controller.ts      # NEW — index, create, delete
│   ├── settings_controller.ts      # MODIFIED — add resetBalance action + currentBalance update
│   └── dashboard_controller.ts     # MODIFIED — add expensesToday prop
├── models/
│   ├── expense.ts                  # NEW — Lucid model
│   └── user_setting.ts             # MODIFIED — add currentBalance column
└── validators/
    ├── expense_validator.ts         # NEW — createExpenseValidator
    └── user_setting.ts             # MODIFIED — add currentBalance field

database/
└── migrations/
    ├── 1771000100001_create_expenses_table.ts           # NEW
    └── 1771000100002_add_current_balance_to_user_settings.ts  # NEW

start/
└── routes.ts                       # MODIFIED — add /expenses routes + /settings/reset-balance

inertia/
├── lib/
│   └── types.ts                    # MODIFIED — add Expense type, update UserSettings, DashboardProps
├── components/
│   ├── calendar/
│   │   └── expense_calendar_view.tsx   # NEW — calendar with daily net badge
│   ├── cards/
│   │   ├── expense_list_card.tsx       # NEW — day's transaction list
│   │   ├── expense_form_card.tsx       # NEW — add transaction form card
│   │   └── expenses_card.tsx           # NEW — dashboard card
│   ├── forms/
│   │   └── expense_form.tsx            # NEW — reusable form (type toggle, amount, label, date)
│   ├── expenses/
│   │   └── expense_analytics.tsx       # NEW — recharts analytics (bar, donut, line)
│   └── layout/
│       └── header.tsx                  # MODIFIED — add Dépenses tab (WalletOutlined)
└── pages/
    ├── expenses/
    │   └── index.tsx                   # NEW — Tabs: Calendrier | Statistiques
    ├── dashboard/
    │   └── index.tsx                   # MODIFIED — add ExpensesCard col
    └── settings/
        └── index.tsx                   # MODIFIED — add Finances card (balance input + reset)
```

**Structure Decision**: Single-project web application (AdonisJS + React/Inertia in one repo). All new backend code under `app/`, all new frontend code under `inertia/`. Follows the exact same layout as todos, notes, and bookmarks features.

---

## Complexity Tracking

No constitution violations. Standard complexity for this project's established patterns.

---

## Phase 0: Research Summary

See [research.md](./research.md) for full decisions.

| Topic               | Decision                                                            |
| ------------------- | ------------------------------------------------------------------- |
| Chart library       | `recharts` — lightweight, React-native, no extra peer deps          |
| Balance storage     | New `current_balance` column on `user_settings` (no new table)      |
| Expense type        | String enum `'income'` / `'expense'`; amount always positive        |
| Balance reset route | `POST /settings/reset-balance` (separate from PATCH /settings)      |
| Analytics tab       | Ant Design `Tabs` wrapping CalendarLayout + analytics component     |
| Analytics scope     | Bar (monthly), Donut (by label), Line (daily balance) — client-side |
| Currency            | Hardcoded `€` symbol via shared `formatAmount` utility              |

---

## Phase 1: Design Artifacts

### Data Model — `expenses` table (new)

| Column                      | Type          | Notes                     |
| --------------------------- | ------------- | ------------------------- |
| `id`                        | BIGINT PK     | auto-increment            |
| `user_id`                   | BIGINT FK     | → users, CASCADE DELETE   |
| `type`                      | VARCHAR(10)   | `'income'` or `'expense'` |
| `amount`                    | DECIMAL(15,2) | strictly positive         |
| `label`                     | VARCHAR(255)  | nullable, free-form       |
| `date`                      | DATE          | no time component         |
| `created_at` / `updated_at` | TIMESTAMP     | auto                      |

### Data Model — `user_settings` table (modified)

New column: `current_balance DECIMAL(15,2) NOT NULL DEFAULT 0`

See [data-model.md](./data-model.md) for full detail.

---

### API Contracts Summary

| Method | Route                     | Controller Action                       | Purpose              |
| ------ | ------------------------- | --------------------------------------- | -------------------- |
| GET    | `/expenses`               | `ExpensesController.index`              | Render expenses page |
| POST   | `/expenses`               | `ExpensesController.create`             | Add transaction      |
| DELETE | `/expenses/:id`           | `ExpensesController.delete`             | Remove transaction   |
| PATCH  | `/settings`               | `SettingsController.update` (extended)  | Update balance       |
| POST   | `/settings/reset-balance` | `SettingsController.resetBalance` (new) | Reset balance to 0   |
| GET    | `/`                       | `DashboardController.index` (extended)  | +expensesToday prop  |

See [contracts/expenses.md](./contracts/expenses.md) for full request/response specs.

---

### Frontend Component Architecture

```
expenses/index.tsx
  └─ Tabs (Ant Design)
      ├─ "Calendrier" tab
      │    └─ CalendarLayout
      │         ├─ ExpenseCalendarView (left — calendar with net day badges)
      │         └─ side panel (right)
      │              ├─ ExpenseListCard (scrollable list of day's transactions)
      │              └─ ExpenseFormCard (add transaction form)
      └─ "Statistiques" tab
           └─ ExpenseAnalytics
                ├─ BarChart (recharts) — monthly income vs. expenses
                ├─ PieChart/Donut (recharts) — breakdown by label
                └─ LineChart (recharts) — daily running balance

dashboard/index.tsx
  └─ ExpensesCard (new column — today's income/expense totals + quick-add modal)

settings/index.tsx
  └─ Card "Finances"
       ├─ NumberInput (current balance)
       └─ Button "Réinitialiser" (confirmation modal → POST /settings/reset-balance)

header.tsx
  └─ Link "/expenses" with WalletOutlined icon (after Bookmarks tab)
```

---

## Implementation Order (for `/speckit.tasks`)

The tasks should be generated in dependency order:

1. **DB migrations** — creates the schema foundation
2. **Backend model + validator** — data layer
3. **Backend controller + routes** — API layer
4. **Frontend types** — TypeScript contracts for frontend
5. **Frontend reusable components** — form, cards, calendar view
6. **Frontend expenses page** — calendar tab + analytics tab
7. **Frontend dashboard card** — ExpensesCard
8. **Frontend settings extension** — balance input + reset
9. **Frontend header** — Dépenses tab
10. **Integration test** — verify full flow end-to-end

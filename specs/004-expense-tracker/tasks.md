# Tasks: Expense Tracker

**Input**: Design documents from `/specs/004-expense-tracker/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/expenses.md ✓, quickstart.md ✓

**Organization**: Tasks grouped by user story — each story is independently implementable and testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependency required by the analytics feature

- [x] T001 Install `recharts` npm dependency (`npm install recharts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, core models, and shared TypeScript types that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create migration `database/migrations/1771000100001_create_expenses_table.ts` — table with columns: id (bigint PK), user_id (bigint FK → users CASCADE DELETE), type (varchar(10) CHECK IN ('income','expense')), amount (decimal(15,2) CHECK > 0), label (varchar(255) nullable), date (date NOT NULL), created_at, updated_at; indexes on user_id and (user_id, date)
- [x] T003 [P] Create migration `database/migrations/1771000100002_add_current_balance_to_user_settings.ts` — adds column `current_balance DECIMAL(15,2) NOT NULL DEFAULT 0` to `user_settings` table
- [x] T004 Create Lucid model `app/models/expense.ts` — fields: id, userId, type (`'income' | 'expense'`), amount (number), label (string | null), date (DateTime via `@column.date()`), createdAt, updatedAt; `@belongsTo(() => User)` relation; static `forUser(query, userId)` scope
- [x] T005 [P] Update `app/models/user_setting.ts` — add `@column() declare currentBalance: number` field
- [x] T006 [P] Update `inertia/lib/types.ts` — add `Expense` interface (id, userId, type, amount, label, date, createdAt, updatedAt); add `currentBalance: number` to `UserSettings`; add `expensesToday: Expense[]` to `DashboardProps`

**Checkpoint**: Run `node ace migration:run` — migrations apply cleanly. TypeScript types compile without errors.

---

## Phase 3: User Story 1 — Record a Daily Transaction (Priority: P1) 🎯 MVP

**Goal**: Users can navigate to `/expenses`, browse a calendar, select a day, see its transactions, and add or delete income/expense entries.

**Independent Test**: Navigate to `/expenses` → select today → add an expense of €50 for "Restaurant" → verify it appears in the list with the correct type badge and amount → delete it → verify it disappears and totals reset.

### Implementation

- [x] T007 [P] [US1] Create `app/validators/expense_validator.ts` — export `createExpenseValidator` using `vine.compile(vine.object({ type: vine.enum(['income','expense']), amount: vine.number().positive().decimal([0,2]), label: vine.string().trim().maxLength(255).optional(), date: vine.date({ formats: ['YYYY-MM-DD'] }) }))`
- [x] T008 [US1] Create `app/controllers/expenses_controller.ts` — three actions: `index` (loads expenses for window -3/+12 months using `Expense.query().where('user_id', user.id).whereBetween('date', [windowStart, windowEnd])`, renders `expenses/index` with `{ expenses, userSettings }`); `create` (validates with `createExpenseValidator`, creates record, redirects to `/expenses` or `/` for dashboard origin); `delete` (ownership check via `.where('user_id', user.id).firstOrFail()`, deletes, redirects back)
- [x] T009 [US1] Update `start/routes.ts` — inside the auth middleware group, add: `router.get('/expenses', [ExpensesController, 'index'])`, `router.post('/expenses', [ExpensesController, 'create'])`, `router.delete('/expenses/:id', [ExpensesController, 'delete'])`
- [x] T010 [P] [US1] Create `inertia/components/calendar/expense_calendar_view.tsx` — extends `BaseCalendarView<Expense>` pattern; `getItemDate={(expense) => expense.date}`; `renderItem` shows a colored `Badge` (green for income, red for expense) with amount formatted as `€X.XX`; groups items by day and shows daily net (income − expenses) as a summary badge on each day cell
- [x] T011 [P] [US1] Create `inertia/components/forms/expense_form.tsx` — reusable form component with: `Radio.Group` for type (income/expense), `InputNumber` for amount (min=0.01, precision=2, prefix="€"), `Input` for label (optional), hidden `date` field pre-filled from props; submits via `router.post('/expenses', data, { preserveScroll: true })` with `onSuccess` callback
- [x] T012 [P] [US1] Create `inertia/components/cards/expense_list_card.tsx` — Ant Design `Card` titled "Transactions du [date]"; lists expenses for selected day as `List` items; each item shows: type badge (Entrée/Sortie with green/red color), amount in €, label; delete button with `Modal.confirm`; shows daily totals (total entrées, total sorties, solde net) in card footer; empty state when no transactions
- [x] T013 [US1] Create `inertia/components/cards/expense_form_card.tsx` — Ant Design `Card` titled "Ajouter une transaction"; wraps `ExpenseForm` component; passes `selectedDate` as prop
- [x] T014 [US1] Create `inertia/pages/expenses/index.tsx` — page layout matching `todos/index.tsx`: `CalendarLayout` with `ExpenseCalendarView` on left and `ExpenseListCard` + `ExpenseFormCard` stacked on right; `selectedDate` state; filters `expensesForSelectedDay = expenses.filter(e => isSameDay(e.date, selectedDate))`; page title "Dépenses"; passes `user` and `currentPath="/expenses"` to `Header`

**Checkpoint**: `GET /expenses` renders calendar. Add a transaction → it appears on the calendar day. Delete it → it disappears. All data is user-scoped.

---

## Phase 4: User Story 2 — Dashboard Card for Today's Expenses (Priority: P2)

**Goal**: The dashboard shows a "Dépenses du jour" card with today's income total, expense total, and net balance, plus a quick-add button.

**Independent Test**: Add two transactions for today (one income €100, one expense €30). Go to dashboard → card shows "Entrées: €100.00", "Sorties: €30.00", "Solde: +€70.00". Click the `+` button → modal opens → add expense → card updates.

### Implementation

- [x] T015 [US2] Update `app/controllers/dashboard_controller.ts` — add `Expense` import; in `index`, fetch `expensesToday` via `Expense.query().where('user_id', user.id).whereRaw('date = CURRENT_DATE')`; add to `Promise.all` alongside existing queries; pass `expensesToday` to `inertia.render`
- [x] T016 [P] [US2] Create `inertia/components/cards/expenses_card.tsx` — Ant Design `Card` titled "Dépenses du jour"; shows today's income total, expense total, and net (income − expenses); net displayed in green if positive, red if negative; `+` button in card header opens `Modal` containing `ExpenseForm` with today's date; empty state when no transactions; follows same pattern as `todos_card.tsx`
- [x] T017 [US2] Update `inertia/pages/dashboard/index.tsx` — import `ExpensesCard`; add `expensesToday` to `DashboardProps` destructure; add a new `Col` (following existing responsive grid pattern) rendering `<ExpensesCard expenses={expensesToday} />`

**Checkpoint**: Dashboard shows the new expenses card. Add a transaction from the `+` button → card updates without full page reload (use `only: ['expensesToday']`).

---

## Phase 5: User Story 3 — Navigation via Header Tab (Priority: P3)

**Goal**: "Dépenses" tab visible in the app header, linking to `/expenses`, with active state highlighting.

**Independent Test**: From any page, click the "Dépenses" header tab → navigates to `/expenses`. While on `/expenses`, the tab is bold with a bottom border underline.

### Implementation

- [x] T018 [US3] Update `inertia/components/layout/header.tsx` — add `import { WalletOutlined } from '@ant-design/icons'`; add a new `<Link href="/expenses">` button after the Bookmarks tab, using the same `Button type="text"` pattern with `borderBottom` active state when `currentPath === '/expenses'`; button text "Dépenses" with `WalletOutlined` icon; also add the link to the mobile Drawer menu

**Checkpoint**: All pages show the Dépenses tab. Clicking it navigates correctly. Active state shows on the expenses page.

---

## Phase 6: User Story 4 — Analytics & Comparison View (Priority: P4)

**Goal**: A "Statistiques" tab on the expenses page shows three recharts charts: monthly income/expense bar chart, expense breakdown donut chart, and daily running balance line chart.

**Independent Test**: With transactions across 2+ months seeded, click "Statistiques" tab → three charts render with correct data. Bar chart shows each month as a grouped bar (income/expense). Donut shows expense categories. Line shows daily balance trend.

### Implementation

- [x] T019 [P] [US4] Create `inertia/components/expenses/expense_analytics.tsx` — receives `expenses: Expense[]` and `currentBalance: number` as props; computes analytics client-side: (1) groups by month for last 12 months → `BarChart` (recharts) with two bars per month (income green, expense red); (2) groups current-month expenses by label → `PieChart` with `Cell` components per label; (3) computes daily running balance for current month → `LineChart`; uses recharts `ResponsiveContainer` for all charts; shows empty state message when no data; add a `formatAmount` helper `(n: number) => €${n.toFixed(2)}`
- [x] T020 [US4] Update `inertia/pages/expenses/index.tsx` — wrap the existing `CalendarLayout` and new analytics component in Ant Design `Tabs`; Tab 1 key="calendrier" label="Calendrier" contains the existing calendar layout; Tab 2 key="statistiques" label="Statistiques" contains `<ExpenseAnalytics expenses={expenses} currentBalance={userSettings.currentBalance} />`; default active tab is "calendrier"

**Checkpoint**: "Statistiques" tab renders all three charts with real data. Switching between tabs preserves calendar selection state.

---

## Phase 7: User Story 5 — Balance Management in Settings (Priority: P5)

**Goal**: Settings page has a "Finances" card with a balance input field (persisted) and a "Réinitialiser le solde" button that resets balance to 0 after confirmation.

**Independent Test**: Navigate to Settings → enter €1500 in balance field → save → navigate to `/expenses` → analytics shows correct running balance. Return to Settings → click "Réinitialiser le solde" → confirm in modal → balance shows 0 → expenses analytics updates.

### Implementation

- [x] T021 [P] [US5] Update `app/validators/user_setting.ts` — add `currentBalance: vine.number().min(0).decimal([0, 2]).optional()` to the existing `updateUserSettingValidator`
- [x] T022 [US5] Update `app/controllers/settings_controller.ts` — in `update` action, add `if (data.currentBalance !== undefined) { userSettings.currentBalance = data.currentBalance }` block; add new `resetBalance` action: `await UserSetting.firstOrCreate(...)`, sets `currentBalance = 0`, saves, flashes `'Solde réinitialisé'`, redirects back
- [x] T023 [US5] Update `start/routes.ts` — add `router.post('/settings/reset-balance', [SettingsController, 'resetBalance'])` inside the auth middleware group
- [x] T024 [US5] Update `inertia/pages/settings/index.tsx` — add a `Card` titled "Finances" with: a labeled `InputNumber` for balance (prefix="€", precision=2, min=0, pre-filled with `userSettings.currentBalance`), a "Enregistrer" button that calls `router.patch('/settings', { currentBalance: value })`; a "Réinitialiser le solde" danger button that opens `Modal.confirm` asking for confirmation, then calls `router.post('/settings/reset-balance')` on confirm

**Checkpoint**: Save €2000 balance in Settings → confirm it persists on reload. Reset → confirms via modal → balance returns to 0.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Type safety validation, code quality, and final integration check

- [x] T025 [P] Run `npm run typecheck` — resolve any TypeScript errors across all new and modified files
- [x] T026 [P] Run `npm run lint` and `npm run format` — ensure all new files conform to project ESLint/Prettier config
- [x] T027 Perform manual integration test per `quickstart.md` — verify full flow: migrations → add expenses → dashboard card → analytics tab → settings balance → reset balance; confirm all data is user-scoped (no cross-user leakage)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational (T002, T004, T006)
- **US2 (Phase 4)**: Depends on Foundational (T004, T006, T015 needs T004); integrates with US1 components (ExpenseForm)
- **US3 (Phase 5)**: Depends only on Foundational — fully independent of US1/US2
- **US4 (Phase 6)**: Depends on US1 page (T014) to integrate the Statistiques tab
- **US5 (Phase 7)**: Depends on Foundational (T003, T005); independent of US1–US4
- **Polish (Phase 8)**: Depends on all desired stories being complete

### User Story Dependencies

```
T001 (npm install)
  └─> T002, T003 [parallel] (migrations)
        └─> T004 (Expense model)    T005 (UserSetting update)    T006 (TS types) [parallel]
              └─> US1 (T007-T014)      └─> US5 (T021-T024)
              └─> US2 (T015-T017)
  US3 (T018) — independent after T001
  US4 (T019-T020) — after US1 complete (T014 needed for T020)
```

### Within Each User Story

- Backend (validator → controller → routes) before frontend page
- Reusable components [P] before the page that assembles them
- Controller actions before the page that calls them

### Parallel Opportunities

| Phase   | Parallel Tasks                                              |
| ------- | ----------------------------------------------------------- |
| Phase 2 | T002 + T003 + T006 simultaneously; T005 alongside T004      |
| Phase 3 | T007 + T010 + T011 + T012 simultaneously                    |
| Phase 6 | T019 (analytics component) while US5 runs on another branch |
| Phase 7 | T021 alongside T016 (US2) or T019 (US4)                     |
| Phase 8 | T025 + T026 simultaneously                                  |

---

## Parallel Execution Example: Phase 3 (User Story 1)

```bash
# Launch all backend + frontend leaf tasks simultaneously:
Task: "Create app/validators/expense_validator.ts"              # T007 [P]
Task: "Create inertia/components/calendar/expense_calendar_view.tsx"  # T010 [P]
Task: "Create inertia/components/forms/expense_form.tsx"        # T011 [P]
Task: "Create inertia/components/cards/expense_list_card.tsx"   # T012 [P]

# Then sequentially:
Task: "Create app/controllers/expenses_controller.ts"  # T008 (after T007)
Task: "Create inertia/components/cards/expense_form_card.tsx"  # T013 (after T011)

# Then final assembly:
Task: "Update start/routes.ts"                  # T009 (after T008)
Task: "Create inertia/pages/expenses/index.tsx" # T014 (after T009, T010, T012, T013)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Install recharts
2. Complete Phase 2: Migrations + models + types
3. Complete Phase 3: Expenses CRUD + calendar page
4. **STOP and VALIDATE**: Full CRUD works at `/expenses`
5. Deploy/demo — core value delivered

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 → `/expenses` calendar view functional (MVP)
3. Phase 4 → Dashboard card shows today's summary
4. Phase 5 → Header tab discoverable from all pages
5. Phase 6 → Analytics charts provide insight
6. Phase 7 → Balance management in Settings

### Recommended Single-Developer Order

Follow priority order: P1 → P2 → P3 → P4 → P5 with Polish last. US3 (header tab, T018) is tiny and can be slotted between US1 and US2 as a quick win.

---

## Notes

- `[P]` tasks touch different files with no shared in-progress dependencies — safe to parallelize
- `[Story]` label maps each task to its user story for traceability
- Amount formatting: use `€${amount.toFixed(2)}` consistently; extract as `formatAmount()` helper in `expense_analytics.tsx` or `inertia/lib/date_utils.ts`
- Dashboard grid: current layout uses `Col lg={6}` + `Col lg={9}` + `Col lg={9}` = 24. To add ExpensesCard, consider `Col lg={6}` + `Col lg={6}` + `Col lg={6}` + `Col lg={6}` or a two-row layout — adapt to maintain visual balance
- Inertia partial reload pattern for dashboard card: `only: ['expensesToday']` after quick-add
- All delete operations must use `Modal.confirm` (consistent with existing todos/notes pattern)

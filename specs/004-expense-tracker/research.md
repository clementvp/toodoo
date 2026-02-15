# Research: Expense Tracker

**Branch**: `004-expense-tracker` | **Phase**: 0 | **Date**: 2026-02-15

---

## Decision 1: Chart Library

**Decision**: Use `recharts` for analytics charts

**Rationale**:

- No chart library is currently installed in the project
- `recharts` is pure React (composable component model), lightweight (~500 KB), and has zero extra peer dependencies
- `@ant-design/charts` (G2-based) would be the AntD-native alternative but is significantly heavier and requires `@antv/g2` as a peer dep; adds complexity disproportionate to the feature
- `recharts` v2.x supports React 18 and 19, is actively maintained (12M+ weekly npm downloads), and integrates cleanly with Ant Design layouts (no theme conflicts)
- Required charts: Bar chart (monthly income vs. expenses), Pie/Donut chart (expense breakdown by label), Line chart (balance over time) — all provided by `recharts`

**Alternatives considered**:

- `@ant-design/charts` — heavier, more setup, better theme integration but not worth the overhead
- `chart.js` + `react-chartjs-2` — canvas-based, good performance, but more imperative API
- `victory` — less popular, smaller ecosystem

---

## Decision 2: Database Schema for Expenses

**Decision**: New `expenses` table; extend `user_settings` with `current_balance` column

**Rationale**:

- Expenses are a new entity distinct from todos/notes; they warrant their own table following the existing pattern (one table per domain entity)
- `current_balance` is a user-level setting (not per-transaction) → fits naturally as a new column in `user_settings`, consistent with how `weather_city` and `show_printer_button` are stored
- No need for a `UserBalance` model — `UserSetting` is extended

**Alternatives considered**:

- Separate `user_balances` table — adds complexity for a single scalar value; rejected
- Storing balance as a derived value (sum of all transactions) — loses the ability to set a real-world starting point; rejected

---

## Decision 3: Expense Type Representation

**Decision**: `type` column as a string enum (`'income'` | `'expense'`)

**Rationale**:

- Consistent with existing patterns: `todo.status` is `'À faire' | 'Terminé'`, `user.role` is `'admin' | 'user'` — string enum discriminators throughout the codebase
- Amount is always stored as a positive decimal; sign is determined by `type`
- VineJS `vine.enum(['income', 'expense'])` pattern already used in the project

---

## Decision 4: Balance Reset Route

**Decision**: Add `POST /settings/reset-balance` as a dedicated route

**Rationale**:

- The reset operation has no request body; it's an intent-driven action (not a data patch)
- Keeping it separate from `PATCH /settings` avoids mixing destructive-reset semantics with regular field updates
- Consistent with AdonisJS pattern of using dedicated action routes for single-intent operations
- Frontend uses `router.post('/settings/reset-balance')` with confirmation modal before firing

---

## Decision 5: Expense View Tab Architecture

**Decision**: Use Ant Design `Tabs` component at the `/expenses` page level to switch between "Calendrier" and "Statistiques" views

**Rationale**:

- The existing CalendarLayout pattern (used in todos/notes) renders the full viewport; wrapping it in a Tabs component adds minimal overhead
- Tab-based navigation is stateful (URL stays `/expenses`, tab state is React state) — this is consistent with the app's existing SPA navigation model via Inertia
- The "Statistiques" tab receives the full `expenses` array already loaded, so no additional server round-trip is needed for the analytics view

---

## Decision 6: Analytics Metrics Scope

**Decision**: Analytics tab shows: (1) Monthly bar chart — income vs. expenses per month for last 12 months; (2) Expense breakdown donut chart — by label for selected month; (3) Running balance line chart — daily balance over selected month

**Rationale**:

- These three charts cover the user's stated goals: "graphiques, comparatifs"
- All computed client-side from the `expenses` array passed from the server (no dedicated analytics API endpoint needed)
- The backend loads all expenses for a time window (same approach as todos with `windowStart`/`windowEnd`) and the frontend handles grouping/aggregation

---

## Decision 7: Currency Display

**Decision**: Display amounts with the `€` symbol, hardcoded, no currency configuration

**Rationale**:

- Per spec assumption: single currency, not configurable in this version
- Avoids `Intl.NumberFormat` locale complexity; straightforward `€X.XX` formatting via a shared `formatAmount` utility function

---

## Resolved NEEDS CLARIFICATION: None

All decisions from the spec have been resolved without requiring user clarification.

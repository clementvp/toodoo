# Feature Specification: Expense Tracker

**Feature Branch**: `004-expense-tracker`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Dans la meme veine que les notes et les todo, j'aimerais un expense tracker. Une vue dépenses qui reprenne les codes des vues todo et notes (avec un calendrier donc) ou on puisse pour un jour donné rentrer une sortie ou une entrée d'argent. je veux donc un onglet dépenses sur le header (dans le meme style que tache note et bookmarks). Sur le dashboard je veux donc une card (dans la meme veine que les autres cardes) avec les dépenses du jour. Sur la vue dépenses (celle avec le calendrier, je veux un onglet en plus (avec des graphiques, des comparatifs etc). Lié a ca, dans settings je dois pouvoir rentrer un solde actuel (celui qui sera utilisé dans les dépenses) et pouvoir reinitialisé ce solde a l'appui d'un bouton. Cette feature sera la 004-expense-tracker."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Record a Daily Transaction (Priority: P1)

A user wants to log a financial movement (income or expense) for a specific day. From the "Dépenses" section, they navigate the calendar to select a date and add a transaction by specifying whether it is income or an expense, its amount, and an optional label/category.

**Why this priority**: This is the core action of the feature. Without the ability to record transactions, nothing else in the expense tracker has value.

**Independent Test**: Can be fully tested by navigating to the Dépenses page, selecting a day on the calendar, adding an expense of €50 for "Restaurant", and verifying it appears in the day's transaction list.

**Acceptance Scenarios**:

1. **Given** the user is on the Dépenses page, **When** they click a day on the calendar, **Then** a list of transactions for that day is displayed along with an "Add transaction" action.
2. **Given** the user clicks "Add transaction", **When** they fill in type (income/expense), amount, and optional label, and confirm, **Then** the transaction is saved and immediately visible in the day's list.
3. **Given** a day has transactions, **When** the user views the calendar, **Then** that day shows a visual indicator (e.g., a dot or summary badge) distinguishing days with activity.
4. **Given** a transaction exists, **When** the user deletes it, **Then** it is removed from the list and the day's totals update accordingly.

---

### User Story 2 - Dashboard Card for Today's Expenses (Priority: P2)

A user wants to see a quick summary of today's financial activity directly from the dashboard, without navigating to the full Dépenses view.

**Why this priority**: Consistency with the existing dashboard experience (todo card, notes card). Provides immediate financial awareness.

**Independent Test**: Can be tested independently by adding transactions for today, returning to the dashboard, and verifying the Dépenses card shows the correct totals and transaction list for today.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard, **When** they view the Dépenses card, **Then** it displays today's income total, expense total, and net balance for the day.
2. **Given** no transactions exist for today, **When** the user views the Dépenses card, **Then** it shows an empty state with a prompt to add a transaction.
3. **Given** transactions exist for today, **When** the user clicks a quick-add action on the card, **Then** they can add a new transaction for today without leaving the dashboard.

---

### User Story 3 - Navigation via Header Tab (Priority: P3)

A user wants to navigate to the Dépenses section from the top navigation header, consistent with how they access Tâches, Notes, and Bookmarks.

**Why this priority**: Essential for discoverability but depends on the core view existing first.

**Independent Test**: Can be tested by verifying the "Dépenses" tab appears in the header, clicking it navigates to the correct page, and the active state is highlighted correctly.

**Acceptance Scenarios**:

1. **Given** any page in the app, **When** the user clicks the "Dépenses" tab in the header, **Then** they are navigated to the Dépenses calendar view.
2. **Given** the user is on the Dépenses page, **When** the header is rendered, **Then** the "Dépenses" tab is visually highlighted as active.

---

### User Story 4 - Analytics & Comparison View (Priority: P4)

A user wants to visualize their financial patterns over time — spending by category, monthly comparisons, income vs. expense trends — from a dedicated analytics tab within the Dépenses section.

**Why this priority**: High value for financial awareness but not required for core data entry; depends on having transaction data accumulated.

**Independent Test**: Can be tested with seeded transaction data across multiple months by verifying charts render correctly, monthly comparison data is accurate, and the tab switch works independently.

**Acceptance Scenarios**:

1. **Given** the user is on the Dépenses page, **When** they click the "Statistiques" tab, **Then** they see charts summarizing their financial activity.
2. **Given** transactions across multiple months exist, **When** the user views the analytics tab, **Then** they see a month-over-month comparison of income and expenses.
3. **Given** transactions with labels/categories exist, **When** the user views the analytics tab, **Then** they see a breakdown of expenses by category.
4. **Given** no transactions exist yet, **When** the user views the analytics tab, **Then** an informative empty state is displayed.

---

### User Story 5 - Balance Management in Settings (Priority: P5)

A user wants to set their current account balance in the Settings page so the expense tracker can display a running balance that reflects real-world financial state. They also want the ability to reset this balance.

**Why this priority**: Adds context to raw transaction data but is independent of core CRUD operations.

**Independent Test**: Can be tested by navigating to Settings, entering a starting balance of €1,500, saving it, then verifying it appears as the starting balance in the Dépenses view. Then resetting and verifying it returns to zero.

**Acceptance Scenarios**:

1. **Given** the user is on the Settings page, **When** they enter a numeric balance amount and save, **Then** the balance is persisted and used as the reference balance in the Dépenses view.
2. **Given** a balance has been set, **When** the user clicks "Réinitialiser le solde", **Then** a confirmation prompt appears before resetting to zero.
3. **Given** the user confirms the reset, **When** the page reloads, **Then** the balance is reset to 0 and the Dépenses view reflects this change.

---

### Edge Cases

- What happens when the user enters 0 as a transaction amount? (Should be rejected with a validation error.)
- What happens when the user enters a negative amount? (Should be rejected — type selection handles sign.)
- How does the system handle a day with both income and expenses when showing the calendar badge?
- What happens if the user resets balance while transactions exist? (Transactions are preserved; only the starting balance is reset.)
- How does the analytics view behave with only one month of data? (Monthly comparison shows single-month summary without prior period.)

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to access the Dépenses section via a dedicated "Dépenses" tab in the application header, consistent with Tâches, Notes, and Bookmarks tabs.
- **FR-002**: The Dépenses view MUST display a monthly calendar where days with transactions are visually differentiated from empty days.
- **FR-003**: Users MUST be able to select a specific day on the calendar to view all transactions for that day.
- **FR-004**: Users MUST be able to add a transaction for a selected day, specifying: type (income or expense), amount (positive numeric), and optional label.
- **FR-005**: Users MUST be able to delete any existing transaction.
- **FR-006**: The system MUST display the total income, total expenses, and net balance for the selected day in the day detail view.
- **FR-007**: The dashboard MUST include a Dépenses card showing today's income total, expense total, and net balance.
- **FR-008**: The dashboard Dépenses card MUST allow quick addition of a transaction for today.
- **FR-009**: The Dépenses section MUST include a "Statistiques" tab displaying charts and analytics based on recorded transactions.
- **FR-010**: The analytics view MUST show at minimum: monthly income vs. expense bar or line chart, expense breakdown by label/category, and a month-over-month comparison.
- **FR-011**: Users MUST be able to set a starting account balance in the Settings page.
- **FR-012**: The Settings page MUST include a "Réinitialiser le solde" button that, after confirmation, resets the stored balance to zero.
- **FR-013**: The stored balance MUST be used to display a running (cumulative) balance in the Dépenses view, updated as transactions are added or removed.
- **FR-014**: Transaction amounts MUST be validated to be strictly positive numeric values.
- **FR-015**: All transaction data MUST be scoped to the authenticated user (no cross-user data access).

### Key Entities

- **Transaction**: Represents a single financial movement for a user on a given date. Key attributes: type (income/expense), amount, label (optional), date, user reference.
- **UserBalance**: Stores the user's declared starting balance. Attributes: current balance amount, last reset date, user reference. One per user (extends existing user settings).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can record a new transaction in under 30 seconds from clicking the "Dépenses" tab.
- **SC-002**: The dashboard Dépenses card accurately reflects today's transactions at all times, with no stale data after adding or deleting transactions.
- **SC-003**: The analytics view renders charts for up to 12 months of transaction history without perceptible delay.
- **SC-004**: 100% of transaction data is correctly scoped per user — no cross-user leakage is possible.
- **SC-005**: The balance reset operation requires explicit confirmation, preventing accidental data loss.
- **SC-006**: The Dépenses header tab, calendar view, and analytics tab are all accessible in 2 clicks or fewer from any page in the application.

---

## Assumptions

- Transactions are associated with a single date (no time component required, unlike todos).
- Labels/categories are free-form text entered by the user; no predefined category list is required at this stage.
- Currency is not configurable — the application displays amounts without a specific currency symbol, or uses a default (e.g., €). A single currency per user is assumed.
- The starting balance in Settings represents the user's real-world account balance at a point in time; the app does not sync with bank accounts.
- The running balance displayed in the Dépenses view is computed as: starting balance + sum of all income transactions − sum of all expense transactions (across all time, not just the current month).
- Editing a transaction (changing amount or type) is not required in the first version; delete and re-add is the supported flow.
- The "Statistiques" analytics tab shows data for the currently displayed calendar month by default, with the ability to navigate months.

# Data Model: Expense Tracker

**Branch**: `004-expense-tracker` | **Phase**: 1 | **Date**: 2026-02-15

---

## New Table: `expenses`

| Column       | Type             | Constraints                                 | Description                                 |
| ------------ | ---------------- | ------------------------------------------- | ------------------------------------------- |
| `id`         | `BIGINT`         | PRIMARY KEY, auto-increment                 | Unique identifier                           |
| `user_id`    | `BIGINT`         | NOT NULL, FK → `users.id` ON DELETE CASCADE | Owner of the expense                        |
| `type`       | `VARCHAR(10)`    | NOT NULL, CHECK IN ('income','expense')     | Direction of money flow                     |
| `amount`     | `DECIMAL(15, 2)` | NOT NULL, CHECK > 0                         | Positive monetary amount                    |
| `label`      | `VARCHAR(255)`   | NULLABLE                                    | Free-form description/category              |
| `date`       | `DATE`           | NOT NULL                                    | Date of the transaction (no time component) |
| `created_at` | `TIMESTAMP`      | NOT NULL, auto                              | Record creation timestamp                   |
| `updated_at` | `TIMESTAMP`      | NOT NULL, auto                              | Record update timestamp                     |

**Indexes**:

- `expenses_user_id_index` on `user_id` (for per-user filtering)
- `expenses_user_id_date_index` on `(user_id, date)` (for calendar/day queries)

---

## Modified Table: `user_settings`

**New column added**:

| Column            | Type             | Constraints | Default | Description                      |
| ----------------- | ---------------- | ----------- | ------- | -------------------------------- |
| `current_balance` | `DECIMAL(15, 2)` | NOT NULL    | `0.00`  | User's declared starting balance |

---

## Lucid ORM Model: `Expense`

**File**: `app/models/expense.ts`

```
Expense {
  id: number                      // @column({ isPrimary: true })
  userId: number                  // @column()
  type: 'income' | 'expense'      // @column()
  amount: number                  // @column()
  label: string | null            // @column()
  date: DateTime                  // @column.date()
  createdAt: DateTime             // @column.dateTime({ autoCreate: true })
  updatedAt: DateTime             // @column.dateTime({ autoCreate: true, autoUpdate: true })
  user: BelongsTo<User>           // @belongsTo(() => User)
}
```

---

## Modified Lucid ORM Model: `UserSetting`

**New field added**:

```
UserSetting {
  // ... existing fields ...
  currentBalance: number          // @column() — default 0
}
```

---

## TypeScript Frontend Types (additions to `inertia/lib/types.ts`)

```typescript
export interface Expense {
  id: number
  userId: number
  type: 'income' | 'expense'
  amount: number
  label: string | null
  date: string // ISO date string YYYY-MM-DD
  createdAt: string
  updatedAt: string
}

// Updated UserSettings — add:
//   currentBalance: number
```

---

## Running Balance Computation

The running balance shown in the UI is computed client-side as:

```
runningBalance = currentBalance + Σ(income amounts) − Σ(expense amounts)
```

Where `currentBalance` comes from `userSettings.currentBalance` and the sums span **all** expenses loaded (the full time window).

---

## State Transitions

Expenses do not have a status lifecycle. They are either present or deleted. No edit operation is supported in this version.

---

## Migration Files

### `1771000100001_create_expenses_table.ts`

Creates the `expenses` table with all columns and indexes.

### `1771000100002_add_current_balance_to_user_settings.ts`

Adds `current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0` to `user_settings`.

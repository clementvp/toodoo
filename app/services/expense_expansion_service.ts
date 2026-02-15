import { DateTime } from 'luxon'
import type Expense from '#models/expense'
import type ExpenseOccurrence from '#models/expense_occurrence'

export interface ExpandedExpense {
  id: number
  userId: number
  type: 'income' | 'expense' | 'adjustment'
  amount: number
  categoryId: number | null
  date: string
  isRecurring: boolean
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrenceEndDate: string | null
  occurrenceDate: string | null
  createdAt: string
  updatedAt: string
}

function generateOccurrenceDates(
  expense: Expense,
  windowStart: DateTime,
  windowEnd: DateTime
): DateTime[] {
  const dates: DateTime[] = []
  const start = expense.date.startOf('day')

  const endBound = expense.recurrenceEndDate
    ? DateTime.min(expense.recurrenceEndDate.startOf('day'), windowEnd.startOf('day'))
    : windowEnd.startOf('day')

  let current = start

  while (current <= endBound) {
    if (current >= windowStart.startOf('day')) {
      dates.push(current)
    }

    switch (expense.recurrenceType) {
      case 'daily':
        current = current.plus({ days: 1 })
        break
      case 'weekly':
        current = current.plus({ weeks: 1 })
        break
      case 'monthly':
        current = current.plus({ months: 1 })
        break
      default:
        return dates
    }
  }

  return dates
}

export function getExpandedExpenses(
  expenses: Expense[],
  occurrences: ExpenseOccurrence[],
  windowStart: DateTime,
  windowEnd: DateTime
): ExpandedExpense[] {
  const result: ExpandedExpense[] = []

  for (const expense of expenses) {
    const base = expense.serialize()
    const recurrenceEndDate = expense.recurrenceEndDate
      ? expense.recurrenceEndDate.toSQLDate()!
      : null

    if (expense.recurrenceType === 'none') {
      const expenseDate = expense.date.startOf('day')
      if (expenseDate >= windowStart.startOf('day') && expenseDate <= windowEnd.startOf('day')) {
        result.push({
          id: expense.id,
          userId: expense.userId,
          type: expense.type,
          amount: Number(expense.amount),
          categoryId: expense.categoryId,
          date: expense.date.toSQLDate()!,
          isRecurring: false,
          recurrenceType: 'none',
          recurrenceEndDate: null,
          occurrenceDate: null,
          createdAt: base.createdAt,
          updatedAt: base.updatedAt,
        })
      }
      continue
    }

    // Recurring: expand into occurrences
    const expenseOccurrences = occurrences.filter((o) => o.expenseId === expense.id)
    const occurrenceDates = generateOccurrenceDates(expense, windowStart, windowEnd)

    for (const date of occurrenceDates) {
      const dateStr = date.toSQLDate()!
      const override = expenseOccurrences.find((o) => o.date === dateStr)

      if (override?.status === 'deleted') continue

      result.push({
        id: expense.id,
        userId: expense.userId,
        type: expense.type,
        amount:
          override?.amount !== null && override?.amount !== undefined
            ? Number(override.amount)
            : Number(expense.amount),
        categoryId: override?.categoryId !== undefined ? override.categoryId : expense.categoryId,
        date: dateStr,
        isRecurring: true,
        recurrenceType: expense.recurrenceType,
        recurrenceEndDate,
        occurrenceDate: dateStr,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      })
    }
  }

  return result.sort((a, b) => {
    if (a.date < b.date) return -1
    if (a.date > b.date) return 1
    return 0
  })
}

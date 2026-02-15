import { Typography } from 'antd'
import { WalletOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import type { Expense, ExpenseCategory } from '~/lib/types'
import BaseCalendarView from './base_calendar_view'
import { dayjs } from '~/lib/date_utils'

const { Text } = Typography

interface ExpenseCalendarViewProps {
  expenses: Expense[]
  categories: ExpenseCategory[]
  selectedDate: Dayjs
  onSelect: (date: Dayjs) => void
  balance: number
}

export default function ExpenseCalendarView({
  expenses,
  categories,
  selectedDate,
  onSelect,
  balance,
}: ExpenseCalendarViewProps) {
  const getCategoryColor = (categoryId: number | null): string | null => {
    if (!categoryId) return null
    return categories.find((c) => c.id === categoryId)?.color ?? null
  }

  const getCategoryName = (categoryId: number | null): string | null => {
    if (!categoryId) return null
    return categories.find((c) => c.id === categoryId)?.name ?? null
  }

  const balanceColor = balance >= 0 ? '#3b82f6' : '#ef4444'

  const balanceChip = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 12px',
        borderRadius: '16px',
        border: `1.5px solid ${balanceColor}`,
        background: `${balanceColor}12`,
      }}
    >
      <WalletOutlined style={{ color: balanceColor, fontSize: 13 }} />
      <Text strong style={{ color: balanceColor, fontSize: 14 }}>
        {balance >= 0 ? '' : '-'}€
        {Math.abs(balance).toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </div>
  )

  return (
    <BaseCalendarView
      items={expenses}
      selectedDate={selectedDate}
      onSelect={onSelect}
      getItemDate={(expense) => expense.occurrenceDate ?? expense.date}
      headerExtra={balanceChip}
      renderItem={(expense) => {
        if (expense.type === 'adjustment') {
          const signed = Number(expense.amount)
          return (
            <span style={{ fontSize: '11px', color: '#3b82f6', whiteSpace: 'nowrap' }}>
              {signed >= 0 ? '+' : '-'}€{Math.abs(signed).toFixed(2)}
            </span>
          )
        }

        const isIncome = expense.type === 'income'
        const catColor = getCategoryColor(expense.categoryId)
        const catName = getCategoryName(expense.categoryId)
        const color = catColor ?? (isIncome ? '#3b82f6' : '#ef4444')

        return (
          <span style={{ fontSize: '11px', color, whiteSpace: 'nowrap' }}>
            {isIncome ? '+' : '-'}€{Number(expense.amount).toFixed(2)}
            {catName ? ` ${catName}` : ''}
          </span>
        )
      }}
    />
  )
}

export function getDailyNet(expenses: Expense[], date: Dayjs): number {
  return expenses
    .filter((e) => dayjs(e.occurrenceDate ?? e.date).isSame(date, 'day'))
    .reduce((sum, e) => {
      if (e.type === 'income') return sum + Number(e.amount)
      if (e.type === 'expense') return sum - Number(e.amount)
      if (e.type === 'adjustment') return sum + Number(e.amount)
      return sum
    }, 0)
}

import { Layout, Tabs } from 'antd'
import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import { CalendarOutlined, BarChartOutlined, TagOutlined } from '@ant-design/icons'
import Header from '~/components/layout/header'
import CalendarLayout from '~/components/layout/calendar_layout'
import ExpenseCalendarView from '~/components/calendar/expense_calendar_view'
import ExpenseListCard from '~/components/cards/expense_list_card'
import ExpenseFormCard from '~/components/cards/expense_form_card'
import ExpenseAnalytics from '~/components/expenses/expense_analytics'
import ExpenseCategoriesManager from '~/components/expenses/expense_categories_manager'
import type { Expense, ExpenseCategory, User, UserSettings } from '~/lib/types'
import { dayjs, isSameDay } from '~/lib/date_utils'
import type { Dayjs } from 'dayjs'

const { Content } = Layout

export interface ExpensesPageProps {
  user?: User
  expenses: Expense[]
  userSettings: UserSettings
  derivedBalance: number
  balanceAtStartOfMonth: number
  categories: ExpenseCategory[]
  errors?: Record<string, string>
}

export default function ExpensesIndex({
  user,
  expenses,
  derivedBalance,
  balanceAtStartOfMonth,
  categories: initialCategories,
  errors,
}: ExpensesPageProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories)

  useEffect(() => {
    if (initialCategories.length === 0) {
      fetch('/expense-categories', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then((r) => r.json())
        .then((data: ExpenseCategory[]) => setCategories(data))
        .catch(() => {})
    }
  }, [])

  const expensesForSelectedDay = expenses.filter((e) =>
    isSameDay(e.occurrenceDate ?? e.date, selectedDate)
  )

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  const tabItems = [
    {
      key: 'calendrier',
      label: (
        <span>
          <CalendarOutlined /> Calendrier
        </span>
      ),
      children: (
        <CalendarLayout
          extraOffset={46}
          calendarSlot={
            <ExpenseCalendarView
              expenses={expenses}
              categories={categories}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              balance={derivedBalance}
            />
          }
          sidePanel={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <ExpenseListCard
                  expenses={expensesForSelectedDay}
                  categories={categories}
                  selectedDate={selectedDate}
                />
              </div>
              <div style={{ flexShrink: 0 }}>
                <ExpenseFormCard
                  selectedDate={selectedDate}
                  categories={categories}
                  errors={errors}
                />
              </div>
            </div>
          }
        />
      ),
    },
    {
      key: 'statistiques',
      label: (
        <span>
          <BarChartOutlined /> Statistiques
        </span>
      ),
      children: (
        <ExpenseAnalytics
          expenses={expenses}
          categories={categories}
          derivedBalance={derivedBalance}
          balanceAtStartOfMonth={balanceAtStartOfMonth}
        />
      ),
    },
    {
      key: 'categories',
      label: (
        <span>
          <TagOutlined /> Catégories
        </span>
      ),
      children: (
        <ExpenseCategoriesManager categories={categories} onCategoriesChange={setCategories} />
      ),
    },
  ]

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Head title="Dépenses" />
      <Header user={user} currentPath="/expenses" />
      <Content style={{ overflow: 'hidden' }}>
        <Tabs
          defaultActiveKey="calendrier"
          items={tabItems}
          style={{ background: '#fff' }}
          tabBarStyle={{ paddingLeft: '24px', marginBottom: 0 }}
        />
      </Content>
    </Layout>
  )
}

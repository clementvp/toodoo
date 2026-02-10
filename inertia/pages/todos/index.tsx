import { Layout } from 'antd'
import { useState } from 'react'
import Header from '../../components/layout/header'
import CalendarLayout from '../../components/layout/calendar_layout'
import CalendarView from '../../components/calendar/calendar_view'
import TodoListCard from '../../components/cards/todo_list_card'
import TodoFormCard from '../../components/cards/todo_form_card'
import type { Todo, User, UserSettings } from '~/lib/types'
import { dayjs, isSameDay } from '../../lib/date_utils'
import type { Dayjs } from 'dayjs'
import { Head } from '@inertiajs/react'

export interface TodosPageProps {
  user?: User
  todos: Todo[]
  userSettings: UserSettings
  errors?: Record<string, string>
}

export default function TodosIndex({ user, todos, userSettings, errors }: TodosPageProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  const todosForSelectedDay = todos.filter((todo) => isSameDay(todo.dueDate, selectedDate))

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Todo" />
      <Header user={user} currentPath="/todos" />
      <CalendarLayout
        calendarSlot={
          <CalendarView todos={todos} selectedDate={selectedDate} onSelect={handleDateSelect} />
        }
        sidePanel={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TodoListCard todos={todosForSelectedDay} selectedDate={selectedDate} showPrinterButton={userSettings.showPrinterButton} />
            </div>
            <div>
              <TodoFormCard selectedDate={selectedDate} errors={errors} />
            </div>
          </div>
        }
      />
    </Layout>
  )
}

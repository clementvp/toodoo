import { Layout } from 'antd'
import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import Header from '../../components/layout/header'
import CalendarLayout from '../../components/layout/calendar_layout'
import CalendarView from '../../components/calendar/calendar_view'
import TodoListCard from '../../components/cards/todo_list_card'
import TodoFormCard from '../../components/cards/todo_form_card'
import type { Todo, PageProps } from '../../lib/types'
import { dayjs, isSameDay } from '../../lib/date_utils'
import type { Dayjs } from 'dayjs'

interface TodosPageProps extends PageProps {
  todos: Todo[]
}

export default function TodosIndex() {
  const { user, todos } = usePage<TodosPageProps>().props
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  // T058: Filter todos by selected day
  const todosForSelectedDay = todos.filter((todo) => isSameDay(todo.dueDate, selectedDate))

  // T051: Calendar day click handler
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header user={user} currentPath="/todos" />
      <CalendarLayout
        calendarSlot={
          <CalendarView todos={todos} selectedDate={selectedDate} onSelect={handleDateSelect} />
        }
        sidePanel={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TodoListCard todos={todosForSelectedDay} selectedDate={selectedDate} />
            </div>
            <div>
              <TodoFormCard selectedDate={selectedDate} />
            </div>
          </div>
        }
      />
    </Layout>
  )
}

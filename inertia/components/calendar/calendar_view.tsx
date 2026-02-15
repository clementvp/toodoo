import { Badge, theme } from 'antd'
import { RetweetOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import type { Todo } from '~/lib/types'
import BaseCalendarView from './base_calendar_view'

interface CalendarViewProps {
  todos: Todo[]
  selectedDate: Dayjs
  onSelect: (date: Dayjs) => void
}

export default function CalendarView({ todos, selectedDate, onSelect }: CalendarViewProps) {
  const { token } = theme.useToken()

  return (
    <BaseCalendarView
      items={todos}
      selectedDate={selectedDate}
      onSelect={onSelect}
      getItemDate={(todo) => todo.dueDate}
      renderItem={(todo) => (
        <Badge
          status={todo.status === 'Terminé' ? 'default' : 'processing'}
          text={
            <span
              style={{
                fontSize: '11px',
                textDecoration: todo.status === 'Terminé' ? 'line-through' : 'none',
                color: todo.status === 'Terminé' ? token.colorTextDisabled : token.colorText,
                whiteSpace: 'nowrap',
              }}
            >
              {todo.isRecurring && (
                <RetweetOutlined style={{ marginRight: 3, fontSize: 10, color: '#94a3b8' }} />
              )}
              {todo.dueTime ? `${todo.dueTime} ${todo.title}` : todo.title}
            </span>
          }
        />
      )}
    />
  )
}

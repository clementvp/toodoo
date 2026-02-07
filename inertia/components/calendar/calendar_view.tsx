import { Calendar, Badge, Typography, Select, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import { dayjs } from '../../lib/date_utils'
import type { Todo } from '../../lib/types'

interface CalendarViewProps {
  todos: Todo[]
  selectedDate: Dayjs
  onSelect: (date: Dayjs) => void
}

export default function CalendarView({ todos, selectedDate, onSelect }: CalendarViewProps) {
  const { token } = theme.useToken()

  // Get todos for a specific date
  const getTodosForDate = (date: Dayjs): Todo[] => {
    return todos.filter((todo) => dayjs(todo.dueDate).isSame(date, 'day'))
  }

  // Render cell content with todo badges
  const dateCellRender = (value: Dayjs) => {
    const listData = getTodosForDate(value)

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((todo) => (
          <li key={todo.id}>
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
                  {todo.dueTime ? `${todo.dueTime} ${todo.title}` : todo.title}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      style={{
        flex: '0 0 70%',
        background: token.colorBgContainer,
        padding: '24px',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Calendar
        value={selectedDate}
        onSelect={onSelect}
        cellRender={(current, info) =>
          info.type === 'date' ? dateCellRender(current) : info.originNode
        }
        headerRender={({ value, onChange }) => {
          const year = value.year()
          const month = value.month()
          const yearOptions = Array.from({ length: 10 }, (_, i) => ({
            label: `${year - 2 + i}`,
            value: year - 2 + i,
          }))
          const monthOptions = Array.from({ length: 12 }, (_, i) => ({
            label: dayjs().locale('fr').month(i).format('MMMM'),
            value: i,
          }))

          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <Typography.Title level={4} style={{ margin: 0, textTransform: 'capitalize' }}>
                {value.locale('fr').format('MMMM YYYY')}
              </Typography.Title>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Select
                  value={year}
                  options={yearOptions}
                  onChange={(y) => onChange(value.clone().year(y))}
                />
                <Select
                  value={month}
                  style={{ minWidth: '120px', textTransform: 'capitalize' }}
                  options={monthOptions}
                  onChange={(m) => onChange(value.clone().month(m))}
                />
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}

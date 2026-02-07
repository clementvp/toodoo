import { Calendar, Badge, Typography, Select, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import { dayjs } from '../../lib/date_utils'
import type { Note } from '../../lib/types'

interface NoteCalendarViewProps {
  notes: Note[]
  selectedDate: Dayjs
  onSelect: (date: Dayjs) => void
}

export default function NoteCalendarView({ notes, selectedDate, onSelect }: NoteCalendarViewProps) {
  const { token } = theme.useToken()

  // Get notes for a specific date
  const getNotesForDate = (date: Dayjs): Note[] => {
    return notes.filter((note) => dayjs(note.createdAt).isSame(date, 'day'))
  }

  // Render cell content with note badges
  const dateCellRender = (value: Dayjs) => {
    const listData = getNotesForDate(value)

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((note) => (
          <li key={note.id}>
            <Badge
              status="processing"
              color="#F59E0B"
              text={
                <span
                  style={{
                    fontSize: '11px',
                    color: token.colorText,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {note.title}
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

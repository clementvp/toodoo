import { Badge, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import type { Note } from '~/lib/types'
import BaseCalendarView from './base_calendar_view'

interface NoteCalendarViewProps {
  notes: Note[]
  selectedDate: Dayjs
  onSelect: (date: Dayjs) => void
}

export default function NoteCalendarView({ notes, selectedDate, onSelect }: NoteCalendarViewProps) {
  const { token } = theme.useToken()

  return (
    <BaseCalendarView
      items={notes}
      selectedDate={selectedDate}
      onSelect={onSelect}
      getItemDate={(note) => note.dueDate as string}
      renderItem={(note) => (
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
      )}
    />
  )
}

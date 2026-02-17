import { Layout, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import Header from '../../components/layout/header'
import CalendarLayout from '../../components/layout/calendar_layout'
import NoteCalendarView from '../../components/calendar/note_calendar_view'
import NoteListCard from '../../components/cards/note_list_card'
import NoteEditorModal from '../../components/forms/note_editor_modal'
import type { Note, User } from '~/lib/types'
import { dayjs, isSameDay } from '../../lib/date_utils'
import type { Dayjs } from 'dayjs'
import { Head } from '@inertiajs/react'

export interface NotesPageProps {
  user?: User
  notes: Note[]
  errors?: Record<string, string>
}

export default function NotesIndex({ user, notes }: NotesPageProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const notesForSelectedDay = notes.filter((note) => isSameDay(note.dueDate, selectedDate))

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  const handleViewNote = (note: Note) => {
    setSelectedNote(note)
    setEditorOpen(true)
  }

  const handleCreate = () => {
    setSelectedNote(null)
    setEditorOpen(true)
  }

  const handleEditorClose = () => {
    setEditorOpen(false)
    setSelectedNote(null)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Notes" />
      <Header user={user} currentPath="/notes" />
      <CalendarLayout
        calendarSlot={
          <NoteCalendarView notes={notes} selectedDate={selectedDate} onSelect={handleDateSelect} />
        }
        sidePanel={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <NoteListCard
                notes={notesForSelectedDay}
                onViewNote={handleViewNote}
                selectedDate={selectedDate}
              />
            </div>
            <div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={handleCreate}
                style={{ height: 48, fontSize: 15 }}
              >
                Nouvelle note pour le {selectedDate.locale('fr').format('D MMMM YYYY')}
              </Button>
            </div>
          </div>
        }
      />

      <NoteEditorModal
        open={editorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
        selectedDate={selectedDate}
        reloadOnly={['notes']}
      />
    </Layout>
  )
}

import { Layout, Button, Tabs } from 'antd'
import { PlusOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import { useState } from 'react'
import Header from '../../components/layout/header'
import CalendarLayout from '../../components/layout/calendar_layout'
import NoteCalendarView from '../../components/calendar/note_calendar_view'
import NoteListCard from '../../components/cards/note_list_card'
import NoteEditorModal from '../../components/forms/note_editor_modal'
import GlobalNotesView from '../../components/cards/global_notes_view'
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
  const [activeTab, setActiveTab] = useState('calendar')

  const calendarNotes = notes.filter((note) => note.dueDate !== null)
  const notesForSelectedDay = calendarNotes.filter((note) =>
    isSameDay(note.dueDate as string, selectedDate)
  )

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

  const calendarView = (
    <CalendarLayout
      calendarSlot={
        <NoteCalendarView
          notes={calendarNotes}
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
        />
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
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Notes" />
      <Header user={user} currentPath="/notes" />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ paddingLeft: 24, paddingRight: 24, marginBottom: 0, background: '#fff' }}
        items={[
          {
            key: 'calendar',
            label: (
              <span>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Calendrier
              </span>
            ),
            children: calendarView,
          },
          {
            key: 'global',
            label: (
              <span>
                <FileTextOutlined style={{ marginRight: 6 }} />
                Notes globales
              </span>
            ),
            children: <GlobalNotesView notes={notes} />,
          },
        ]}
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

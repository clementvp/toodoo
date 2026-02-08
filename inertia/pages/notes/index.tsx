import { Layout, Modal, Typography, Space, Button } from 'antd'
import { useState } from 'react'
import Header from '../../components/layout/header'
import CalendarLayout from '../../components/layout/calendar_layout'
import NoteCalendarView from '../../components/calendar/note_calendar_view'
import NoteListCard from '../../components/cards/note_list_card'
import NoteFormCard from '../../components/cards/note_form_card'
import type { Note, User } from '~/lib/types'
import { dayjs, isSameDay } from '../../lib/date_utils'
import type { Dayjs } from 'dayjs'
import {Head} from "@inertiajs/react";

const { Paragraph } = Typography

export interface NotesPageProps {
  user?: User
  notes: Note[]
  errors?: Record<string, string>
}

export default function NotesIndex({ user, notes, errors }: NotesPageProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // T077: Filter notes by selected day
  const notesForSelectedDay = notes.filter((note) => isSameDay(note.createdAt, selectedDate))

  // T070: Calendar day click handler
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  // T071: Note title click handler to display modal
  const handleViewNote = (note: Note) => {
    setSelectedNote(note)
    setModalVisible(true)
  }

  // T079: Modal close returns to calendar with same day selected
  const handleModalClose = () => {
    setModalVisible(false)
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
              <NoteFormCard selectedDate={selectedDate} errors={errors} />
            </div>
          </div>
        }
      />

      {/* T072: Modal for note detail view */}
      <Modal
        title={selectedNote?.title}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Fermer
          </Button>,
        ]}
        width={600}
      >
        {selectedNote && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedNote.content}</Paragraph>
            <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '16px' }}>
              Créée le : {dayjs(selectedNote.createdAt).locale('fr').format('DD MMMM YYYY')}
            </Paragraph>
          </Space>
        )}
      </Modal>
    </Layout>
  )
}

import { Card, List, Button, Empty, Typography, Modal } from 'antd'
import { DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Note } from '~/lib/types'
import type { Dayjs } from 'dayjs'

const { Paragraph } = Typography

interface NoteListCardProps {
  notes: Note[]
  onViewNote: (note: Note) => void
  selectedDate: Dayjs
}

export default function NoteListCard({ notes, onViewNote, selectedDate }: NoteListCardProps) {
  const handleDelete = (note: Note) => {
    Modal.confirm({
      title: 'Supprimer cette note ?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Voulez-vous vraiment supprimer la note :</p>
          <p style={{ fontWeight: 'bold', marginTop: '8px' }}>"{note.title}"</p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
            Cette action est irréversible.
          </p>
        </div>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        router.delete(`/notes/${note.id}`, {
          preserveScroll: true,
        })
      },
    })
  }

  const formattedDate = selectedDate.locale('fr').format('D MMMM YYYY')

  return (
    <Card
      title={`Notes du ${formattedDate}`}
      style={{
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        },
      }}
    >
      {notes.length === 0 ? (
        <Empty description="Aucune note pour ce jour" />
      ) : (
        <List
          dataSource={notes}
          renderItem={(note) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => onViewNote(note)}
                >
                  Voir
                </Button>,
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(note)}
                >
                  Supprimer
                </Button>,
              ]}
            >
              <List.Item.Meta title={note.title} />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

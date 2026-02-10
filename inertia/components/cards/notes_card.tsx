import { useState } from 'react'
import { Card, List, Empty, Button, Modal, Typography, Space } from 'antd'
import {
  FileTextOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Note } from '~/lib/types'
import { dayjs } from '~/lib/date_utils'
import NoteForm from '../forms/note_form'

const { Paragraph } = Typography

interface NotesCardProps {
  notes: Note[]
}

export default function NotesCard({ notes }: NotesCardProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)

  const handleViewNote = (note: Note) => {
    setSelectedNote(note)
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
    setSelectedNote(null)
  }

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
          only: ['notesToday'],
        })
      },
    })
  }

  const renderContent = () => {
    if (notes.length === 0) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune note créée aujourd'hui" />
      )
    }

    return (
      <List
        dataSource={notes}
        renderItem={(note) => (
          <List.Item
            actions={[
              <Button
                key="view"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewNote(note)}
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
    )
  }

  return (
    <>
      <Card
        title={
          <span>
            <FileTextOutlined /> Notes du jour
          </span>
        }
        extra={
          <Button
            type="text"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => setCreateModalVisible(true)}
          />
        }
        variant="borderless"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, overflow: 'auto' } }}
      >
        {renderContent()}
      </Card>

      <Modal
        title={selectedNote?.title}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Fermer
          </Button>,
        ]}
        width={800}
      >
        {selectedNote && (
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedNote.content}</Paragraph>
            <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: '16px' }}>
              Date : {dayjs(selectedNote.dueDate).locale('fr').format('DD MMMM YYYY')}
            </Paragraph>
          </Space>
        )}
      </Modal>

      <Modal
        title="Créer une note"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <NoteForm selectedDate={dayjs()} onSuccess={() => setCreateModalVisible(false)} />
      </Modal>
    </>
  )
}

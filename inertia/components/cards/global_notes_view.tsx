import { useState } from 'react'
import { Button, Input, Table, Modal, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { TableColumnsType, SorterResult } from 'antd/es/table/interface'
import type { Note } from '~/lib/types'
import { dayjs } from '~/lib/date_utils'
import NoteEditorModal from '../forms/note_editor_modal'

interface GlobalNotesViewProps {
  notes: Note[]
}

export default function GlobalNotesView({ notes }: GlobalNotesViewProps) {
  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const globalNotes = notes.filter((n) => !n.dueDate)

  const filtered = globalNotes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  )

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
          only: ['notes'],
        })
      },
    })
  }

  const columns: TableColumnsType<Note> = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Note) => (
        <a
          onClick={() => handleViewNote(record)}
          style={{ color: '#1a1a1a', fontWeight: 500 }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Créée le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: Note, b: Note) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (value: string) => dayjs(value).locale('fr').format('D MMM YYYY, HH:mm'),
    },
    {
      title: 'Modifiée le',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      defaultSortOrder: 'descend',
      sorter: (a: Note, b: Note) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      render: (value: string) => dayjs(value).locale('fr').format('D MMM YYYY, HH:mm'),
    },
    {
      title: '',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: Note) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewNote(record)}
          >
            Voir
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder="Rechercher par titre…"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nouvelle note globale
        </Button>
      </Space>

      <Table<Note>
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleViewNote(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
        locale={{ emptyText: 'Aucune note globale' }}
      />

      <NoteEditorModal
        open={editorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
        reloadOnly={['notes']}
      />
    </div>
  )
}

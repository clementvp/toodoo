import { useState, useMemo } from 'react'
import { Button, Input, Modal, Typography, Empty, Select, Tooltip } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Note } from '~/lib/types'
import { dayjs } from '~/lib/date_utils'
import NoteEditorModal from '../forms/note_editor_modal'

interface GlobalNotesViewProps {
  notes: Note[]
}

type SortField = 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim()
}

export default function GlobalNotesView({ notes }: GlobalNotesViewProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const globalNotes = useMemo(() => notes.filter((n) => !n.dueDate), [notes])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = q ? globalNotes.filter((n) => n.title.toLowerCase().includes(q)) : globalNotes
    return [...list].sort((a, b) => {
      const diff = dayjs(a[sortField]).valueOf() - dayjs(b[sortField]).valueOf()
      return sortOrder === 'asc' ? diff : -diff
    })
  }, [globalNotes, search, sortField, sortOrder])

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

  const handleDelete = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
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

  return (
    <div style={{ padding: '24px' }}>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Rechercher une note…"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 220px', maxWidth: 360 }}
        />
        <Select
          value={`${sortField}-${sortOrder}`}
          onChange={(val) => {
            const [field, order] = val.split('-') as [SortField, SortOrder]
            setSortField(field)
            setSortOrder(order)
          }}
          style={{ width: 210 }}
          options={[
            { label: 'Modifiée — récente en premier', value: 'updatedAt-desc' },
            { label: 'Modifiée — ancienne en premier', value: 'updatedAt-asc' },
            { label: 'Créée — récente en premier', value: 'createdAt-desc' },
            { label: 'Créée — ancienne en premier', value: 'createdAt-asc' },
          ]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{ marginLeft: 'auto' }}
        >
          Nouvelle note
        </Button>
      </div>

      {/* ── Grid ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Empty description="Aucune note globale" style={{ marginTop: 64 }} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onView={handleViewNote}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <NoteEditorModal
        open={editorOpen}
        onClose={handleEditorClose}
        note={selectedNote}
        reloadOnly={['notes']}
      />
    </div>
  )
}

// ── NoteCard ───────────────────────────────────────────────────────────────────
interface NoteCardProps {
  note: Note
  onView: (note: Note) => void
  onDelete: (e: React.MouseEvent, note: Note) => void
}

function NoteCard({ note, onView, onDelete }: NoteCardProps) {
  const [hovered, setHovered] = useState(false)
  const preview = stripMarkdown(note.content).slice(0, 120)

  return (
    <div
      onClick={() => onView(note)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: hovered ? '#1a1a1a' : '#e2e8f0',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.10)'
          : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 160,
      }}
    >
      {/* Title */}
      <Typography.Text
        strong
        style={{
          fontSize: 15,
          color: '#0f172a',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {note.title}
      </Typography.Text>

      {/* Preview */}
      <Typography.Text
        style={{
          fontSize: 13,
          color: '#64748b',
          lineHeight: 1.55,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {preview || <span style={{ fontStyle: 'italic' }}>Note vide</span>}
      </Typography.Text>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 4,
        }}
      >
        <Tooltip title={`Créée le ${dayjs(note.createdAt).locale('fr').format('D MMM YYYY, HH:mm')}`}>
          <Typography.Text
            style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ClockCircleOutlined />
            {dayjs(note.updatedAt).locale('fr').fromNow()}
          </Typography.Text>
        </Tooltip>

        <div
          style={{
            display: 'flex',
            gap: 4,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Voir">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(note)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => onDelete(e, note)}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

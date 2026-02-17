import { useState, useMemo } from 'react'
import { Button, Input, Modal, Form, Typography, Empty, Tooltip } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Bookmark } from '~/lib/types'
import { dayjs } from '~/lib/date_utils'

interface BookmarksViewProps {
  bookmarks: Bookmark[]
}

type SortOrder = 'asc' | 'desc'

const isFavicon = (url: string) => url.includes('google.com/s2/favicons')

// ── SortButton ──────────────────────────────────────────────────────────────────
interface SortButtonProps {
  label: string
  active: boolean
  order: SortOrder
  onClick: () => void
}

function SortButton({ label, active, order, onClick }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 6,
        border: '1px solid',
        borderColor: active ? '#1a1a1a' : '#e2e8f0',
        background: active ? '#1a1a1a' : '#fff',
        color: active ? '#fff' : '#64748b',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        lineHeight: 1,
      }}
    >
      {label}
      {active ? (
        order === 'desc' ? (
          <ArrowDownOutlined style={{ fontSize: 11 }} />
        ) : (
          <ArrowUpOutlined style={{ fontSize: 11 }} />
        )
      ) : (
        <ArrowDownOutlined style={{ fontSize: 11, opacity: 0.3 }} />
      )}
    </button>
  )
}

// ── BookmarkCard ────────────────────────────────────────────────────────────────
interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete: (bookmark: Bookmark) => void
}

function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const [hovered, setHovered] = useState(false)

  const hasOgImage = bookmark.imageUrl && !isFavicon(bookmark.imageUrl)
  const faviconUrl = bookmark.imageUrl && isFavicon(bookmark.imageUrl) ? bookmark.imageUrl : null

  const displayTitle = bookmark.title ?? bookmark.url

  let hostname = bookmark.url
  try {
    hostname = new URL(bookmark.url).hostname
  } catch {
    // keep raw url
  }

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: hovered ? '#1a1a1a' : '#e2e8f0',
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.18s ease',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
      >
        {/* Cover image */}
        {hasOgImage ? (
          <div style={{ height: 140, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
            <img
              src={bookmark.imageUrl!}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                ;(e.currentTarget.parentElement as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div
            style={{
              height: 72,
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {faviconUrl ? (
              <img src={faviconUrl} alt="" style={{ width: 32, height: 32 }} />
            ) : (
              <LinkOutlined style={{ fontSize: 22, color: '#cbd5e1' }} />
            )}
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flex: 1,
          }}
        >
          <Typography.Text
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#0f172a',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {displayTitle}
          </Typography.Text>

          <Typography.Text style={{ fontSize: 12, color: '#94a3b8' }}>{hostname}</Typography.Text>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onClick={(e) => e.preventDefault()}
        >
          <Typography.Text style={{ fontSize: 12, color: '#94a3b8' }}>
            {dayjs(bookmark.createdAt).locale('fr').fromNow()}
          </Typography.Text>

          <Tooltip title="Supprimer">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.15s ease' }}
              onClick={(e) => {
                e.preventDefault()
                onDelete(bookmark)
              }}
            />
          </Tooltip>
        </div>
      </div>
    </a>
  )
}

// ── AddBookmarkModal ────────────────────────────────────────────────────────────
interface AddBookmarkModalProps {
  open: boolean
  onClose: () => void
}

function AddBookmarkModal({ open, onClose }: AddBookmarkModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: { url: string }) => {
    setLoading(true)
    router.post(
      '/bookmarks',
      { url: values.url },
      {
        onSuccess: () => {
          form.resetFields()
          setLoading(false)
          onClose()
        },
        onError: () => {
          setLoading(false)
        },
        only: ['bookmarks'],
      }
    )
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Ajouter un bookmark"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Form.Item label="URL" name="url" rules={[{ required: true, message: 'Entrez une URL' }]}>
          <Input placeholder="https://example.com" maxLength={2048} autoFocus size="large" />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Annuler
          </Button>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loading}>
            Ajouter
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

// ── BookmarksView ───────────────────────────────────────────────────────────────
export default function BookmarksView({ bookmarks }: BookmarksViewProps) {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = q
      ? bookmarks.filter(
          (b) => (b.title ?? '').toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
        )
      : bookmarks
    return [...list].sort((a, b) => {
      const diff = dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
      return sortOrder === 'asc' ? diff : -diff
    })
  }, [bookmarks, search, sortOrder])

  const handleDelete = (bookmark: Bookmark) => {
    Modal.confirm({
      title: 'Supprimer ce bookmark ?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Voulez-vous vraiment supprimer :</p>
          <p style={{ fontWeight: 'bold', marginTop: 8 }}>"{bookmark.title ?? bookmark.url}"</p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
            Cette action est irréversible.
          </p>
        </div>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        router.delete(`/bookmarks/${bookmark.id}`, {
          preserveScroll: true,
          only: ['bookmarks'],
        })
      },
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* ── Toolbar ──────────────────────────────────────────────── */}
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
          placeholder="Rechercher un bookmark…"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 220px', maxWidth: 360 }}
        />

        <div style={{ display: 'flex', gap: 6 }}>
          <SortButton
            label="Plus récents"
            active={sortOrder === 'desc'}
            order={sortOrder}
            onClick={() => setSortOrder('desc')}
          />
          <SortButton
            label="Plus anciens"
            active={sortOrder === 'asc'}
            order={sortOrder}
            onClick={() => setSortOrder('asc')}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
          style={{ marginLeft: 'auto' }}
        >
          Ajouter
        </Button>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Empty description="Aucun bookmark" style={{ marginTop: 64 }} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AddBookmarkModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

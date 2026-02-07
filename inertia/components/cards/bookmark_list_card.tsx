import { router } from '@inertiajs/react'
import { Card, List, Empty, Button, Modal } from 'antd'
import { LinkOutlined, DeleteOutlined } from '@ant-design/icons'
import type { Bookmark } from '~/lib/types'

interface BookmarkListCardProps {
  bookmarks: Bookmark[]
}

export default function BookmarkListCard({ bookmarks }: BookmarkListCardProps) {
  const handleDelete = (bookmark: Bookmark) => {
    Modal.confirm({
      title: 'Supprimer ce bookmark ?',
      content: `Êtes-vous sûr de vouloir supprimer "${bookmark.url}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        router.delete(`/bookmarks/${bookmark.id}`)
      },
    })
  }

  return (
    <Card title="Mes bookmarks">
      {bookmarks.length === 0 ? (
        <Empty description="Aucun bookmark" />
      ) : (
        <List
          dataSource={bookmarks}
          renderItem={(bookmark) => (
            <List.Item
              actions={[
                <a
                  key="open"
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button type="text" icon={<LinkOutlined />}>
                    Ouvrir
                  </Button>
                </a>,
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(bookmark)}
                >
                  Supprimer
                </Button>,
              ]}
            >
              <List.Item.Meta title={bookmark.url} description={new Date(bookmark.createdAt).toLocaleString('fr-FR')} />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

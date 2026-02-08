import { Layout } from 'antd'
import { Head } from '@inertiajs/react'
import Header from '../../components/layout/header'
import BookmarkFormCard from '../../components/cards/bookmark_form_card'
import BookmarkListCard from '../../components/cards/bookmark_list_card'
import type { Bookmark, User } from '~/lib/types'

const { Content } = Layout

export interface BookmarksPageProps {
  user?: User
  bookmarks: Bookmark[]
}

export default function BookmarksIndex({ user, bookmarks }: BookmarksPageProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Bookmarks" />
      <Header user={user} currentPath="/bookmarks" />
      <Content
        style={{
          padding: '24px',
          height: 'calc(100vh - 64px)',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '16px',
            height: '100%',
          }}
          className="bookmarks-layout"
        >
          <div
            style={{
              flex: '1',
              minWidth: 0,
              height: '100%',
            }}
          >
            <BookmarkListCard bookmarks={bookmarks} />
          </div>

          <div
            style={{
              flex: '0 0 calc(30% - 16px)',
              minWidth: '300px',
              height: '100%',
            }}
            className="form-panel"
          >
            <BookmarkFormCard />
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .bookmarks-layout {
              flex-direction: column;
            }
            .form-panel {
              flex: 1 1 100% !important;
            }
          }
        `}</style>
      </Content>
    </Layout>
  )
}

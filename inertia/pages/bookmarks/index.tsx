import { Layout } from 'antd'
import { Head, usePage } from '@inertiajs/react'
import Header from '../../components/layout/header'
import BookmarkFormCard from '../../components/cards/bookmark_form_card'
import BookmarkListCard from '../../components/cards/bookmark_list_card'
import type { Bookmark, PageProps } from '../../lib/types'

interface BookmarksPageProps extends PageProps {
  bookmarks: Bookmark[]
}

export default function BookmarksIndex() {
  const { user, bookmarks } = usePage<BookmarksPageProps>().props

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Bookmarks" />
      <Header user={user} currentPath="/bookmarks" />
      <Layout.Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Bookmarks</h1>
          <BookmarkFormCard />
          <BookmarkListCard bookmarks={bookmarks} />
        </div>
      </Layout.Content>
    </Layout>
  )
}

import { Layout } from 'antd'
import { Head } from '@inertiajs/react'
import Header from '../../components/layout/header'
import BookmarksView from '../../components/cards/bookmark_list_card'
import type { Bookmark, User } from '~/lib/types'

export interface BookmarksPageProps {
  user?: User
  bookmarks: Bookmark[]
}

export default function BookmarksIndex({ user, bookmarks }: BookmarksPageProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Bookmarks" />
      <Header user={user} currentPath="/bookmarks" />
      <BookmarksView bookmarks={bookmarks} />
    </Layout>
  )
}

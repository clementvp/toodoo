import { Link, router } from '@inertiajs/react'
import { Layout, Button, Drawer, Space, Divider } from 'antd'
import {
  HomeOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  BookOutlined,
  WalletOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import type { User } from '~/lib/types'

const { Header: AntHeader } = Layout

interface HeaderProps {
  user?: User
  currentPath?: string
}

export default function Header({ user, currentPath }: HeaderProps) {
  const [drawerVisible, setDrawerVisible] = useState(false)

  const handleLogout = () => {
    router.post('/logout')
    setDrawerVisible(false)
  }

  return (
    <>
      <AntHeader
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              color: '#1a1a1a',
              fontSize: '20px',
              fontWeight: 'bold',
              textDecoration: 'none',
            }}
          >
            <HomeOutlined /> Toudoux
          </Link>
          {user && (
            <>
              <Link href="/">
                <Button
                  type="text"
                  icon={<DashboardOutlined />}
                  style={{
                    borderBottom:
                      currentPath === '/' ? '2px solid #1a1a1a' : '2px solid transparent',
                    borderRadius: 0,
                    fontWeight: currentPath === '/' ? 600 : 400,
                  }}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/todos">
                <Button
                  type="text"
                  icon={<CheckSquareOutlined />}
                  style={{
                    borderBottom:
                      currentPath === '/todos' ? '2px solid #1a1a1a' : '2px solid transparent',
                    borderRadius: 0,
                    fontWeight: currentPath === '/todos' ? 600 : 400,
                  }}
                >
                  Tâches
                </Button>
              </Link>
              <Link href="/notes">
                <Button
                  type="text"
                  icon={<FileTextOutlined />}
                  style={{
                    borderBottom:
                      currentPath === '/notes' ? '2px solid #1a1a1a' : '2px solid transparent',
                    borderRadius: 0,
                    fontWeight: currentPath === '/notes' ? 600 : 400,
                  }}
                >
                  Notes
                </Button>
              </Link>
              <Link href="/expenses">
                <Button
                  type="text"
                  icon={<WalletOutlined />}
                  style={{
                    borderBottom:
                      currentPath === '/expenses' ? '2px solid #1a1a1a' : '2px solid transparent',
                    borderRadius: 0,
                    fontWeight: currentPath === '/expenses' ? 600 : 400,
                  }}
                >
                  Dépenses
                </Button>
              </Link>
              <Link href="/bookmarks">
                <Button
                  type="text"
                  icon={<BookOutlined />}
                  style={{
                    borderBottom:
                      currentPath === '/bookmarks' ? '2px solid #1a1a1a' : '2px solid transparent',
                    borderRadius: 0,
                    fontWeight: currentPath === '/bookmarks' ? 600 : 400,
                  }}
                >
                  Bookmarks
                </Button>
              </Link>
            </>
          )}
        </div>

        {user && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ fontSize: '20px' }}
          />
        )}
      </AntHeader>

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>
                  Connecté en tant que
                </div>
                <div style={{ fontWeight: 500 }}>{user?.email}</div>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <Button
                type="default"
                icon={<SettingOutlined />}
                block
                size="large"
                onClick={() => {
                  router.visit('/settings')
                  setDrawerVisible(false)
                }}
              >
                Paramètres
              </Button>

              {user?.role === 'admin' && (
                <Button
                  type="default"
                  icon={<UserOutlined />}
                  block
                  size="large"
                  onClick={() => {
                    router.visit('/admin/users')
                    setDrawerVisible(false)
                  }}
                >
                  Administration
                </Button>
              )}
            </Space>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              block
              size="large"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

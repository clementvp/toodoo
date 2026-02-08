import { Layout, Row, Col } from 'antd'
import { Head } from '@inertiajs/react'
import type { DashboardProps } from '~/lib/types'
import Header from '~/components/layout/header'
import DateTimeCard from '~/components/cards/datetime_card'
import WeatherCard from '~/components/cards/weather_card'
import TodosCard from '~/components/cards/todos_card'
import NotesCard from '~/components/cards/notes_card'

const { Content } = Layout

export default function Dashboard({
  user,
  todosToday,
  notesToday,
  weather,
  userSettings,
}: DashboardProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Tableau de bord" />
      <Header user={user} currentPath="/" />
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ minHeight: 'calc(100vh - 64px - 48px)' }}>
          {/* Sidebar gauche : DateTime + Weather */}
          <Col xs={24} md={24} lg={6} style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <DateTimeCard />
              </div>
              <div style={{ flex: 1 }}>
                <WeatherCard weather={weather} hasCity={!!userSettings.weatherCity} />
              </div>
            </div>
          </Col>

          {/* Colonne centrale : Todos */}
          <Col xs={24} md={12} lg={9} style={{ display: 'flex' }}>
            <div style={{ width: '100%' }}>
              <TodosCard todos={todosToday} />
            </div>
          </Col>

          {/* Colonne droite : Notes */}
          <Col xs={24} md={12} lg={9} style={{ display: 'flex' }}>
            <div style={{ width: '100%' }}>
              <NotesCard notes={notesToday} />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

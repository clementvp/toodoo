import { useState } from 'react'
import { Layout, Card, Form, Input, Button, Alert } from 'antd'
import { Head, router, usePage } from '@inertiajs/react'
import Header from '~/components/layout/header'
import type { User, UserSettings } from '~/lib/types'

const { Content } = Layout

interface SettingsPageProps {
  user?: User
  userSettings: UserSettings
}

export default function SettingsPage({ user, userSettings }: SettingsPageProps) {
  const { props } = usePage()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: { weatherCity?: string }) => {
    setLoading(true)
    router.patch('/settings', values, {
      onFinish: () => setLoading(false),
    })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Paramètres" />
      <Header user={user} currentPath="/settings" />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {props.success && (
            <Alert
              message={props.success as string}
              type="success"
              closable
              style={{ marginBottom: '16px' }}
            />
          )}

          <Card title="Météo" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                weatherCity: userSettings.weatherCity || '',
              }}
            >
              <Form.Item
                label="Ville"
                name="weatherCity"
                help="Entrez le nom de votre ville pour afficher la météo sur le tableau de bord"
              >
                <Input placeholder="Ex: Paris, London, Tokyo" maxLength={100} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Enregistrer
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

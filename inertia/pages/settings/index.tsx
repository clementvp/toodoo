import { useState } from 'react'
import { Layout, Card, Form, Input, Button, Alert, Switch, Typography } from 'antd'
import { Head, router } from '@inertiajs/react'
import Header from '~/components/layout/header'
import type { User, UserSettings } from '~/lib/types'

const { Content } = Layout

interface SettingsPageProps {
  user?: User
  userSettings: UserSettings
  success?: string
}

export default function SettingsPage({ user, userSettings, success }: SettingsPageProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [printerLoading, setPrinterLoading] = useState(false)

  const handleSubmit = async (values: { weatherCity?: string }) => {
    setLoading(true)
    router.patch('/settings', values, {
      onFinish: () => setLoading(false),
    })
  }

  const handlePrinterToggle = (checked: boolean) => {
    setPrinterLoading(true)
    router.patch(
      '/settings',
      { showPrinterButton: checked },
      {
        onFinish: () => setPrinterLoading(false),
      }
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Head title="Paramètres" />
      <Header user={user} currentPath="/settings" />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {success && (
            <Alert title={success} type="success" closable style={{ marginBottom: '16px' }} />
          )}

          <Card title="Imprimante thermique" variant="borderless" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Typography.Text strong>Bouton d'impression</Typography.Text>
                <br />
                <Typography.Text type="secondary">
                  Affiche le bouton d'impression sur la card des tâches. Nécessite une imprimante
                  thermique modèle MXW01.
                </Typography.Text>
              </div>
              <Switch
                checked={userSettings.showPrinterButton}
                loading={printerLoading}
                onChange={handlePrinterToggle}
              />
            </div>
          </Card>

          <Card title="Météo" variant="borderless">
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

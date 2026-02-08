import { Layout, Card, Form, Input, Button, Typography, Alert, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import Header from '../../components/layout/header'

const { Content } = Layout
const { Title, Text } = Typography

export interface LoginPageProps {
  errors?: Record<string, string>
  success?: string | null
  error?: string | null
}

export default function Login({ errors, success, error }: LoginPageProps & Record<string, any>) {
  const [loading, setLoading] = useState(false)

  const onFinish = (values: { email: string; password: string; remember?: boolean }) => {
    setLoading(true)
    router.post('/login', values, {
      onFinish: () => {
        setLoading(false)
      },
    })
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <UserOutlined style={{ fontSize: '48px', color: '#4F46E5' }} />
            <Title level={2} style={{ marginTop: '16px', marginBottom: '8px' }}>
              Bon retour
            </Title>
            <Text type="secondary">Connectez-vous pour accéder à vos tâches et notes</Text>
          </div>

          {/* T037: Form validation error display */}
          {errors && Object.keys(errors).length > 0 && (
            <Alert
              title="Connexion échouée"
              description={Object.values(errors).join(', ')}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {/* Single error message (from controller) */}
          {error && (
            <Alert
              title="Connexion échouée"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {success && (
            <Alert title={success} type="success" showIcon style={{ marginBottom: '16px' }} />
          )}

          <Form name="login" onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Veuillez saisir votre email !' },
                { type: 'email', message: 'Veuillez saisir un email valide !' },
              ]}
              validateStatus={errors?.email ? 'error' : undefined}
              help={errors?.email}
            >
              <Input prefix={<MailOutlined />} placeholder="votre@email.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: 'Veuillez saisir votre mot de passe !' }]}
              validateStatus={errors?.password ? 'error' : undefined}
              help={errors?.password}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Entrez votre mot de passe" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Se souvenir de moi</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Connexion
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}

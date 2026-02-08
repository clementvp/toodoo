import { Layout, Card, Form, Input, Button, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import Header from '../../components/layout/header'

const { Content } = Layout
const { Title, Text } = Typography

export interface RegisterPageProps {
  errors?: Record<string, string>
  success?: string
}

export default function Register({ errors, success }: RegisterPageProps) {
  const [loading, setLoading] = useState(false)

  const onFinish = (values: { email: string; password: string }) => {
    setLoading(true)
    router.post('/register', values, {
      onFinish: () => setLoading(false),
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
              Créer un compte
            </Title>
            <Text type="secondary">
              Inscrivez-vous pour commencer à organiser vos tâches et notes
            </Text>
          </div>

          {/* T036: Form validation error display */}
          {errors && Object.keys(errors).length > 0 && (
            <Alert
              title="Erreur de validation"
              description={Object.values(errors).join(', ')}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {success && (
            <Alert title={success} type="success" showIcon style={{ marginBottom: '16px' }} />
          )}

          <Form name="register" onFinish={onFinish} layout="vertical" size="large">
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
              rules={[
                { required: true, message: 'Veuillez saisir votre mot de passe !' },
                { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères !' },
              ]}
              validateStatus={errors?.password ? 'error' : undefined}
              help={errors?.password}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Minimum 8 caractères" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Créer un compte
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" style={{ color: '#4F46E5' }}>
                  Connectez-vous ici
                </Link>
              </Text>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}

import { Head, router } from '@inertiajs/react'
import { Layout, Form, Input, Button, Card, Typography } from 'antd'
import { UserAddOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import Header from '../../../components/layout/header'
import type { User } from '~/lib/types'

const { Title } = Typography

export interface CreateUserPageProps {
  user?: User
  errors?: Record<string, string>
}

export default function CreateUser({ user, errors }: CreateUserPageProps) {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    router.post('/admin/users', values)
  }

  return (
    <>
      <Head title="Créer un utilisateur" />

      <Layout style={{ minHeight: '100vh' }}>
        <Header user={user} currentPath="/admin/users" />

        <Layout.Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.visit('/admin/users')}
              style={{ marginBottom: '16px' }}
            >
              Retour à la liste
            </Button>

            <Card>
              <Title level={2}>Créer un nouvel utilisateur</Title>

              <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "L'email est requis" },
                    { type: 'email', message: 'Email invalide' },
                  ]}
                  validateStatus={errors?.email ? 'error' : undefined}
                  help={errors?.email}
                >
                  <Input placeholder="utilisateur@example.com" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mot de passe"
                  rules={[
                    { required: true, message: 'Le mot de passe est requis' },
                    { min: 8, message: 'Minimum 8 caractères' },
                  ]}
                  validateStatus={errors?.password ? 'error' : undefined}
                  help={errors?.password}
                >
                  <Input.Password placeholder="Minimum 8 caractères" />
                </Form.Item>

                <Form.Item
                  name="passwordConfirmation"
                  label="Confirmer le mot de passe"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Confirmez le mot de passe' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirmer le mot de passe" />
                </Form.Item>

                <Form.Item style={{ marginTop: '32px' }}>
                  <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} block>
                    Créer l'utilisateur
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </Layout.Content>
      </Layout>
    </>
  )
}

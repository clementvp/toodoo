import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Card, Form, Input, Button, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function BookmarkFormCard() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (values: { url: string }) => {
    setLoading(true)
    setError(null)

    router.post(
      '/bookmarks',
      { url: values.url },
      {
        onSuccess: () => {
          form.resetFields()
          setLoading(false)
        },
        onError: (errors) => {
          setError(errors.url || 'Une erreur est survenue')
          setLoading(false)
        },
      }
    )
  }

  return (
    <Card
      title="Ajouter un bookmark"
      style={{
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        height: 'fit-content',
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {error && <Alert title={error} type="error" closable style={{ marginBottom: 16 }} />}

        <Form.Item
          label="URL ou texte"
          name="url"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input placeholder="https://example.com" maxLength={2048} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loading} block>
            Ajouter
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

import { Card, Form, Input, Button, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { toISODate } from '~/lib/date_utils'
import type { Dayjs } from 'dayjs'

interface NoteFormCardProps {
  selectedDate: Dayjs
  errors?: Record<string, string>
}

export default function NoteFormCard({ selectedDate, errors }: NoteFormCardProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const formattedDate = selectedDate.locale('fr').format('D MMMM YYYY')

  const onFinish = (values: any) => {
    setLoading(true)
    router.post(
      '/notes',
      {
        title: values.title,
        content: values.content,
        createdAt: toISODate(selectedDate),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          form.resetFields()
        },
        onFinish: () => setLoading(false),
      }
    )
  }

  return (
    <Card
      title={`Créer une note pour le ${formattedDate}`}
      style={{
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      {errors && Object.keys(errors).length > 0 && (
        <Alert
          title="Erreur de validation"
          description={Object.values(errors).join(', ')}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
          closable
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Titre"
          rules={[{ required: true, message: 'Le titre est requis' }]}
          validateStatus={errors?.title ? 'error' : undefined}
          help={errors?.title}
        >
          <Input placeholder="Titre de la note" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Contenu"
          rules={[{ required: true, message: 'Le contenu est requis' }]}
          validateStatus={errors?.content ? 'error' : undefined}
          help={errors?.content}
        >
          <Input.TextArea rows={6} placeholder="Écrivez votre note ici..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} loading={loading}>
            Ajouter une note
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

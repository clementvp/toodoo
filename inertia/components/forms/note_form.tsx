import { Form, Input, Button, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { toISODate } from '~/lib/date_utils'
import type { Dayjs } from 'dayjs'

interface NoteFormProps {
  selectedDate: Dayjs
  errors?: Record<string, string>
  onSuccess?: () => void
}

export default function NoteForm({ selectedDate, errors, onSuccess }: NoteFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = (values: any) => {
    setLoading(true)
    router.post(
      '/notes',
      {
        title: values.title,
        content: values.content,
        dueDate: toISODate(selectedDate),
      },
      {
        preserveScroll: true,
        only: ['notesToday'],
        onSuccess: () => {
          form.resetFields()
          onSuccess?.()
        },
        onFinish: () => setLoading(false),
      }
    )
  }

  return (
    <>
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
    </>
  )
}

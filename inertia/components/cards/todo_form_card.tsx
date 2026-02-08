import { Card, Form, Input, Button, TimePicker, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { toISODate } from '~/lib/date_utils'
import type { Dayjs } from 'dayjs'

interface TodoFormCardProps {
  selectedDate: Dayjs
  errors?: Record<string, string>
}

export default function TodoFormCard({ selectedDate, errors }: TodoFormCardProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dueTime, setDueTime] = useState<Dayjs | null>(null)
  const formattedDate = selectedDate.locale('fr').format('D MMMM YYYY')

  const onFinish = (values: any) => {
    setLoading(true)
    router.post(
      '/todos',
      {
        title: values.title,
        description: values.description,
        dueDate: toISODate(selectedDate),
        dueTime: dueTime ? dueTime.format('HH:mm') : null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          form.resetFields()
          setDueTime(null)
        },
        onFinish: () => setLoading(false),
      }
    )
  }

  return (
    <Card
      title={`Créer une tâche pour le ${formattedDate}`}
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
          label="Titre"
          required
          validateStatus={errors?.title ? 'error' : undefined}
          help={errors?.title}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Form.Item
              name="title"
              noStyle
              rules={[{ required: true, message: 'Le titre est requis' }]}
            >
              <Input placeholder="Qu'avez-vous à faire ?" style={{ flex: 1 }} />
            </Form.Item>
            <TimePicker
              format="HH:mm"
              placeholder="Heure"
              value={dueTime}
              onChange={setDueTime}
              needConfirm={false}
              showNow={false}
              style={{ width: '120px' }}
            />
          </div>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description (optionnel)"
          validateStatus={errors?.description ? 'error' : undefined}
          help={errors?.description}
        >
          <Input.TextArea rows={3} placeholder="Ajoutez plus de détails..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block icon={<PlusOutlined />} loading={loading}>
            Ajouter une tâche
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

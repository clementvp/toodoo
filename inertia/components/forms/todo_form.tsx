import { Form, Input, Button, TimePicker, Alert, Select, DatePicker } from 'antd'
import { PlusOutlined, RetweetOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { toISODate } from '~/lib/date_utils'
import { PRIORITY_OPTIONS, PRIORITY_COLOR } from '~/lib/todo_priority'
import { RECURRENCE_LABELS } from '~/lib/types'
import type { RecurrenceType } from '~/lib/types'
import type { Dayjs } from 'dayjs'

interface TodoFormProps {
  selectedDate: Dayjs
  errors?: Record<string, string>
  onSuccess?: () => void
  reloadOnly?: string[]
}

const RECURRENCE_OPTIONS = (Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((value) => ({
  value,
  label:
    value === 'none' ? (
      RECURRENCE_LABELS[value]
    ) : (
      <span>
        <RetweetOutlined style={{ marginRight: 6 }} />
        {RECURRENCE_LABELS[value]}
      </span>
    ),
}))

export default function TodoForm({
  selectedDate,
  errors,
  onSuccess,
  reloadOnly = ['todosToday'],
}: TodoFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dueTime, setDueTime] = useState<Dayjs | null>(null)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const onFinish = (values: any) => {
    setLoading(true)
    router.post(
      '/todos',
      {
        title: capitalize(values.title),
        description: values.description ? capitalize(values.description) : values.description,
        dueDate: toISODate(selectedDate),
        dueTime: dueTime ? dueTime.format('HH:mm') : null,
        priority: values.priority,
        recurrenceType: values.recurrenceType || 'none',
        recurrenceEndDate: values.recurrenceEndDate
          ? values.recurrenceEndDate.format('YYYY-MM-DD')
          : null,
      },
      {
        preserveScroll: true,
        only: reloadOnly,
        onSuccess: () => {
          form.resetFields()
          setDueTime(null)
          setRecurrenceType('none')
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

        <Form.Item name="priority" label="Priorité" initialValue="Basse">
          <Select
            options={PRIORITY_OPTIONS.map((opt) => ({
              value: opt.value,
              label: (
                <span style={{ color: PRIORITY_COLOR[opt.value as keyof typeof PRIORITY_COLOR] }}>
                  ● {opt.label}
                </span>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item name="recurrenceType" label="Répétition" initialValue="none">
          <Select
            options={RECURRENCE_OPTIONS}
            onChange={(val: RecurrenceType) => {
              setRecurrenceType(val)
              if (val === 'none') form.setFieldValue('recurrenceEndDate', undefined)
            }}
          />
        </Form.Item>

        {recurrenceType !== 'none' && (
          <Form.Item name="recurrenceEndDate" label="Répéter jusqu'au (optionnel)">
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Sans date de fin"
              style={{ width: '100%' }}
              disabledDate={(d) => d.isBefore(selectedDate, 'day')}
            />
          </Form.Item>
        )}

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
    </>
  )
}

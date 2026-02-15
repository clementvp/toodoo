import { useState } from 'react'
import { Form, Radio, InputNumber, Button, Select, DatePicker } from 'antd'
import { RetweetOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Dayjs } from 'dayjs'
import type { ExpenseCategory, RecurrenceType } from '~/lib/types'

interface ExpenseFormProps {
  selectedDate: Dayjs
  categories: ExpenseCategory[]
  onSuccess?: () => void
  errors?: Record<string, string>
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Ne pas répéter' },
  { value: 'daily', label: 'Chaque jour' },
  { value: 'weekly', label: 'Chaque semaine' },
  { value: 'monthly', label: 'Chaque mois' },
]

export default function ExpenseForm({
  selectedDate,
  categories,
  onSuccess,
  errors,
}: ExpenseFormProps) {
  const [form] = Form.useForm()
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')

  const handleSubmit = (values: {
    type: 'income' | 'expense'
    amount: number
    categoryId?: number
    recurrenceType?: RecurrenceType
    recurrenceEndDate?: Dayjs
  }) => {
    router.post(
      '/expenses',
      {
        type: values.type,
        amount: values.amount,
        categoryId: values.categoryId ?? null,
        date: selectedDate.format('YYYY-MM-DD'),
        recurrenceType: values.recurrenceType ?? 'none',
        recurrenceEndDate: values.recurrenceEndDate
          ? values.recurrenceEndDate.format('YYYY-MM-DD')
          : null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          form.resetFields()
          setRecurrenceType('none')
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ type: 'expense', recurrenceType: 'none' }}
    >
      <Form.Item name="type" label="Type">
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="expense" style={{ color: '#ef4444' }}>
            Sortie
          </Radio.Button>
          <Radio.Button value="income" style={{ color: '#3b82f6' }}>
            Entrée
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="amount"
        label="Montant"
        validateStatus={errors?.amount ? 'error' : undefined}
        help={errors?.amount}
        rules={[{ required: true, message: 'Le montant est requis' }]}
      >
        <InputNumber
          prefix="€"
          min={0.01}
          precision={2}
          step={0.01}
          style={{ width: '100%' }}
          placeholder="0.00"
        />
      </Form.Item>

      <Form.Item name="categoryId" label="Catégorie (optionnel)">
        <Select placeholder="Sans catégorie" allowClear>
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: cat.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {cat.name}
              </span>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="recurrenceType" label="Récurrence">
        <Select
          options={RECURRENCE_OPTIONS.map((o) => ({
            value: o.value,
            label:
              o.value !== 'none' ? (
                <span>
                  <RetweetOutlined style={{ marginRight: 6 }} />
                  {o.label}
                </span>
              ) : (
                o.label
              ),
          }))}
          onChange={(v: RecurrenceType) => setRecurrenceType(v)}
        />
      </Form.Item>

      {recurrenceType !== 'none' && (
        <Form.Item name="recurrenceEndDate" label="Fin de récurrence (optionnel)">
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Aucune fin"
            disabledDate={(d) => d.isBefore(selectedDate, 'day')}
          />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Ajouter
        </Button>
      </Form.Item>
    </Form>
  )
}

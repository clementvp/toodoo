import { useEffect } from 'react'
import { Modal, Form, Radio, InputNumber, Select, DatePicker, Alert } from 'antd'
import { router } from '@inertiajs/react'
import { dayjs } from '~/lib/date_utils'
import type { Expense, ExpenseCategory } from '~/lib/types'

interface ExpenseEditModalProps {
  expense: Expense | null
  categories: ExpenseCategory[]
  open: boolean
  onClose: () => void
}

export default function ExpenseEditModal({
  expense,
  categories,
  open,
  onClose,
}: ExpenseEditModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (expense && open) {
      form.setFieldsValue({
        type: expense.type,
        amount: expense.amount,
        categoryId: expense.categoryId ?? undefined,
        date: dayjs(expense.occurrenceDate ?? expense.date),
      })
    }
  }, [expense, open, form])

  const handleSubmit = (values: {
    type: 'income' | 'expense'
    amount: number
    categoryId?: number
    date: import('dayjs').Dayjs
  }) => {
    if (!expense) return

    router.patch(
      `/expenses/${expense.id}`,
      {
        type: values.type,
        amount: values.amount,
        categoryId: values.categoryId ?? null,
        date: values.date.format('YYYY-MM-DD'),
        occurrenceDate: expense.occurrenceDate ?? undefined,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          form.resetFields()
          onClose()
        },
      }
    )
  }

  const categoryOptions = [
    { value: undefined, label: 'Sans catégorie' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: (
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
      ),
    })),
  ]

  return (
    <Modal
      title="Modifier la transaction"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Enregistrer"
      cancelText="Annuler"
      width={480}
      destroyOnHidden
    >
      {expense?.isRecurring && (
        <Alert
          title="Modification appliquée à cette occurrence uniquement"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          rules={[{ required: true, message: 'Le montant est requis' }]}
        >
          <InputNumber
            prefix="€"
            min={0.01}
            precision={2}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="categoryId" label="Catégorie (optionnel)">
          <Select placeholder="Sans catégorie" allowClear options={categoryOptions} />
        </Form.Item>

        <Form.Item name="date" label="Date">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

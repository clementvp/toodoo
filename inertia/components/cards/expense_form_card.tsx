import { Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import type { ExpenseCategory } from '~/lib/types'
import ExpenseForm from '../forms/expense_form'

interface ExpenseFormCardProps {
  selectedDate: Dayjs
  categories: ExpenseCategory[]
  errors?: Record<string, string>
}

export default function ExpenseFormCard({
  selectedDate,
  categories,
  errors,
}: ExpenseFormCardProps) {
  return (
    <Card
      title={
        <span>
          <PlusOutlined /> Ajouter une transaction
        </span>
      }
      variant="borderless"
    >
      <ExpenseForm selectedDate={selectedDate} categories={categories} errors={errors} />
    </Card>
  )
}

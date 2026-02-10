import { Card } from 'antd'
import TodoForm from '../forms/todo_form'
import type { Dayjs } from 'dayjs'

interface TodoFormCardProps {
  selectedDate: Dayjs
  errors?: Record<string, string>
}

export default function TodoFormCard({ selectedDate, errors }: TodoFormCardProps) {
  const formattedDate = selectedDate.locale('fr').format('D MMMM YYYY')

  return (
    <Card
      title={`Créer une tâche pour le ${formattedDate}`}
      style={{
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <TodoForm selectedDate={selectedDate} errors={errors} reloadOnly={['todos']} />
    </Card>
  )
}

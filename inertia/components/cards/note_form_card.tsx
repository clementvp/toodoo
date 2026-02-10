import { Card } from 'antd'
import NoteForm from '../forms/note_form'
import type { Dayjs } from 'dayjs'

interface NoteFormCardProps {
  selectedDate: Dayjs
  errors?: Record<string, string>
}

export default function NoteFormCard({ selectedDate, errors }: NoteFormCardProps) {
  const formattedDate = selectedDate.locale('fr').format('D MMMM YYYY')

  return (
    <Card
      title={`Créer une note pour le ${formattedDate}`}
      style={{
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <NoteForm selectedDate={selectedDate} errors={errors} reloadOnly={['notes']} />
    </Card>
  )
}

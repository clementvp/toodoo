import { useRef } from 'react'
import { Card, List, Button, Tag, Space, Empty, Modal, message } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Todo } from '~/lib/types'
import { formatTime } from '~/lib/date_utils'
import { useThermalPrinter } from '~/lib/use_thermal_printer'
import { drawTodosOnCanvas } from '~/lib/print_todos'
import type { Dayjs } from 'dayjs'

interface TodoListCardProps {
  todos: Todo[]
  selectedDate: Dayjs
  showPrinterButton?: boolean
}

export default function TodoListCard({ todos, selectedDate, showPrinterButton = false }: TodoListCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isConnected, isPrinting, connectPrinter, printCanvas } = useThermalPrinter()

  const handlePrint = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      if (!isConnected) {
        message.loading({ content: "Connexion à l'imprimante...", key: 'print' })
        await connectPrinter()
      }
      drawTodosOnCanvas(canvas, todos, selectedDate)
      message.loading({ content: 'Impression en cours...', key: 'print' })
      await printCanvas(canvas)
      message.success({ content: 'Impression terminée', key: 'print' })
    } catch {
      message.error({ content: "Erreur d'impression", key: 'print' })
    }
  }
  const handleToggleStatus = (todo: Todo) => {
    const newStatus = todo.status === 'À faire' ? 'Terminé' : 'À faire'
    router.patch(
      `/todos/${todo.id}`,
      { status: newStatus },
      {
        preserveScroll: true,
      }
    )
  }

  const handleDelete = (todo: Todo) => {
    Modal.confirm({
      title: 'Supprimer cette tâche ?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Voulez-vous vraiment supprimer la tâche :</p>
          <p style={{ fontWeight: 'bold', marginTop: '8px' }}>"{todo.title}"</p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
            Cette action est irréversible.
          </p>
        </div>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        router.delete(`/todos/${todo.id}`, {
          preserveScroll: true,
        })
      },
    })
  }

  const formattedDate = selectedDate.locale('fr').format('D MMMM YYYY')

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    <Card
      title={`Tâches du ${formattedDate}`}
      extra={
        showPrinterButton && (
          <Button
            type="text"
            icon={<PrinterOutlined />}
            size="small"
            loading={isPrinting}
            onClick={handlePrint}
          />
        )
      }
      style={{
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        },
      }}
    >
      {todos.length === 0 ? (
        <Empty description="Aucune tâche pour ce jour" />
      ) : (
        <List
          dataSource={todos}
          renderItem={(todo) => (
            <List.Item
              actions={[
                <Button
                  key="toggle"
                  type="text"
                  icon={
                    todo.status === 'Terminé' ? <CloseCircleOutlined /> : <CheckCircleOutlined />
                  }
                  onClick={() => handleToggleStatus(todo)}
                  style={{ color: todo.status === 'Terminé' ? '#64748b' : '#10B981' }}
                >
                  {todo.status === 'Terminé' ? 'Annuler' : 'Terminer'}
                </Button>,
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(todo)}
                >
                  Supprimer
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span
                      style={{
                        textDecoration: todo.status === 'Terminé' ? 'line-through' : 'none',
                        color: todo.status === 'Terminé' ? '#64748b' : '#1E293B',
                      }}
                    >
                      {todo.title}
                    </span>
                    {todo.status === 'Terminé' && <Tag color="success">Terminé</Tag>}
                  </Space>
                }
                description={
                  <div>
                    {todo.description && (
                      <div style={{ marginBottom: '8px' }}>{todo.description}</div>
                    )}
                    {todo.dueTime && (
                      <Space>
                        <ClockCircleOutlined />
                        <span>{formatTime(todo.dueTime)}</span>
                      </Space>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
    </>
  )
}

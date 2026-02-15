import { useState, useEffect, useRef } from 'react'
import { Card, List, Checkbox, Button, Empty, Modal, message, Tag } from 'antd'
import {
  CheckSquareOutlined,
  DeleteOutlined,
  PlusOutlined,
  PrinterOutlined,
  RetweetOutlined,
} from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Todo } from '~/lib/types'
import { RECURRENCE_LABELS } from '~/lib/types'
import TodoForm from '../forms/todo_form'
import { dayjs } from '~/lib/date_utils'
import { useThermalPrinter } from '~/lib/use_thermal_printer'
import { drawTodosOnCanvas } from '~/lib/print_todos'
import { PRIORITY_COLOR } from '~/lib/todo_priority'
import type { Priority } from '~/lib/todo_priority'

interface TodosCardProps {
  todos: Todo[]
  showPrinterButton?: boolean
}

export default function TodosCard({ todos, showPrinterButton = false }: TodosCardProps) {
  const [localTodos, setLocalTodos] = useState(todos)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isConnected, isPrinting, connectPrinter, printCanvas } = useThermalPrinter()

  useEffect(() => {
    setLocalTodos(todos)
  }, [todos])

  const handlePrint = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      if (!isConnected) {
        message.loading({ content: "Connexion à l'imprimante...", key: 'print' })
        await connectPrinter()
      }

      drawTodosOnCanvas(canvas, localTodos, dayjs())
      message.loading({ content: 'Impression en cours...', key: 'print' })
      await printCanvas(canvas)
      message.success({ content: 'Impression terminée', key: 'print' })
    } catch (error) {
      message.error({ content: "Erreur d'impression", key: 'print' })
    }
  }

  const handleStatusToggle = async (todo: Todo) => {
    const newStatus = todo.status === 'À faire' ? 'Terminé' : 'À faire'

    setLocalTodos(
      localTodos.map((t) =>
        t.id === todo.id && t.dueDate === todo.dueDate
          ? { ...t, status: newStatus as Todo['status'] }
          : t
      )
    )

    const body = todo.isRecurring
      ? { status: newStatus, occurrenceDate: todo.dueDate }
      : { status: newStatus }

    router.patch(`/todos/${todo.id}`, body, {
      preserveScroll: true,
      only: ['todosToday'],
      onError: () => {
        setLocalTodos(
          localTodos.map((t) =>
            t.id === todo.id && t.dueDate === todo.dueDate ? { ...t, status: todo.status } : t
          )
        )
        message.error('Échec de la mise à jour')
      },
    })
  }

  const handleDelete = (todo: Todo) => {
    if (todo.isRecurring) {
      Modal.confirm({
        title: 'Supprimer cette tâche récurrente ?',
        width: 520,
        content: (
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>"{todo.title}"</p>
            <p>Voulez-vous supprimer :</p>
          </div>
        ),
        okText: 'Toutes les occurrences',
        okType: 'danger',
        cancelText: 'Annuler',
        footer: (_, { OkBtn, CancelBtn }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <CancelBtn />
            <Button
              onClick={() => {
                Modal.destroyAll()
                router.delete(`/todos/${todo.id}/occurrence`, {
                  data: { occurrenceDate: todo.dueDate },
                  preserveScroll: true,
                  only: ['todosToday'],
                  onSuccess: () => {
                    setLocalTodos(
                      localTodos.filter((t) => !(t.id === todo.id && t.dueDate === todo.dueDate))
                    )
                  },
                })
              }}
            >
              Cette occurrence
            </Button>
            <OkBtn />
          </div>
        ),
        onOk: () => {
          router.delete(`/todos/${todo.id}`, {
            preserveScroll: true,
            only: ['todosToday'],
            onSuccess: () => {
              setLocalTodos(localTodos.filter((t) => t.id !== todo.id))
              message.success('Tâche supprimée')
            },
            onError: () => {
              message.error('Échec de la suppression')
            },
          })
        },
      })
    } else {
      Modal.confirm({
        title: 'Supprimer cette tâche ?',
        content: `Êtes-vous sûr de vouloir supprimer "${todo.title}" ?`,
        okText: 'Supprimer',
        okType: 'danger',
        cancelText: 'Annuler',
        onOk: () => {
          router.delete(`/todos/${todo.id}`, {
            preserveScroll: true,
            only: ['todosToday'],
            onSuccess: () => {
              setLocalTodos(localTodos.filter((t) => t.id !== todo.id))
              message.success('Tâche supprimée')
            },
            onError: () => {
              message.error('Échec de la suppression')
            },
          })
        },
      })
    }
  }

  const renderContent = () => {
    if (localTodos.length === 0) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune tâche pour aujourd'hui" />
      )
    }

    return (
      <List
        dataSource={localTodos}
        rowKey={(todo) => `${todo.id}-${todo.dueDate}`}
        renderItem={(todo) => (
          <List.Item
            actions={[
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(todo)}
              >
                Supprimer
              </Button>,
            ]}
          >
            <Checkbox checked={todo.status === 'Terminé'} onChange={() => handleStatusToggle(todo)}>
              <span
                style={{
                  textDecoration: todo.status === 'Terminé' ? 'line-through' : 'none',
                  color: todo.status === 'Terminé' ? '#999' : '#000',
                }}
              >
                {todo.title}
              </span>
              <Tag
                color={PRIORITY_COLOR[todo.priority as Priority]}
                style={{ marginLeft: 8, fontSize: 11 }}
              >
                {todo.priority}
              </Tag>
              {todo.isRecurring && (
                <Tag
                  icon={<RetweetOutlined />}
                  style={{ marginLeft: 4, fontSize: 11, color: '#64748b', borderColor: '#cbd5e1' }}
                >
                  {RECURRENCE_LABELS[todo.recurrenceType]}
                </Tag>
              )}
            </Checkbox>
          </List.Item>
        )}
      />
    )
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Card
        title={
          <span>
            <CheckSquareOutlined /> Tâches du jour
          </span>
        }
        extra={
          <div style={{ display: 'flex', gap: 4 }}>
            {showPrinterButton && localTodos.length > 0 && (
              <Button
                type="text"
                icon={<PrinterOutlined />}
                size="small"
                loading={isPrinting}
                onClick={handlePrint}
              />
            )}
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => setCreateModalVisible(true)}
            />
          </div>
        }
        variant="borderless"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, overflow: 'auto' } }}
      >
        {renderContent()}
      </Card>

      <Modal
        title="Créer une tâche"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <TodoForm selectedDate={dayjs()} onSuccess={() => setCreateModalVisible(false)} />
      </Modal>
    </>
  )
}

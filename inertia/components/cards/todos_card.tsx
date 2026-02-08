import { useState, useEffect } from 'react'
import { Card, List, Checkbox, Button, Empty, Modal, message } from 'antd'
import { CheckSquareOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Todo } from '~/lib/types'
import TodoForm from '../forms/todo_form'
import { dayjs } from '~/lib/date_utils'

interface TodosCardProps {
  todos: Todo[]
}

export default function TodosCard({ todos }: TodosCardProps) {
  const [localTodos, setLocalTodos] = useState(todos)
  const [createModalVisible, setCreateModalVisible] = useState(false)

  // Synchroniser l'état local quand les props changent
  useEffect(() => {
    setLocalTodos(todos)
  }, [todos])

  const handleStatusToggle = async (todoId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'À faire' ? 'Terminé' : 'À faire'

    setLocalTodos(
      localTodos.map((t) => (t.id === todoId ? { ...t, status: newStatus as Todo['status'] } : t))
    )

    try {
      router.patch(
        `/todos/${todoId}`,
        { status: newStatus },
        {
          preserveScroll: true,
          only: ['todosToday'],
          onError: () => {
            setLocalTodos(
              localTodos.map((t) =>
                t.id === todoId ? { ...t, status: currentStatus as Todo['status'] } : t
              )
            )
            message.error('Échec de la mise à jour')
          },
        }
      )
    } catch (error) {
      setLocalTodos(
        localTodos.map((t) =>
          t.id === todoId ? { ...t, status: currentStatus as Todo['status'] } : t
        )
      )
      message.error('Échec de la mise à jour')
    }
  }

  const handleDelete = (todo: Todo) => {
    Modal.confirm({
      title: 'Supprimer ce todo ?',
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
            message.success('Todo supprimé')
          },
          onError: () => {
            message.error('Échec de la suppression')
          },
        })
      },
    })
  }

  const renderContent = () => {
    if (localTodos.length === 0) {
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun todo pour aujourd'hui" />
      )
    }

    return (
      <List
        dataSource={localTodos}
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
            <Checkbox
              checked={todo.status === 'Terminé'}
              onChange={() => handleStatusToggle(todo.id, todo.status)}
            >
              <span
                style={{
                  textDecoration: todo.status === 'Terminé' ? 'line-through' : 'none',
                  color: todo.status === 'Terminé' ? '#999' : '#000',
                }}
              >
                {todo.title}
              </span>
            </Checkbox>
          </List.Item>
        )}
      />
    )
  }

  return (
    <>
      <Card
        title={
          <span>
            <CheckSquareOutlined /> Tâches du jour
          </span>
        }
        extra={
          <Button
            type="text"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => setCreateModalVisible(true)}
          />
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

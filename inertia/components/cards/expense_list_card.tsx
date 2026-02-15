import { useState } from 'react'
import { Card, List, Button, Empty, Modal, Tag, Typography, Divider, Space } from 'antd'
import { DeleteOutlined, WalletOutlined, EditOutlined, RetweetOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { Expense, ExpenseCategory } from '~/lib/types'
import type { Dayjs } from 'dayjs'
import ExpenseEditModal from '~/components/expenses/expense_edit_modal'

const { Text } = Typography

interface ExpenseListCardProps {
  expenses: Expense[]
  categories: ExpenseCategory[]
  selectedDate: Dayjs
}

export default function ExpenseListCard({
  expenses,
  categories,
  selectedDate,
}: ExpenseListCardProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const net = totalIncome - totalExpense

  const getCategoryDisplay = (categoryId: number | null) => {
    if (!categoryId) return null
    return categories.find((c) => c.id === categoryId) ?? null
  }

  const handleDelete = (expense: Expense) => {
    if (expense.isRecurring) {
      Modal.confirm({
        title: 'Supprimer cette transaction récurrente ?',
        content: 'Voulez-vous supprimer cette occurrence ou toutes les occurrences ?',
        footer: (_, { CancelBtn }) => (
          <Space>
            <CancelBtn />
            <Button
              danger
              onClick={() => {
                router.delete(`/expenses/${expense.id}/occurrence`, {
                  data: { occurrenceDate: expense.occurrenceDate },
                  preserveScroll: true,
                })
                Modal.destroyAll()
              }}
            >
              Cette occurrence
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                router.delete(`/expenses/${expense.id}`, { preserveScroll: true })
                Modal.destroyAll()
              }}
            >
              Toutes
            </Button>
          </Space>
        ),
      })
    } else {
      Modal.confirm({
        title: 'Supprimer cette transaction ?',
        content: `Êtes-vous sûr de vouloir supprimer cette transaction de €${Number(expense.amount).toFixed(2)} ?`,
        okText: 'Supprimer',
        okType: 'danger',
        cancelText: 'Annuler',
        onOk: () => {
          router.delete(`/expenses/${expense.id}`, { preserveScroll: true })
        },
      })
    }
  }

  const renderCategoryDot = (categoryId: number | null) => {
    const cat = getCategoryDisplay(categoryId)
    if (!cat) return null
    return (
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
    )
  }

  const renderExpenseRow = (expense: Expense) => {
    const cat = getCategoryDisplay(expense.categoryId)

    if (expense.type === 'adjustment') {
      const signed = Number(expense.amount)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Tag color="processing">Correction</Tag>
          <Text strong style={{ color: '#3b82f6' }}>
            {signed >= 0 ? '+' : '-'}€{Math.abs(signed).toFixed(2)}
          </Text>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Tag color={expense.type === 'income' ? 'success' : 'error'}>
          {expense.type === 'income' ? 'Entrée' : 'Sortie'}
        </Tag>
        <Text strong style={{ color: expense.type === 'income' ? '#3b82f6' : '#ef4444' }}>
          {expense.type === 'income' ? '+' : '-'}€{Number(expense.amount).toFixed(2)}
        </Text>
        {cat && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {renderCategoryDot(expense.categoryId)}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {cat.name}
            </Text>
          </span>
        )}
        {expense.isRecurring && (
          <Tag icon={<RetweetOutlined />} color="default" style={{ fontSize: 11 }}>
            Récurrent
          </Tag>
        )}
      </div>
    )
  }

  const renderContent = () => {
    if (expenses.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune transaction ce jour" />
    }

    return (
      <>
        <List
          dataSource={expenses}
          rowKey={(e) => `${e.id}-${e.occurrenceDate ?? e.date}`}
          renderItem={(expense) => (
            <List.Item
              actions={[
                expense.type !== 'adjustment' && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setEditingExpense(expense)}
                  >
                    Modifier
                  </Button>
                ),
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(expense)}
                >
                  Supprimer
                </Button>,
              ].filter(Boolean)}
            >
              {renderExpenseRow(expense)}
            </List.Item>
          )}
        />
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Text type="secondary">Entrées: </Text>
          <Text style={{ color: '#3b82f6' }}>+€{totalIncome.toFixed(2)}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Text type="secondary">Sorties: </Text>
          <Text style={{ color: '#ef4444' }}>-€{totalExpense.toFixed(2)}</Text>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px 0',
            borderTop: '1px solid #f0f0f0',
            marginTop: '4px',
          }}
        >
          <Text strong>Solde: </Text>
          <Text strong style={{ color: net >= 0 ? '#3b82f6' : '#ef4444' }}>
            {net >= 0 ? '+' : ''}€{net.toFixed(2)}
          </Text>
        </div>
      </>
    )
  }

  return (
    <>
      <Card
        title={
          <span>
            <WalletOutlined /> Transactions du {selectedDate.locale('fr').format('D MMMM')}
          </span>
        }
        variant="borderless"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, overflow: 'auto' } }}
      >
        {renderContent()}
      </Card>

      <ExpenseEditModal
        expense={editingExpense}
        categories={categories}
        open={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
      />
    </>
  )
}

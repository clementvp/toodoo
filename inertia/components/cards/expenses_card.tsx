import { useState, useRef } from 'react'
import { Card, List, Empty, Modal, Button, Tag, Typography, message } from 'antd'
import { WalletOutlined, PlusOutlined, RetweetOutlined, PrinterOutlined } from '@ant-design/icons'
import type { Expense, ExpenseCategory } from '~/lib/types'
import ExpenseForm from '../forms/expense_form'
import { useThermalPrinter } from '~/lib/use_thermal_printer'
import { drawExpensesOnCanvas } from '~/lib/print_expenses'
import { dayjs } from '~/lib/date_utils'

const { Text } = Typography

interface ExpensesCardProps {
  expenses: Expense[]
  categories: ExpenseCategory[]
  balance: number
  showPrinterButton?: boolean
}

export default function ExpensesCard({ expenses, categories, balance, showPrinterButton = false }: ExpensesCardProps) {
  const [createModalVisible, setCreateModalVisible] = useState(false)
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
      drawExpensesOnCanvas(canvas, expenses, categories, dayjs())
      message.loading({ content: 'Impression en cours...', key: 'print' })
      await printCanvas(canvas)
      message.success({ content: 'Impression terminée', key: 'print' })
    } catch {
      message.error({ content: "Erreur d'impression", key: 'print' })
    }
  }

  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const net = totalIncome - totalExpense

  const balanceColor = balance >= 0 ? '#3b82f6' : '#ef4444'

  const getCategoryDisplay = (categoryId: number | null) => {
    if (!categoryId) return null
    return categories.find((c) => c.id === categoryId) ?? null
  }

  const renderExpenseRow = (expense: Expense) => {
    const cat = getCategoryDisplay(expense.categoryId)

    if (expense.type === 'adjustment') {
      const signed = Number(expense.amount)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag color="processing">Correction</Tag>
          <Text strong style={{ color: '#3b82f6' }}>
            {signed >= 0 ? '+' : '-'}€{Math.abs(signed).toFixed(2)}
          </Text>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Tag color={expense.type === 'income' ? 'blue' : 'error'}>
          {expense.type === 'income' ? 'Entrée' : 'Sortie'}
        </Tag>
        <Text strong style={{ color: expense.type === 'income' ? '#3b82f6' : '#ef4444' }}>
          {expense.type === 'income' ? '+' : '-'}€{Number(expense.amount).toFixed(2)}
        </Text>
        {cat && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: cat.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
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
      return (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune transaction aujourd'hui" />
      )
    }

    return (
      <>
        <List
          dataSource={expenses}
          rowKey={(e) => `${e.id}-${e.occurrenceDate ?? e.date}`}
          renderItem={(expense) => <List.Item>{renderExpenseRow(expense)}</List.Item>}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Text type="secondary">
            Entrées: <span style={{ color: '#3b82f6' }}>+€{totalIncome.toFixed(2)}</span>
          </Text>
          <Text type="secondary">
            Sorties: <span style={{ color: '#ef4444' }}>-€{totalExpense.toFixed(2)}</span>
          </Text>
          <Text strong style={{ color: net >= 0 ? '#3b82f6' : '#ef4444' }}>
            Solde: {net >= 0 ? '+' : ''}€{net.toFixed(2)}
          </Text>
        </div>
      </>
    )
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Card
        title={
          <span>
            <WalletOutlined /> Dépenses du jour
          </span>
        }
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showPrinterButton && expenses.length > 0 && (
              <Button
                type="text"
                icon={<PrinterOutlined />}
                size="small"
                loading={isPrinting}
                onClick={handlePrint}
              />
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '16px',
                border: `1.5px solid ${balanceColor}`,
                background: `${balanceColor}12`,
              }}
            >
              <Text strong style={{ color: balanceColor, fontSize: 13 }}>
                {balance >= 0 ? '' : '-'}€
                {Math.abs(balance).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </div>
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
        title="Ajouter une transaction"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={480}
      >
        <ExpenseForm
          selectedDate={dayjs()}
          categories={categories}
          onSuccess={() => setCreateModalVisible(false)}
        />
      </Modal>
    </>
  )
}

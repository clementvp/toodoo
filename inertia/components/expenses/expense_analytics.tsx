import { useState } from 'react'
import { Empty, Typography, Row, Col, Card, InputNumber, Button, Space } from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { router } from '@inertiajs/react'
import { dayjs } from '~/lib/date_utils'
import type { Expense, ExpenseCategory } from '~/lib/types'

const { Title, Text } = Typography

export function formatAmount(n: number): string {
  return `€${n.toFixed(2)}`
}

function toBalanceDelta(e: Expense): number {
  if (e.type === 'income') return +Number(e.amount)
  if (e.type === 'expense') return -Number(e.amount)
  if (e.type === 'adjustment') return +Number(e.amount)
  return 0
}

const FALLBACK_COLORS = [
  '#1a1a1a',
  '#ef4444',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#10b981',
]

interface ExpenseAnalyticsProps {
  expenses: Expense[]
  categories: ExpenseCategory[]
  derivedBalance: number
  balanceAtStartOfMonth: number
}

export default function ExpenseAnalytics({
  expenses,
  categories,
  derivedBalance,
  balanceAtStartOfMonth,
}: ExpenseAnalyticsProps) {
  const [targetBalance, setTargetBalance] = useState<number | null>(null)

  if (expenses.length === 0) {
    return (
      <div style={{ padding: '48px 24px' }}>
        <Empty
          description="Aucune transaction à analyser. Commencez par ajouter des entrées et sorties."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  // --- Monthly bar chart (last 12 months) — exclude adjustments ---
  const now = dayjs()
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = now.subtract(11 - i, 'month')
    const key = month.format('YYYY-MM')
    const label = month.locale('fr').format('MMM YY')
    const monthExpenses = expenses.filter((e) =>
      (e.occurrenceDate ?? e.date).startsWith(key)
    )
    const income = monthExpenses
      .filter((e) => e.type === 'income')
      .reduce((s, e) => s + Number(e.amount), 0)
    const expense = monthExpenses
      .filter((e) => e.type === 'expense')
      .reduce((s, e) => s + Number(e.amount), 0)
    return { label, income, expense }
  })

  // --- Pie chart: expense breakdown by category (current month) ---
  const currentMonthKey = now.format('YYYY-MM')
  const currentMonthExpenses = expenses.filter(
    (e) => (e.occurrenceDate ?? e.date).startsWith(currentMonthKey) && e.type === 'expense'
  )

  const categoryMap: Record<string, { name: string; value: number; color: string }> = {}
  for (const e of currentMonthExpenses) {
    const cat = e.categoryId ? categories.find((c) => c.id === e.categoryId) : null
    const key = cat ? String(cat.id) : 'none'
    const name = cat ? cat.name : 'Sans catégorie'
    const color = cat ? cat.color : '#6b7280'
    if (!categoryMap[key]) {
      categoryMap[key] = { name, value: 0, color }
    }
    categoryMap[key].value += Number(e.amount)
  }
  const pieData = Object.values(categoryMap)

  // --- Line chart: daily running balance (current month) ---
  const daysInMonth = now.daysInMonth()
  let runningBalance = balanceAtStartOfMonth

  const lineData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = now.startOf('month').add(i, 'day')
    const dayKey = day.format('YYYY-MM-DD')
    const dayExpenses = expenses.filter((e) => (e.occurrenceDate ?? e.date) === dayKey)
    for (const e of dayExpenses) {
      runningBalance += toBalanceDelta(e)
    }
    return { day: day.format('D'), balance: parseFloat(runningBalance.toFixed(2)) }
  })

  const totalRunningBalance = derivedBalance

  const handleCorrectBalance = () => {
    if (targetBalance === null) return
    router.post(
      '/expenses/correct-balance',
      { targetBalance, date: now.format('YYYY-MM-DD') },
      { preserveScroll: true }
    )
    setTargetBalance(null)
  }

  const correctionDiff = targetBalance !== null ? targetBalance - derivedBalance : null
  const isCorrectionNeeded = correctionDiff !== null && Math.abs(correctionDiff) >= 0.01

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ margin: 0 }}>
          Statistiques financières
        </Title>
        <Text type="secondary">
          Solde courant:{' '}
          <Text strong style={{ color: totalRunningBalance >= 0 ? '#3b82f6' : '#ef4444' }}>
            {formatAmount(totalRunningBalance)}
          </Text>
        </Text>

        <div style={{ marginTop: '12px' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
            Corriger le solde — saisir votre solde réel :
          </Text>
          <Space>
            <InputNumber
              prefix="€"
              placeholder={totalRunningBalance.toFixed(2)}
              value={targetBalance}
              onChange={(v) => setTargetBalance(v)}
              precision={2}
              style={{ width: 160 }}
            />
            <Button
              type="primary"
              disabled={!isCorrectionNeeded}
              onClick={handleCorrectBalance}
            >
              Corriger
            </Button>
            {correctionDiff !== null && isCorrectionNeeded && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Correction :{' '}
                <Text
                  strong
                  style={{ color: correctionDiff >= 0 ? '#3b82f6' : '#ef4444', fontSize: 12 }}
                >
                  {correctionDiff >= 0 ? '+' : ''}€{correctionDiff.toFixed(2)}
                </Text>
              </Text>
            )}
          </Space>
        </div>
      </div>

      <Row gutter={[16, 24]}>
        {/* Monthly income vs expenses */}
        <Col xs={24}>
          <Card title="Revenus vs Dépenses (12 derniers mois)" variant="borderless">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Legend />
                <Bar dataKey="income" name="Entrées" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Sorties" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Expense breakdown by category */}
        <Col xs={24} md={12}>
          <Card
            title={`Répartition des sorties — ${now.locale('fr').format('MMMM YYYY')}`}
            variant="borderless"
          >
            {pieData.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune sortie ce mois-ci" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatAmount(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Daily running balance */}
        <Col xs={24} md={12}>
          <Card
            title={`Solde journalier — ${now.locale('fr').format('MMMM YYYY')}`}
            variant="borderless"
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `€${v}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Solde"
                  stroke="#1a1a1a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

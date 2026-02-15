import type { Dayjs } from 'dayjs'
import type { Expense, ExpenseCategory } from '~/lib/types'

const CANVAS_WIDTH = 384
const PADDING = 20
const LINE_HEIGHT = 52
const HEADER_HEIGHT = 100
const FOOTER_HEIGHT = 72

export function drawExpensesOnCanvas(
  canvas: HTMLCanvasElement,
  expenses: Expense[],
  categories: ExpenseCategory[],
  date: Dayjs
) {
  const height = HEADER_HEIGHT + expenses.length * LINE_HEIGHT + FOOTER_HEIGHT + PADDING
  canvas.width = CANVAS_WIDTH
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const getCategoryName = (categoryId: number | null) =>
    categoryId ? (categories.find((c) => c.id === categoryId)?.name ?? '') : ''

  // Background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, CANVAS_WIDTH, height)

  // Date title
  ctx.fillStyle = 'black'
  ctx.font = 'bold 28px Arial'
  ctx.fillText(date.locale('fr').format('dddd D MMMM YYYY'), PADDING, 48)

  // Subtitle
  ctx.font = '18px Arial'
  ctx.fillStyle = '#555'
  ctx.fillText('Dépenses du jour', PADDING, 78)

  // Separator
  ctx.beginPath()
  ctx.moveTo(PADDING, 90)
  ctx.lineTo(CANVAS_WIDTH - PADDING, 90)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.stroke()

  // Transactions
  let totalIncome = 0
  let totalExpense = 0

  expenses.forEach((expense, index) => {
    const y = HEADER_HEIGHT + index * LINE_HEIGHT
    const amount = Number(expense.amount)
    const catName = getCategoryName(expense.categoryId)

    let typeLabel: string
    let amountStr: string

    if (expense.type === 'adjustment') {
      typeLabel = 'Correction'
      amountStr = `${amount >= 0 ? '+' : ''}€${amount.toFixed(2)}`
    } else if (expense.type === 'income') {
      typeLabel = 'Entrée'
      amountStr = `+€${amount.toFixed(2)}`
      totalIncome += amount
    } else {
      typeLabel = 'Sortie'
      amountStr = `-€${amount.toFixed(2)}`
      totalExpense += amount
    }

    // Type label box
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = 'black'
    const labelWidth = ctx.measureText(typeLabel).width + 12
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.strokeRect(PADDING, y + 10, labelWidth, 24)
    ctx.fillText(typeLabel, PADDING + 6, y + 26)

    // Amount
    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = 'black'
    ctx.fillText(amountStr, PADDING + labelWidth + 10, y + 28)

    // Category
    if (catName) {
      ctx.font = '16px Arial'
      ctx.fillStyle = '#555'
      const amountWidth = ctx.measureText(amountStr).width
      ctx.fillText(catName, PADDING + labelWidth + 10 + amountWidth + 8, y + 28)
    }

    // Separator line between rows
    ctx.beginPath()
    ctx.moveTo(PADDING, y + LINE_HEIGHT - 4)
    ctx.lineTo(CANVAS_WIDTH - PADDING, y + LINE_HEIGHT - 4)
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 0.5
    ctx.stroke()
  })

  // Footer totals
  const footerY = HEADER_HEIGHT + expenses.length * LINE_HEIGHT + 16
  ctx.beginPath()
  ctx.moveTo(PADDING, footerY)
  ctx.lineTo(CANVAS_WIDTH - PADDING, footerY)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.font = '16px Arial'
  ctx.fillStyle = 'black'
  ctx.fillText(`Entrées : +€${totalIncome.toFixed(2)}`, PADDING, footerY + 20)
  ctx.fillText(`Sorties : -€${totalExpense.toFixed(2)}`, PADDING, footerY + 40)

  ctx.font = 'bold 18px Arial'
  const net = totalIncome - totalExpense
  ctx.fillText(`Solde du jour : ${net >= 0 ? '+' : ''}€${net.toFixed(2)}`, PADDING, footerY + 62)
}

import type { Dayjs } from 'dayjs'
import type { Todo } from '~/lib/types'

const CANVAS_WIDTH = 384
const PADDING = 20
const LINE_HEIGHT = 56
const HEADER_HEIGHT = 100

export function drawTodosOnCanvas(canvas: HTMLCanvasElement, todos: Todo[], date: Dayjs) {
  const height = HEADER_HEIGHT + todos.length * LINE_HEIGHT + PADDING
  canvas.width = CANVAS_WIDTH
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, CANVAS_WIDTH, height)

  // Date as title (big)
  ctx.fillStyle = 'black'
  ctx.font = 'bold 32px Arial'
  ctx.fillText(date.format('dddd D MMMM YYYY'), PADDING, 52)

  // Separator
  ctx.beginPath()
  ctx.moveTo(PADDING, 72)
  ctx.lineTo(CANVAS_WIDTH - PADDING, 72)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.stroke()

  // Todos
  todos.forEach((todo, index) => {
    const y = HEADER_HEIGHT + index * LINE_HEIGHT

    // Checkbox (empty square)
    const boxSize = 20
    const boxX = PADDING
    const boxY = y + (LINE_HEIGHT - boxSize) / 2
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeRect(boxX, boxY, boxSize, boxSize)

    // Title
    ctx.fillStyle = 'black'
    ctx.font = '22px Arial'
    ctx.fillText(todo.title, PADDING + boxSize + 12, y + LINE_HEIGHT / 2 + 8)
  })
}

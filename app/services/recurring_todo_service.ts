import { DateTime } from 'luxon'
import Todo from '#models/todo'
import TodoCompletion from '#models/todo_completion'

export interface SerializedTodo {
  id: number
  userId: number
  title: string
  description: string | null
  dueDate: string
  dueTime: string | null
  status: 'À faire' | 'Terminé'
  priority: 'Haute' | 'Moyenne' | 'Basse'
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrenceEndDate: string | null
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Generates all occurrence dates for a recurring todo within [windowStart, windowEnd].
 */
function generateOccurrenceDates(
  todo: Todo,
  windowStart: DateTime,
  windowEnd: DateTime
): DateTime[] {
  const dates: DateTime[] = []
  const start = todo.dueDate.startOf('day')

  const endBound = todo.recurrenceEndDate
    ? DateTime.min(todo.recurrenceEndDate.startOf('day'), windowEnd.startOf('day'))
    : windowEnd.startOf('day')

  let current = start

  while (current <= endBound) {
    if (current >= windowStart.startOf('day')) {
      dates.push(current)
    }

    switch (todo.recurrenceType) {
      case 'daily':
        current = current.plus({ days: 1 })
        break
      case 'weekly':
        current = current.plus({ weeks: 1 })
        break
      case 'monthly':
        current = current.plus({ months: 1 })
        break
      default:
        return dates
    }
  }

  return dates
}

/**
 * Expands todos for a user into a flat serialized list.
 * - Non-recurring todos are returned as-is.
 * - Recurring todos are expanded into virtual occurrences within [windowStart, windowEnd].
 *   Completions determine status; 'Supprimé' occurrences are omitted.
 */
export async function getExpandedTodos(
  userId: number,
  windowStart: DateTime,
  windowEnd: DateTime
): Promise<SerializedTodo[]> {
  const todos = await Todo.query()
    .where('user_id', userId)
    .orderBy('due_date', 'asc')
    .orderBy('due_time', 'asc')

  const recurringIds = todos.filter((t) => t.recurrenceType !== 'none').map((t) => t.id)

  const completions =
    recurringIds.length > 0 ? await TodoCompletion.query().whereIn('todo_id', recurringIds) : []

  const result: SerializedTodo[] = []

  for (const todo of todos) {
    const base = todo.serialize()
    const recurrenceEndDate = todo.recurrenceEndDate ? todo.recurrenceEndDate.toSQLDate()! : null

    if (todo.recurrenceType === 'none') {
      result.push({
        ...base,
        recurrenceType: 'none',
        recurrenceEndDate: null,
        isRecurring: false,
      } as SerializedTodo)
      continue
    }

    // Expand recurring todo into virtual occurrences
    const todoCompletions = completions.filter((c) => c.todoId === todo.id)
    const occurrenceDates = generateOccurrenceDates(todo, windowStart, windowEnd)

    for (const date of occurrenceDates) {
      const dateStr = date.toSQLDate()!
      const completion = todoCompletions.find((c) => c.date === dateStr)

      // Skip occurrences that were individually deleted
      if (completion?.status === 'Supprimé') continue

      result.push({
        id: todo.id,
        userId: todo.userId,
        title: todo.title,
        description: todo.description,
        dueDate: dateStr,
        dueTime: todo.dueTime,
        status: completion?.status === 'Terminé' ? 'Terminé' : 'À faire',
        priority: todo.priority,
        recurrenceType: todo.recurrenceType,
        recurrenceEndDate,
        isRecurring: true,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      })
    }
  }

  return result.sort((a, b) => {
    if (a.dueDate < b.dueDate) return -1
    if (a.dueDate > b.dueDate) return 1
    if ((a.dueTime ?? '') < (b.dueTime ?? '')) return -1
    if ((a.dueTime ?? '') > (b.dueTime ?? '')) return 1
    return 0
  })
}

/**
 * Returns expanded todos for a single specific date (used by dashboard).
 */
export async function getExpandedTodosForDate(
  userId: number,
  date: DateTime
): Promise<SerializedTodo[]> {
  const dayStart = date.startOf('day')
  const dayEnd = date.endOf('day')
  const all = await getExpandedTodos(userId, dayStart, dayEnd)
  const dateStr = date.toSQLDate()!
  return all.filter((t) => t.dueDate === dateStr)
}

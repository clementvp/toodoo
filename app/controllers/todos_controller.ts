import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Todo from '#models/todo'
import TodoCompletion from '#models/todo_completion'
import UserSetting from '#models/user_setting'
import { createTodoValidator, updateTodoValidator } from '#validators/todo_validator'
import { getExpandedTodos } from '#services/recurring_todo_service'

export default class TodosController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!

    const windowStart = DateTime.now().minus({ months: 3 })
    const windowEnd = DateTime.now().plus({ months: 12 })

    const [todos, userSettings] = await Promise.all([
      getExpandedTodos(user.id, windowStart, windowEnd),
      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id }),
    ])

    return inertia.render('todos/index', {
      todos,
      userSettings: userSettings.serialize(),
    })
  }

  async create({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createTodoValidator)

    await Todo.create({
      userId: user.id,
      title: data.title,
      description: data.description || null,
      dueDate: DateTime.fromJSDate(data.dueDate),
      dueTime: data.dueTime || null,
      status: 'À faire',
      priority: data.priority || 'Basse',
      recurrenceType: data.recurrenceType || 'none',
      recurrenceEndDate: data.recurrenceEndDate
        ? DateTime.fromJSDate(data.recurrenceEndDate)
        : null,
    })

    session.flash('success', 'Todo created successfully!')
    const partialComponent = request.header('x-inertia-partial-component') ?? ''
    return response.redirect().toPath(partialComponent.startsWith('dashboard') ? '/' : '/todos')
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(updateTodoValidator)
    const todo = await Todo.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    // For recurring todos: manage completions instead of updating the template
    if (todo.recurrenceType !== 'none' && data.occurrenceDate && data.status !== undefined) {
      if (data.status === 'Terminé') {
        await TodoCompletion.updateOrCreate(
          { todoId: todo.id, date: data.occurrenceDate },
          { status: 'Terminé' }
        )
      } else {
        // Toggle back to À faire → remove the completion
        await TodoCompletion.query()
          .where('todo_id', todo.id)
          .where('date', data.occurrenceDate)
          .delete()
      }
    } else {
      await todo
        .merge({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? DateTime.fromJSDate(data.dueDate) : undefined,
          dueTime: data.dueTime,
          status: data.status,
        })
        .save()
    }

    session.flash('success', 'Todo updated successfully!')
    return response.redirect().back()
  }

  async delete({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const todo = await Todo.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await todo.delete()

    session.flash('success', 'Todo deleted successfully!')
    return response.redirect().back()
  }

  /**
   * Deletes a single occurrence of a recurring todo by marking it as 'Supprimé'.
   */
  async deleteOccurrence({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const todo = await Todo.query().where('id', params.id).where('user_id', user.id).firstOrFail()
    const occurrenceDate = request.input('occurrenceDate') as string

    await TodoCompletion.updateOrCreate(
      { todoId: todo.id, date: occurrenceDate },
      { status: 'Supprimé' }
    )

    session.flash('success', 'Occurrence supprimée!')
    return response.redirect().back()
  }
}

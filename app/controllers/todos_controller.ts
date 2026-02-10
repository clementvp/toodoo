import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#models/todo'
import UserSetting from '#models/user_setting'
import { createTodoValidator, updateTodoValidator } from '#validators/todo_validator'
import { DateTime } from 'luxon'

export default class TodosController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const [todos, userSettings] = await Promise.all([
      Todo.query().where('user_id', user.id).orderBy('due_date', 'asc').orderBy('due_time', 'asc'),
      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id }),
    ])

    return inertia.render('todos/index', {
      todos: todos.map((todo) => todo.serialize()),
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
    })

    session.flash('success', 'Todo created successfully!')
    const partialComponent = request.header('x-inertia-partial-component') ?? ''
    return response.redirect().toPath(partialComponent.startsWith('dashboard') ? '/' : '/todos')
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(updateTodoValidator)
    const todo = await Todo.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await todo
      .merge({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? DateTime.fromJSDate(data.dueDate) : undefined,
        dueTime: data.dueTime,
        status: data.status,
      })
      .save()

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
}

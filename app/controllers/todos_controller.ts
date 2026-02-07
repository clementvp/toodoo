import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#models/todo'
import { createTodoValidator, updateTodoValidator } from '#validators/todo_validator'
import { DateTime } from 'luxon'

export default class TodosController {
  /**
   * T041: Display todos page with calendar view
   */
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!

    // Get current month's todos (data isolation enforced)
    const todos = await Todo.query()
      .where('user_id', user.id)
      .orderBy('due_date', 'asc')
      .orderBy('due_time', 'asc')

    return inertia.render('todos/index', {
      todos: todos.map((todo) => todo.serialize()),
    })
  }

  /**
   * T042: Create a new todo
   */
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
    })

    session.flash('success', 'Todo created successfully!')
    return response.redirect('/todos')
  }

  /**
   * T043 + T045: Update a todo with ownership verification
   */
  async update({ params, request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(updateTodoValidator)

    // T045: Verify ownership before update
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
    return response.redirect('/todos')
  }

  /**
   * T044 + T045: Delete a todo with ownership verification
   */
  async delete({ params, auth, response, session }: HttpContext) {
    const user = auth.user!

    // T045: Verify ownership before delete
    const todo = await Todo.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await todo.delete()

    session.flash('success', 'Todo deleted successfully!')
    return response.redirect('/todos')
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import ExpenseCategory from '#models/expense_category'
import { createCategoryValidator } from '#validators/expense_category_validator'

const DEFAULT_CATEGORIES = [
  { name: 'Alimentation', color: '#22c55e' },
  { name: 'Transport', color: '#3b82f6' },
  { name: 'Logement', color: '#f59e0b' },
  { name: 'Santé', color: '#ec4899' },
  { name: 'Loisirs', color: '#8b5cf6' },
  { name: 'Revenus', color: '#10b981' },
  { name: 'Salaire', color: '#1a1a1a' },
  { name: 'Épargne', color: '#06b6d4' },
  { name: 'Autres', color: '#6b7280' },
]

export default class ExpenseCategoriesController {
  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    let categories = await ExpenseCategory.query().where('user_id', user.id).orderBy('id', 'asc')

    if (categories.length === 0) {
      categories = await Promise.all(
        DEFAULT_CATEGORIES.map((cat) =>
          ExpenseCategory.create({ userId: user.id, name: cat.name, color: cat.color })
        )
      )
    }

    return response.json(categories.map((c) => c.serialize()))
  }

  async create({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createCategoryValidator)

    const category = await ExpenseCategory.create({
      userId: user.id,
      name: data.name,
      color: data.color,
    })

    return response.json(category.serialize())
  }

  async delete({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const category = await ExpenseCategory.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await category.delete()

    return response.json({ success: true })
  }
}

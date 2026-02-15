import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Note from '#models/note'
import Expense from '#models/expense'
import ExpenseOccurrence from '#models/expense_occurrence'
import ExpenseCategory from '#models/expense_category'
import UserSetting from '#models/user_setting'
import { fetchWeatherData } from '#services/weather_service'
import { getExpandedTodosForDate } from '#services/recurring_todo_service'
import { getExpandedExpenses } from '#services/expense_expansion_service'

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const today = DateTime.now()
    const dayStart = today.startOf('day')
    const dayEnd = today.endOf('day')

    const [todosToday, notesToday, allExpenses, userSettings, categories] = await Promise.all([
      getExpandedTodosForDate(user.id, today),

      Note.query()
        .where('user_id', user.id)
        .whereRaw('DATE(due_date) = ?', [today.toSQLDate()!])
        .orderBy('due_date', 'desc'),

      Expense.query().where('user_id', user.id),

      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id, weatherCity: null }),

      ExpenseCategory.query().where('user_id', user.id).orderBy('id', 'asc'),
    ])

    const allOccurrences =
      allExpenses.length > 0
        ? await ExpenseOccurrence.query().whereIn(
            'expense_id',
            allExpenses.map((e) => e.id)
          )
        : []

    const expensesToday = getExpandedExpenses(allExpenses, allOccurrences, dayStart, dayEnd)

    const veryOldDate = DateTime.fromISO('1970-01-01')
    const allBalanceExpenses = getExpandedExpenses(
      allExpenses,
      allOccurrences,
      veryOldDate,
      today.endOf('day')
    )
    const derivedBalance =
      Number(userSettings.currentBalance) +
      allBalanceExpenses.reduce((sum, e) => {
        if (e.type === 'income') return sum + Number(e.amount)
        if (e.type === 'expense') return sum - Number(e.amount)
        if (e.type === 'adjustment') return sum + Number(e.amount)
        return sum
      }, 0)

    let weather = null
    if (userSettings.weatherCity) {
      weather = await fetchWeatherData(userSettings.weatherCity)
    }

    return inertia.render('dashboard/index', {
      user: user.serialize(),
      todosToday,
      notesToday: notesToday.map((note) => note.serialize()),
      expensesToday,
      derivedBalance: Number.parseFloat(derivedBalance.toFixed(2)),
      weather,
      userSettings: userSettings.serialize(),
      categories: categories.map((c) => c.serialize()),
    })
  }
}

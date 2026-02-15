import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Note from '#models/note'
import UserSetting from '#models/user_setting'
import { fetchWeatherData } from '#services/weather_service'
import { getExpandedTodosForDate } from '#services/recurring_todo_service'

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const today = DateTime.now()

    const [todosToday, notesToday, userSettings] = await Promise.all([
      getExpandedTodosForDate(user.id, today),

      Note.query()
        .where('user_id', user.id)
        .whereRaw('DATE(due_date) = ?', [today.toSQLDate()!])
        .orderBy('due_date', 'desc'),

      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id, weatherCity: null }),
    ])

    let weather = null
    if (userSettings.weatherCity) {
      weather = await fetchWeatherData(userSettings.weatherCity)
    }

    return inertia.render('dashboard/index', {
      user: user.serialize(),
      todosToday,
      notesToday: notesToday.map((note) => note.serialize()),
      weather,
      userSettings: userSettings.serialize(),
    })
  }
}

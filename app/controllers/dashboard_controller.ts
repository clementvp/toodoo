import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Todo from '#models/todo'
import Note from '#models/note'
import UserSetting from '#models/user_setting'
import { fetchWeatherData } from '#services/weather_service'

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const today = DateTime.now().toSQLDate()

    // Fetch todos, notes, and user settings in parallel
    const [todosToday, notesToday, userSettings] = await Promise.all([
      Todo.query().where('user_id', user.id).where('due_date', today!).orderBy('created_at', 'asc'),

      Note.query()
        .where('user_id', user.id)
        .whereRaw('DATE(created_at) = ?', [today])
        .orderBy('created_at', 'desc'),

      UserSetting.firstOrCreate({ userId: user.id }, { userId: user.id, weatherCity: null }),
    ])

    // Fetch weather if city is configured
    let weather = null
    if (userSettings.weatherCity) {
      weather = await fetchWeatherData(userSettings.weatherCity)
    }

    return inertia.render('dashboard/index', {
      user: user.serialize(),
      todosToday: todosToday.map((todo) => todo.serialize()),
      notesToday: notesToday.map((note) => note.serialize()),
      weather,
      userSettings: userSettings.serialize(),
    })
  }
}

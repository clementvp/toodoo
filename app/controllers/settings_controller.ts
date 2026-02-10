import type { HttpContext } from '@adonisjs/core/http'
import UserSetting from '#models/user_setting'
import { updateUserSettingValidator } from '#validators/user_setting'

export default class SettingsController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const userSettings = await UserSetting.firstOrCreate(
      { userId: user.id },
      { userId: user.id, weatherCity: null }
    )

    return inertia.render('settings/index', {
      user: user.serialize(),
      userSettings: userSettings.serialize(),
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(updateUserSettingValidator)

    const userSettings = await UserSetting.firstOrCreate(
      { userId: user.id },
      { userId: user.id, weatherCity: null }
    )
    if (data.weatherCity !== undefined) {
      userSettings.weatherCity = data.weatherCity || null
    }
    if (data.showPrinterButton !== undefined) {
      userSettings.showPrinterButton = data.showPrinterButton
    }
    await userSettings.save()

    session.flash('success', 'Paramètres mis à jour avec succès')

    return response.redirect().back()
  }
}

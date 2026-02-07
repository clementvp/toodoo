import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Admin middleware vérifie si l'utilisateur connecté est admin
 */
export default class AdminMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {
    const user = auth.user

    if (!user) {
      session.flash('error', 'Vous devez être connecté pour accéder à cette page')
      return response.redirect('/login')
    }

    if (!user.isAdmin()) {
      session.flash('error', "Vous n'avez pas les permissions nécessaires")
      return response.redirect('/')
    }

    return next()
  }
}

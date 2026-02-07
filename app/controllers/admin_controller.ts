import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import {
  createUserValidator,
  updateRoleValidator,
  resetPasswordValidator,
} from '#validators/admin_validator'

export default class AdminController {
  /**
   * Liste tous les utilisateurs
   */
  async index({ inertia }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc')

    return inertia.render('admin/users/index', {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISO(),
      })),
    })
  }

  /**
   * Affiche le formulaire de création d'un utilisateur
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('admin/users/create')
  }

  /**
   * Crée un nouvel utilisateur
   */
  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)

    await User.create({
      email: data.email,
      password: data.password,
      role: 'user',
    })

    session.flash('success', `Utilisateur ${data.email} créé avec succès !`)
    return response.redirect('/admin/users')
  }

  /**
   * Supprime un utilisateur (et toutes ses données via cascade)
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const currentUser = auth.user!

    // Empêcher un admin de se supprimer lui-même
    if (user.id === currentUser.id) {
      session.flash('error', 'Vous ne pouvez pas supprimer votre propre compte')
      return response.redirect('/admin/users')
    }

    await user.delete()

    session.flash('success', `Utilisateur ${user.email} supprimé avec succès`)
    return response.redirect('/admin/users')
  }

  /**
   * Change le rôle d'un utilisateur (admin <-> user)
   */
  async updateRole({ params, request, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(updateRoleValidator)
    const currentUser = auth.user!

    // Empêcher un admin de changer son propre rôle
    if (user.id === currentUser.id) {
      session.flash('error', 'Vous ne pouvez pas modifier votre propre rôle')
      return response.redirect('/admin/users')
    }

    user.role = data.role
    await user.save()

    const action = data.role === 'admin' ? 'promu administrateur' : 'rétrogradé en utilisateur'
    session.flash('success', `${user.email} a été ${action}`)

    return response.redirect('/admin/users')
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  async resetPassword({ params, request, response, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(resetPasswordValidator)

    user.password = data.newPassword
    await user.save()

    session.flash('success', `Mot de passe de ${user.email} réinitialisé avec succès`)
    return response.redirect('/admin/users')
  }
}

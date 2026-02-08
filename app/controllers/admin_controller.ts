import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import {
  createUserValidator,
  updateRoleValidator,
  resetPasswordValidator,
} from '#validators/admin_validator'

export default class AdminController {
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

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/users/create')
  }

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

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const currentUser = auth.user!
    if (user.id === currentUser.id) {
      session.flash('error', 'Vous ne pouvez pas supprimer votre propre compte')
      return response.redirect('/admin/users')
    }

    await user.delete()

    session.flash('success', `Utilisateur ${user.email} supprimé avec succès`)
    return response.redirect('/admin/users')
  }

  async updateRole({ params, request, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(updateRoleValidator)
    const currentUser = auth.user!
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

  async resetPassword({ params, request, response, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(resetPasswordValidator)

    user.password = data.newPassword
    await user.save()

    session.flash('success', `Mot de passe de ${user.email} réinitialisé avec succès`)
    return response.redirect('/admin/users')
  }
}

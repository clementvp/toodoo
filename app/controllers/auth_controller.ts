import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register_validator'
import { loginValidator } from '#validators/login_validator'

export default class AuthController {
  async home({ auth, response }: HttpContext) {
    await auth.use('web').check()

    if (auth.use('web').isAuthenticated) {
      return response.redirect('/')
    }

    return response.redirect('/login')
  }

  async showRegister({ inertia, response, session }: HttpContext) {
    const totalUsers = await User.query().count('* as total')
    const hasUsers = Number(totalUsers[0].$extras.total) > 0
    if (hasUsers) {
      session.flash('error', "L'inscription publique est fermée. Veuillez vous connecter.")
      return response.redirect('/login')
    }

    return inertia.render('auth/register')
  }

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async register({ request, auth, response, session }: HttpContext) {
    const totalUsers = await User.query().count('* as total')
    const isFirstUser = Number(totalUsers[0].$extras.total) === 0
    if (!isFirstUser) {
      session.flash('error', "L'inscription publique est fermée. Contactez un administrateur.")
      return response.redirect('/register')
    }

    const data = await request.validateUsing(registerValidator)
    const user = await User.create({
      email: data.email,
      password: data.password,
      role: isFirstUser ? 'admin' : 'user',
    })

    await auth.use('web').login(user)
    const welcomeMessage = isFirstUser
      ? 'Compte créé avec succès ! Vous êtes le premier utilisateur et donc administrateur.'
      : 'Compte créé avec succès !'
    session.flash('success', welcomeMessage)
    return response.redirect('/')
  }

  async login({ request, auth, response, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const remember = request.input('remember', false)

      const user = await User.verifyCredentials(email, password)

      const rememberBool = Boolean(remember)
      await auth.use('web').login(user, rememberBool)

      session.flash('success', 'Connexion réussie !')
      return response.redirect('/')
    } catch (error) {
      session.flash('error', 'Email ou mot de passe incorrect')
      return response.redirect('/login')
    }
  }

  async logout({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()

    session.flash('success', 'Déconnexion réussie !')
    return response.redirect('/login')
  }
}

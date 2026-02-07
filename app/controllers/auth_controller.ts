import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register_validator'
import { loginValidator } from '#validators/login_validator'

export default class AuthController {
  /**
   * Show registration page
   * Only accessible if there are no users (first user registration)
   */
  async showRegister({ inertia, response, session }: HttpContext) {
    // Vérifier si des utilisateurs existent déjà
    const totalUsers = await User.query().count('* as total')
    const hasUsers = Number(totalUsers[0].$extras.total) > 0

    // Si des utilisateurs existent, rediriger vers login
    if (hasUsers) {
      session.flash('error', "L'inscription publique est fermée. Veuillez vous connecter.")
      return response.redirect('/login')
    }

    return inertia.render('auth/register')
  }

  /**
   * Show login page
   */
  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  /**
   * Handle user registration
   * T027 + T033: Register method with session creation
   * Premier utilisateur devient automatiquement admin
   */
  async register({ request, auth, response, session }: HttpContext) {
    // Vérifier si c'est le premier utilisateur
    const totalUsers = await User.query().count('* as total')
    const isFirstUser = Number(totalUsers[0].$extras.total) === 0

    // Si ce n'est pas le premier utilisateur, l'inscription publique est fermée
    if (!isFirstUser) {
      session.flash('error', "L'inscription publique est fermée. Contactez un administrateur.")
      return response.redirect('/register')
    }

    // Validate input
    const data = await request.validateUsing(registerValidator)

    // Create user - Le premier utilisateur est admin
    const user = await User.create({
      email: data.email,
      password: data.password,
      role: isFirstUser ? 'admin' : 'user',
    })

    // Create session (T033)
    await auth.use('web').login(user)

    // Set success message
    const welcomeMessage = isFirstUser
      ? 'Compte créé avec succès ! Vous êtes le premier utilisateur et donc administrateur.'
      : 'Compte créé avec succès !'
    session.flash('success', welcomeMessage)

    // Redirect to todos page (T038)
    return response.redirect('/todos')
  }

  /**
   * Handle user login
   * T028 + T034: Login method with session creation
   * Support "Remember Me" functionality
   */
  async login({ request, auth, response, session }: HttpContext) {
    // Validate input
    const { email, password, remember } = await request.validateUsing(loginValidator)

    try {
      // Find user and verify credentials
      const user = await User.verifyCredentials(email, password)

      // Create session with optional "remember me" (T034)
      await auth.use('web').login(user, remember ?? false)

      // Set success message
      session.flash('success', 'Connexion réussie !')

      // Redirect to todos page (T038)
      return response.redirect('/todos')
    } catch (error) {
      // Invalid credentials
      session.flash('error', 'Email ou mot de passe incorrect')
      return response.redirect('/login')
    }
  }

  /**
   * Handle user logout
   * T029 + T035: Logout method with session destruction
   */
  async logout({ auth, response, session }: HttpContext) {
    // Destroy session (T035)
    await auth.use('web').logout()

    // Set success message
    session.flash('success', 'Déconnexion réussie !')

    // Redirect to login page
    return response.redirect('/login')
  }
}

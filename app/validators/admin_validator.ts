import vine from '@vinejs/vine'

/**
 * Validator pour créer un utilisateur (par un admin)
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8),
    passwordConfirmation: vine.string().sameAs('password'),
  })
)

/**
 * Validator pour changer le rôle d'un utilisateur
 */
export const updateRoleValidator = vine.compile(
  vine.object({
    role: vine.enum(['admin', 'user']),
  })
)

/**
 * Validator pour réinitialiser le mot de passe d'un utilisateur
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    newPassword: vine.string().minLength(8),
    newPasswordConfirmation: vine.string().sameAs('newPassword'),
  })
)

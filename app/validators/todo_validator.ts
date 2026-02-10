import vine from '@vinejs/vine'

export const createTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().maxLength(65535).optional(),
    dueDate: vine.date({ formats: ['YYYY-MM-DD'] }),
    dueTime: vine
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    priority: vine.enum(['Haute', 'Moyenne', 'Basse']).optional(),
  })
)

export const updateTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().maxLength(65535).optional(),
    dueDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    dueTime: vine
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    status: vine.enum(['À faire', 'Terminé']).optional(),
    priority: vine.enum(['Haute', 'Moyenne', 'Basse']).optional(),
  })
)

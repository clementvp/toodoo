import vine from '@vinejs/vine'

export const createExpenseValidator = vine.compile(
  vine.object({
    type: vine.enum(['income', 'expense']),
    amount: vine.number().positive().decimal([0, 2]),
    categoryId: vine.number().optional(),
    date: vine.date({ formats: ['YYYY-MM-DD'] }),
    recurrenceType: vine.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
    recurrenceEndDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
  })
)

export const updateExpenseValidator = vine.compile(
  vine.object({
    type: vine.enum(['income', 'expense']).optional(),
    amount: vine.number().positive().decimal([0, 2]).optional(),
    categoryId: vine.number().nullable().optional(),
    date: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
    occurrenceDate: vine.string().optional(),
  })
)

export const correctBalanceValidator = vine.compile(
  vine.object({
    targetBalance: vine.number().decimal([0, 2]),
    date: vine.date({ formats: ['YYYY-MM-DD'] }),
  })
)

import vine from '@vinejs/vine'

export const createNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    content: vine.string().trim().minLength(1).maxLength(65535),
    dueDate: vine.date({ formats: ['YYYY-MM-DD'] }),
  })
)

export const updateNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    content: vine.string().trim().minLength(1).maxLength(65535).optional(),
  })
)

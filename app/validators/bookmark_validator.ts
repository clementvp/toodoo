import vine from '@vinejs/vine'

export const createBookmarkValidator = vine.compile(
  vine.object({
    url: vine.string().trim().minLength(1).maxLength(2048),
  })
)

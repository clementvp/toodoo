import vine from '@vinejs/vine'

export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(100),
    color: vine.string().regex(/^#[0-9a-fA-F]{6}$/),
  })
)

import vine from '@vinejs/vine'

export const updateUserSettingValidator = vine.compile(
  vine.object({
    weatherCity: vine.string().trim().minLength(1).maxLength(100).optional(),
  })
)

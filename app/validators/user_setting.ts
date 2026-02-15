import vine from '@vinejs/vine'

export const updateUserSettingValidator = vine.compile(
  vine.object({
    weatherCity: vine.string().trim().minLength(1).maxLength(100).optional(),
    showPrinterButton: vine.boolean().optional(),
    currentBalance: vine.number().min(0).decimal([0, 2]).optional(),
  })
)

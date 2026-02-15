import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Expense from '#models/expense'

export default class ExpenseOccurrence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare expenseId: number

  @column()
  declare date: string

  @column()
  declare status: 'active' | 'deleted'

  @column()
  declare amount: number | null

  @column()
  declare categoryId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Expense)
  declare expense: BelongsTo<typeof Expense>
}

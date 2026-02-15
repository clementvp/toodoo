import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ExpenseCategory from '#models/expense_category'
import ExpenseOccurrence from '#models/expense_occurrence'

export default class Expense extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: 'income' | 'expense' | 'adjustment'

  @column()
  declare amount: number

  @column()
  declare categoryId: number | null

  @column.date()
  declare date: DateTime

  @column()
  declare recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly'

  @column.date()
  declare recurrenceEndDate: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ExpenseCategory)
  declare category: BelongsTo<typeof ExpenseCategory>

  @hasMany(() => ExpenseOccurrence)
  declare occurrences: HasMany<typeof ExpenseOccurrence>
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TodoCompletion from '#models/todo_completion'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date()
  declare dueDate: DateTime

  @column()
  declare dueTime: string | null

  @column()
  declare status: 'À faire' | 'Terminé'

  @column()
  declare priority: 'Haute' | 'Moyenne' | 'Basse'

  @column()
  declare recurrenceType: RecurrenceType

  @column.date()
  declare recurrenceEndDate: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TodoCompletion)
  declare completions: HasMany<typeof TodoCompletion>

  static forUser(query: any, userId: number) {
    query.where('user_id', userId)
  }
}

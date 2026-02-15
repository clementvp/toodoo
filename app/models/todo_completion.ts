import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Todo from '#models/todo'

export default class TodoCompletion extends BaseModel {
  static table = 'todo_completions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare todoId: number

  @column()
  declare date: string // 'YYYY-MM-DD'

  @column()
  declare status: 'Terminé' | 'Supprimé'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Todo)
  declare todo: BelongsTo<typeof Todo>
}

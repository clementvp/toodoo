import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todo_completions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('todo_id')
        .unsigned()
        .references('id')
        .inTable('todos')
        .onDelete('CASCADE')
        .notNullable()
      table.date('date').notNullable()
      // 'Terminé' = completed, 'Supprimé' = occurrence skipped/deleted
      table.string('status', 20).notNullable().defaultTo('Terminé')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['todo_id', 'date'])
      table.index(['todo_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

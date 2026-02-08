import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.date('due_date').notNullable()
      table.time('due_time').nullable()
      table.string('status', 50).notNullable().defaultTo('À faire')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['user_id', 'due_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

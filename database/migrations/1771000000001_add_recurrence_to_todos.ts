import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('recurrence_type', ['none', 'daily', 'weekly', 'monthly'])
        .notNullable()
        .defaultTo('none')
      table.date('recurrence_end_date').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('recurrence_type')
      table.dropColumn('recurrence_end_date')
    })
  }
}

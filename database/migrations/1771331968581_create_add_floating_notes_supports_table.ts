import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Make due_date nullable for floating notes (not tied to a specific day)
      table.date('due_date').nullable().alter()

      // Add created_at for sorting global notes
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('created_at')
      table.date('due_date').notNullable().alter()
    })
  }
}

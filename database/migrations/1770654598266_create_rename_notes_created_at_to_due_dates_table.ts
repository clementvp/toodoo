import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the old index
      table.dropIndex(['user_id', 'created_at'])

      // Rename the column
      table.renameColumn('created_at', 'due_date')

      // Create new index
      table.index(['user_id', 'due_date'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the new index
      table.dropIndex(['user_id', 'due_date'])

      // Rename back to created_at
      table.renameColumn('due_date', 'created_at')

      // Recreate old index
      table.index(['user_id', 'created_at'])
    })
  }
}

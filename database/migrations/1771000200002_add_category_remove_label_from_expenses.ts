import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .bigInteger('category_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('expense_categories')
        .onDelete('SET NULL')
      table.dropColumn('label')

      table.index(['category_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['category_id'])
      table.dropColumn('category_id')
      table.string('label', 255).nullable()
    })
  }
}

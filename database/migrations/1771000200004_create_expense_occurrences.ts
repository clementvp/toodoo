import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expense_occurrences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table
        .bigInteger('expense_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('expenses')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.string('status', 10).notNullable().defaultTo('active')
      table.decimal('amount', 15, 2).nullable()
      table
        .bigInteger('category_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('expense_categories')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['expense_id', 'date'])
    })
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE expense_occurrences ADD CONSTRAINT expense_occurrences_status_check CHECK (status IN ('active','deleted'))`
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

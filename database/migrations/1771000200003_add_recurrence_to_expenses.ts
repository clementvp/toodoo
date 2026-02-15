import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('recurrence_type', 10).notNullable().defaultTo('none')
      table.date('recurrence_end_date').nullable()
    })
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE expenses ADD CONSTRAINT expenses_recurrence_type_check CHECK (recurrence_type IN ('none','daily','weekly','monthly'))`
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_recurrence_type_check`
      )
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('recurrence_type')
      table.dropColumn('recurrence_end_date')
    })
  }
}

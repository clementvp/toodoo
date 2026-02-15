import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_type_check`)
      await db.rawQuery(
        `ALTER TABLE expenses ADD CONSTRAINT expenses_type_check CHECK (type IN ('income', 'expense', 'adjustment'))`
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_type_check`)
      await db.rawQuery(
        `ALTER TABLE expenses ADD CONSTRAINT expenses_type_check CHECK (type IN ('income', 'expense'))`
      )
    })
  }
}

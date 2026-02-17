import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookmarks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('title', 500).nullable()
      table.string('image_url', 2048).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title')
      table.dropColumn('image_url')
    })
  }
}

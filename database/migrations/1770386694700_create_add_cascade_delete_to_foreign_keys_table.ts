import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('todos', (table) => {
      table.dropForeign(['user_id'])
    })

    this.schema.alterTable('notes', (table) => {
      table.dropForeign(['user_id'])
    })

    this.schema.alterTable('todos', (table) => {
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })

    this.schema.alterTable('notes', (table) => {
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable('todos', (table) => {
      table.dropForeign(['user_id'])
    })

    this.schema.alterTable('notes', (table) => {
      table.dropForeign(['user_id'])
    })

    this.schema.alterTable('todos', (table) => {
      table.foreign('user_id').references('id').inTable('users')
    })

    this.schema.alterTable('notes', (table) => {
      table.foreign('user_id').references('id').inTable('users')
    })
  }
}

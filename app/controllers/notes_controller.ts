import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import { createNoteValidator, updateNoteValidator } from '#validators/note_validator'
import { DateTime } from 'luxon'

export default class NotesController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const notes = await Note.query().where('user_id', user.id).orderBy('due_date', 'desc')

    return inertia.render('notes/index', {
      notes: notes.map((note) => note.serialize()),
    })
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    return response.json(note.serialize())
  }

  async create({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createNoteValidator)

    await Note.create({
      userId: user.id,
      title: data.title,
      content: data.content,
      dueDate: DateTime.fromJSDate(data.dueDate),
    })

    session.flash('success', 'Note created successfully!')
    return response.redirect().back()
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).where('user_id', user.id).firstOrFail()
    const data = await request.validateUsing(updateNoteValidator)

    if (data.title !== undefined) note.title = data.title
    if (data.content !== undefined) note.content = data.content
    await note.save()

    return response.redirect().back()
  }

  async delete({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const note = await Note.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await note.delete()

    session.flash('success', 'Note deleted successfully!')
    return response.redirect().back()
  }
}

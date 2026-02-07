import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import { createNoteValidator } from '#validators/note_validator'
import { DateTime } from 'luxon'

export default class NotesController {
  /**
   * T061: Display notes page with calendar view
   */
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!

    // Get all notes (data isolation enforced)
    const notes = await Note.query().where('user_id', user.id).orderBy('created_at', 'desc')

    return inertia.render('notes/index', {
      notes: notes.map((note) => note.serialize()),
    })
  }

  /**
   * T062 + T065: Show a single note with ownership verification
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!

    // T065: Verify ownership
    const note = await Note.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    return response.json(note.serialize())
  }

  /**
   * T063: Create a new note
   */
  async create({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createNoteValidator)

    await Note.create({
      userId: user.id,
      title: data.title,
      content: data.content,
      createdAt: DateTime.fromJSDate(data.createdAt),
    })

    session.flash('success', 'Note created successfully!')
    return response.redirect('/notes')
  }

  /**
   * T064 + T065: Delete a note with ownership verification
   */
  async delete({ params, auth, response, session }: HttpContext) {
    const user = auth.user!

    // T065: Verify ownership before delete
    const note = await Note.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await note.delete()

    session.flash('success', 'Note deleted successfully!')
    return response.redirect('/notes')
  }
}

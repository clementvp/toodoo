import type { HttpContext } from '@adonisjs/core/http'
import Bookmark from '#models/bookmark'
import { createBookmarkValidator } from '#validators/bookmark_validator'
import BookmarkMetadataService from '#services/bookmark_metadata_service'

export default class BookmarksController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const bookmarks = await Bookmark.query().where('user_id', user.id).orderBy('created_at', 'desc')

    return inertia.render('bookmarks/index', { bookmarks })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createBookmarkValidator)

    const metadataService = new BookmarkMetadataService()
    const { title, imageUrl } = await metadataService.fetch(data.url)

    const bookmark = new Bookmark()
    bookmark.userId = user.id
    bookmark.url = data.url
    bookmark.title = title
    bookmark.imageUrl = imageUrl
    await bookmark.save()

    session.flash('success', 'Bookmark ajouté avec succès')
    return response.redirect('/bookmarks')
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const bookmark = await Bookmark.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await bookmark.delete()

    session.flash('success', 'Bookmark supprimé avec succès')
    return response.redirect('/bookmarks')
  }
}

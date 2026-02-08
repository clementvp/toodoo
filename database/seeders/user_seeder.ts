import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Todo from '#models/todo'
import Note from '#models/note'
import Bookmark from '#models/bookmark'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const user = await User.firstOrCreate(
      { email: 'test@example.com' },
      {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      }
    )

    await User.firstOrCreate(
      { email: 'admin@example.com' },
      {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      }
    )

    await Todo.firstOrCreate(
      { title: 'Complete project setup', userId: user.id },
      {
        userId: user.id,
        title: 'Complete project setup',
        description: 'Initialize AdonisJS project with all dependencies',
        dueDate: DateTime.now(),
        dueTime: '10:00',
        status: 'Terminé',
      }
    )

    await Todo.firstOrCreate(
      { title: 'Review pull requests', userId: user.id },
      {
        userId: user.id,
        title: 'Review pull requests',
        description: 'Review and merge pending PRs from the team',
        dueDate: DateTime.now().plus({ days: 1 }),
        dueTime: '14:00',
        status: 'À faire',
      }
    )

    await Todo.firstOrCreate(
      { title: 'Team meeting', userId: user.id },
      {
        userId: user.id,
        title: 'Team meeting',
        description: 'Weekly sync with the development team',
        dueDate: DateTime.now().plus({ days: 2 }),
        dueTime: '15:30',
        status: 'À faire',
      }
    )

    await Note.firstOrCreate(
      { title: 'Project Ideas', userId: user.id },
      {
        userId: user.id,
        title: 'Project Ideas',
        content:
          'List of potential features to implement:\n- Dark mode support\n- Export to PDF\n- Email notifications\n- Mobile app',
        createdAt: DateTime.now(),
      }
    )

    await Note.firstOrCreate(
      { title: 'Meeting Notes', userId: user.id },
      {
        userId: user.id,
        title: 'Meeting Notes',
        content:
          'Discussed the following topics:\n1. Sprint planning\n2. Code review process\n3. Testing strategy\n4. Deployment pipeline',
        createdAt: DateTime.now().minus({ days: 1 }),
      }
    )

    await Bookmark.firstOrCreate(
      { url: 'https://adonisjs.com', userId: user.id },
      {
        userId: user.id,
        url: 'https://adonisjs.com',
        createdAt: DateTime.now(),
      }
    )

    await Bookmark.firstOrCreate(
      { url: 'https://react.dev', userId: user.id },
      {
        userId: user.id,
        url: 'https://react.dev',
        createdAt: DateTime.now().minus({ hours: 2 }),
      }
    )

    await Bookmark.firstOrCreate(
      { url: 'https://ant.design', userId: user.id },
      {
        userId: user.id,
        url: 'https://ant.design',
        createdAt: DateTime.now().minus({ days: 1 }),
      }
    )
  }
}

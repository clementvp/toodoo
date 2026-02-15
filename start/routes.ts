import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')

router.get('/register', [AuthController, 'showRegister'])
router.post('/register', [AuthController, 'register'])
router.get('/login', [AuthController, 'showLogin'])
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout'])

router
  .group(() => {
    const DashboardController = () => import('#controllers/dashboard_controller')
    router.get('/', [DashboardController, 'index'])
    const SettingsController = () => import('#controllers/settings_controller')
    router.get('/settings', [SettingsController, 'index'])
    router.patch('/settings', [SettingsController, 'update'])
    const TodosController = () => import('#controllers/todos_controller')
    router.get('/todos', [TodosController, 'index'])
    router.post('/todos', [TodosController, 'create'])
    router.patch('/todos/:id', [TodosController, 'update'])
    router.delete('/todos/:id/occurrence', [TodosController, 'deleteOccurrence'])
    router.delete('/todos/:id', [TodosController, 'delete'])
    const NotesController = () => import('#controllers/notes_controller')
    router.get('/notes', [NotesController, 'index'])
    router.get('/notes/:id', [NotesController, 'show'])
    router.post('/notes', [NotesController, 'create'])
    router.delete('/notes/:id', [NotesController, 'delete'])
    const BookmarksController = () => import('#controllers/bookmarks_controller')
    router.get('/bookmarks', [BookmarksController, 'index'])
    router.post('/bookmarks', [BookmarksController, 'store'])
    router.delete('/bookmarks/:id', [BookmarksController, 'destroy'])
  })
  .use(middleware.auth())

router
  .group(() => {
    const AdminController = () => import('#controllers/admin_controller')
    router.get('/admin/users', [AdminController, 'index'])
    router.get('/admin/users/create', [AdminController, 'create'])
    router.post('/admin/users', [AdminController, 'store'])
    router.delete('/admin/users/:id', [AdminController, 'destroy'])
    router.patch('/admin/users/:id/role', [AdminController, 'updateRole'])
    router.patch('/admin/users/:id/reset-password', [AdminController, 'resetPassword'])
  })
  .use([middleware.auth(), middleware.admin()])

# Quickstart Guide: Bookmarks Management

**Feature**: 002-bookmarks
**Date**: 2026-02-06
**Audience**: Developers implementing or testing the bookmarks feature

---

## Prerequisites

- Node.js 20.6+ installed
- PostgreSQL running and configured
- Project dependencies installed (`npm install`)
- Database configured in `.env` file

---

## Setup

### 1. Run Database Migration

Create the `bookmarks` table:

```bash
node ace migration:run
```

Expected output:
```
✔ Executed 1 migrations in 45ms
  ❯ database/migrations/[timestamp]_create_bookmarks_table
```

### 2. Verify Migration

Check that the table was created:

```bash
node ace db:query "SELECT table_name FROM information_schema.tables WHERE table_name = 'bookmarks'"
```

Or use your PostgreSQL client:
```sql
\dt bookmarks
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3333` with hot module reloading.

### Access Bookmarks Feature

1. Navigate to `http://localhost:3333/login`
2. Log in with your user credentials
3. Navigate to `http://localhost:3333/bookmarks`

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Bookmark-Specific Tests

**Functional tests:**
```bash
node ace test tests/functional/bookmarks.spec.ts
```

**Unit tests (validator):**
```bash
node ace test tests/unit/bookmark_validator.spec.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

---

## Usage Examples

### 1. Add a Bookmark

**Via UI:**
1. Navigate to `/bookmarks`
2. Enter any text in the URL field (e.g., `https://example.com` or `my-note`)
3. Click "Ajouter" button
4. Bookmark appears in the list immediately

**Via curl:**
```bash
curl -X POST http://localhost:3333/bookmarks \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Cookie: adonis-session=YOUR_SESSION_COOKIE" \
  -d "url=https://example.com"
```

### 2. View Bookmark List

**Via UI:**
1. Navigate to `/bookmarks`
2. All your bookmarks appear in reverse chronological order (newest first)

**Via curl:**
```bash
curl http://localhost:3333/bookmarks \
  -H "Cookie: adonis-session=YOUR_SESSION_COOKIE"
```

### 3. Open a Bookmark

**Via UI:**
1. Click the "Ouvrir" button next to any bookmark
2. The link opens in a new browser tab

### 4. Delete a Bookmark

**Via UI:**
1. Click the "Supprimer" button next to a bookmark
2. Confirm deletion in the modal dialog
3. Bookmark is removed from the list

**Via curl:**
```bash
curl -X DELETE http://localhost:3333/bookmarks/42 \
  -H "Cookie: adonis-session=YOUR_SESSION_COOKIE"
```

---

## Code Structure

### Backend Files

```
app/
├── models/
│   └── bookmark.ts                    # Lucid ORM model
├── controllers/
│   └── bookmarks_controller.ts        # CRUD controller
└── validators/
    └── bookmark_validator.ts          # VineJS validation schema

database/
└── migrations/
    └── [timestamp]_create_bookmarks_table.ts

start/
└── routes.ts                          # Route definitions (bookmarks group)
```

### Frontend Files

```
inertia/
├── pages/
│   └── bookmarks/
│       └── index.tsx                  # Main bookmarks page
├── components/
│   └── cards/
│       ├── bookmark_form_card.tsx     # Add bookmark form
│       └── bookmark_list_card.tsx     # Bookmark list display
└── lib/
    └── types.ts                       # TypeScript interfaces (Bookmark)
```

### Test Files

```
tests/
├── functional/
│   └── bookmarks.spec.ts              # API endpoint tests
└── unit/
    └── bookmark_validator.spec.ts     # Validation tests
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/bookmarks` | List all user's bookmarks |
| POST | `/bookmarks` | Create new bookmark |
| DELETE | `/bookmarks/:id` | Delete specific bookmark |

All endpoints require authentication.

---

## Database Schema

```sql
CREATE TABLE bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);
```

---

## Common Tasks

### Reset Bookmarks for a User

```bash
node ace tinker
```

Then in the REPL:
```javascript
const { default: Bookmark } = await import('#models/bookmark')
await Bookmark.query().where('user_id', 1).delete()
```

### Create Sample Bookmarks

```bash
node ace tinker
```

Then:
```javascript
const { default: Bookmark } = await import('#models/bookmark')
await Bookmark.createMany([
  { userId: 1, url: 'https://google.com' },
  { userId: 1, url: 'https://github.com' },
  { userId: 1, url: 'my-personal-note' },
])
```

### Check Migration Status

```bash
node ace migration:status
```

### Rollback Migration

```bash
node ace migration:rollback
```

---

## Troubleshooting

### Migration Fails

**Error**: `relation "bookmarks" already exists`

**Solution**: The table was already created. Either:
- Skip this migration: Already complete
- Drop and recreate: `node ace migration:rollback` then `node ace migration:run`

### Cannot Access /bookmarks

**Error**: Redirected to `/login`

**Cause**: Not authenticated

**Solution**: Log in first at `/login`

### Validation Error: "Le champ url est requis"

**Cause**: URL field is empty or contains only whitespace

**Solution**: Enter at least one character in the URL field

### 404 on DELETE

**Cause**: Bookmark doesn't exist or belongs to another user

**Solution**: Verify bookmark ID and ownership

---

## Development Workflow

### Adding a New Bookmark Feature

1. Update the model if needed (`app/models/bookmark.ts`)
2. Update the validator (`app/validators/bookmark_validator.ts`)
3. Add controller method (`app/controllers/bookmarks_controller.ts`)
4. Add route (`start/routes.ts`)
5. Update frontend components (`inertia/pages/bookmarks/`)
6. Write tests (`tests/functional/bookmarks.spec.ts`)
7. Run tests: `npm test`

### Debugging

**Enable SQL query logging:**

Edit `config/database.ts`:
```typescript
debug: true  // Log all SQL queries
```

**Check server logs:**
```bash
npm run dev  # Watch terminal output
```

**Inspect database:**
```bash
node ace db:query "SELECT * FROM bookmarks WHERE user_id = 1"
```

---

## Performance Tips

- The composite index `(user_id, created_at)` optimizes list queries
- No pagination needed for <1000 bookmarks per user
- Consider adding pagination if users regularly exceed 1000 bookmarks

---

## Security Notes

- All routes protected by `auth` middleware
- Users can only access their own bookmarks
- CSRF protection enabled by default (AdonisJS Shield)
- SQL injection prevented by Lucid query builder
- XSS prevented by React's automatic escaping

---

## Next Steps

After confirming the feature works:

1. Run `/speckit.tasks` to generate implementation task breakdown
2. Follow task order for implementation
3. Test each user story independently (P1 → P2 → P3)
4. Deploy incrementally after each story is complete

---

## Resources

- **Spec**: `specs/002-bookmarks/spec.md`
- **Plan**: `specs/002-bookmarks/plan.md`
- **Data Model**: `specs/002-bookmarks/data-model.md`
- **API Contract**: `specs/002-bookmarks/contracts/api.md`
- **AdonisJS Docs**: https://docs.adonisjs.com
- **Lucid ORM**: https://lucid.adonisjs.com
- **VineJS**: https://vinejs.dev
- **Inertia.js**: https://inertiajs.com
- **Ant Design**: https://ant.design

---

## Support

For issues or questions:
1. Check existing Notes/Todos implementation for patterns
2. Review AdonisJS documentation
3. Check test files for usage examples
4. Consult the spec and plan documents in `specs/002-bookmarks/`

---

**Happy coding!** 🚀

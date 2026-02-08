# Quickstart: Super Todo & Notes Web Application

**Date**: 2026-02-05
**Feature**: Super Todo & Notes Web Application
**Branch**: `001-todo-notes-app`

## Overview

This quickstart guide provides step-by-step instructions to set up, develop, and test the Super Todo & Notes application locally. Follow these instructions to go from zero to a running application.

---

## Prerequisites

**Required**:

- Node.js 20.6+ ([Download](https://nodejs.org/))
- Docker Desktop (for PostgreSQL) ([Download](https://www.docker.com/products/docker-desktop))
- Git ([Download](https://git-scm.com/))

**Recommended**:

- VSCode with extensions:
  - [Japa VSCode](https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode) (test runner)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

**Verify Installation**:

```bash
node --version   # Should be 20.6 or higher
docker --version # Should show Docker version
git --version    # Should show Git version
```

---

## Initial Setup (15 minutes)

### Step 1: Clone and Initialize Project

```bash
# Create new AdonisJS v6 project with Inertia.js + React (no SSR)
# This command initializes the project in the current directory
npm init adonisjs@latest . -- -K=inertia --adapter=react --no-ssr

# The flags explanation:
# -K=inertia: Use the Inertia.js starter kit
# --adapter=react: Use React as the frontend adapter
# --no-ssr: Disable server-side rendering

# Note: This will prompt you for:
# - Install dependencies: Yes (recommended)
# - Configure ESLint: Yes (recommended)
# - Configure Prettier: Yes (recommended)
```

### Step 2: Install Dependencies

```bash
# Install required packages
npm install @adonisjs/lucid@latest
npm install pg
npm install dayjs
npm install antd

# Install dev dependencies for testing
npm install -D @japa/runner @japa/assert @japa/api-client @japa/browser-client
npm install -D playwright
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Playwright browsers
npx playwright install --with-deps
```

### Step 3: Configure Lucid (Database ORM)

```bash
# Configure Lucid
node ace configure @adonisjs/lucid

# When prompted, select:
# - Database: PostgreSQL
# - Display Lucid model with faker API: No
```

### Step 4: Start PostgreSQL with Docker

**Create `docker-compose.yml`** in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: todo_notes_db
    environment:
      POSTGRES_DB: todo_notes
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**Start Database**:

```bash
docker-compose up -d

# Verify database is running
docker-compose ps  # Should show postgres container as "Up"
```

### Step 5: Configure Environment

**Update `.env` file**:

```env
# Application
TZ=UTC
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=your-random-32-char-secret-key  # Generate with: node ace generate:key
NODE_ENV=development

# Database
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=todo_notes
DB_USER=postgres
DB_PASSWORD=postgres

# Session
SESSION_DRIVER=cookie
```

**Generate App Key**:

```bash
node ace generate:key
# Copy output to .env APP_KEY
```

---

## Database Setup (10 minutes)

### Step 1: Create Migrations

```bash
# Create user migration
node ace make:migration users

# Create todos migration
node ace make:migration todos

# Create notes migration
node ace make:migration notes
```

### Step 2: Fill Migration Files

**`database/migrations/xxx_create_users_table.ts`**:

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**`database/migrations/xxx_create_todos_table.ts`**:

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.date('due_date').notNullable()
      table.time('due_time').nullable()
      table.string('status', 50).notNullable().defaultTo('À faire')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['user_id', 'due_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**`database/migrations/xxx_create_notes_table.ts`**:

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.string('title', 255).notNullable()
      table.text('content').notNullable()
      table.date('created_at').notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### Step 3: Run Migrations

```bash
node ace migration:run

# Verify migrations succeeded
node ace migration:status
# Should show 3 migrations as "completed"
```

---

## Development Workflow (Ongoing)

### Running the Application

```bash
# Start development server (with hot reload)
npm run dev

# Server will start at http://localhost:3333
```

**Access the application**:

- Open browser to `http://localhost:3333`
- You should see the AdonisJS welcome page initially

### Running Tests

**All tests**:

```bash
node ace test
```

**Specific test suite**:

```bash
node ace test --suite=unit
node ace test --suite=functional
node ace test --suite=browser
```

**Watch mode** (re-run on file changes):

```bash
node ace test --watch
```

**React component tests**:

```bash
npm run test:components  # Runs Vitest
```

### Database Commands

**Rollback last migration batch**:

```bash
node ace migration:rollback
```

**Rollback all migrations**:

```bash
node ace migration:rollback --batch=0
```

**Fresh migrations** (drop all + re-run):

```bash
node ace migration:fresh
```

**Fresh migrations with seeders**:

```bash
node ace migration:fresh --seed
```

**Check migration status**:

```bash
node ace migration:status
```

### Code Quality

**Lint code**:

```bash
npm run lint
```

**Fix linting issues**:

```bash
npm run lint:fix
```

**Format code with Prettier**:

```bash
npm run format
```

### Docker Commands

**Start database**:

```bash
docker-compose up -d
```

**Stop database**:

```bash
docker-compose down
```

**View database logs**:

```bash
docker-compose logs -f postgres
```

**Access PostgreSQL CLI**:

```bash
docker exec -it todo_notes_db psql -U postgres -d todo_notes

# Inside psql:
\dt          # List tables
\d users     # Describe users table
SELECT * FROM users;  # Query users
\q           # Quit
```

---

## Validation Checklist

After completing setup, verify everything works:

- [ ] **Database**: `docker-compose ps` shows postgres as "Up"
- [ ] **Migrations**: `node ace migration:status` shows 3 completed migrations
- [ ] **Dev Server**: `npm run dev` starts without errors
- [ ] **Browser Access**: `http://localhost:3333` loads successfully
- [ ] **Tests**: `node ace test` runs without errors (may have 0 tests initially)

---

## Troubleshooting

### Database Connection Errors

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:

```bash
# Ensure PostgreSQL container is running
docker-compose up -d

# Check container status
docker-compose ps

# View logs for errors
docker-compose logs postgres
```

### Migration Errors

**Error**: `relation "users" already exists`

**Solution**:

```bash
# Rollback and re-run migrations
node ace migration:rollback
node ace migration:run
```

### Port Already in Use

**Error**: `Port 3333 is already in use`

**Solution**:

```bash
# Change port in .env
PORT=4000

# Or kill process using port 3333
lsof -ti:3333 | xargs kill -9
```

### Node Version Mismatch

**Error**: `The engine "node" is incompatible`

**Solution**:

```bash
# Check Node.js version
node --version  # Must be 20.6+

# Install correct version via nvm (if using nvm)
nvm install 20
nvm use 20
```

---

## Next Steps

Now that your environment is set up, proceed with implementation:

1. **Review Documentation**:
   - Read `specs/001-todo-notes-app/plan.md` for technical architecture
   - Read `specs/001-todo-notes-app/data-model.md` for entity details
   - Read `specs/001-todo-notes-app/contracts/*.md` for API specifications

2. **Implementation Phase**:
   - Run `/speckit.tasks` to generate actionable task list
   - Follow tasks in order: Setup → Foundation → User Stories (P1 → P2 → P3)

3. **Testing Strategy**:
   - Write tests BEFORE implementation (optional, but recommended)
   - Verify data isolation for all CRUD operations
   - Test performance goals (calendar <1s, modal <1s)

---

## Useful Commands Reference

| Command                           | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `npm run dev`                     | Start development server with hot reload |
| `node ace test`                   | Run all tests                            |
| `node ace migration:run`          | Apply pending migrations                 |
| `node ace migration:rollback`     | Revert last migration batch              |
| `node ace make:migration <name>`  | Create new migration                     |
| `node ace make:model <name>`      | Create new Lucid model                   |
| `node ace make:controller <name>` | Create new controller                    |
| `docker-compose up -d`            | Start PostgreSQL container               |
| `docker-compose down`             | Stop PostgreSQL container                |
| `npm run lint`                    | Check code style                         |
| `npm run format`                  | Format code with Prettier                |

---

## Resources

**AdonisJS Documentation**:

- [Getting Started](https://docs.adonisjs.com/guides/getting-started/installation)
- [Lucid ORM](https://docs.adonisjs.com/guides/database/introduction)
- [Inertia.js Adapter](https://docs.adonisjs.com/guides/views-and-templates/inertia)
- [Testing](https://docs.adonisjs.com/guides/testing/introduction)

**Libraries**:

- [Ant Design Components](https://ant.design/components/overview/)
- [Day.js Documentation](https://day.js.org/docs/en/installation/installation)
- [Inertia.js Documentation](https://inertiajs.com/docs/v2)

**Testing**:

- [Japa Documentation](https://japa.dev/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/guide/)

---

## Support

For issues specific to this project:

- Check `specs/001-todo-notes-app/research.md` for technical decisions
- Review `specs/001-todo-notes-app/contracts/` for API specifications
- Consult constitution principles in `.specify/memory/constitution.md`

For framework/library issues:

- [AdonisJS Discord](https://discord.gg/vDcEjq6)
- [Stack Overflow - AdonisJS](https://stackoverflow.com/questions/tagged/adonisjs)
- [Ant Design GitHub Issues](https://github.com/ant-design/ant-design/issues)

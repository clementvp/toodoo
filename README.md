# Todo & Notes Web Application

A secure, multi-user web application for managing todos and notes with a calendar-based interface.

## Features

- 🔐 **User Authentication** - Secure registration and login with session management
- ✅ **Todo Management** - Create, update, delete todos with dates and times
- 📝 **Notes Management** - Create, view, delete notes organized by date
- 📅 **Calendar View** - Intuitive 80/20 split layout with monthly calendar
- 🎨 **Modern Design** - Clean UI with Modern Productivity color palette
- 🔒 **Data Isolation** - Complete user data isolation (users can only see their own data)
- 📱 **Responsive** - Mobile-friendly design

## Tech Stack

- **Backend**: AdonisJS v6 (Node.js + TypeScript)
- **Frontend**: Inertia.js + React + TypeScript
- **UI Library**: Ant Design v6.2.2
- **Database**: PostgreSQL 15 (Docker)
- **Date Library**: Day.js
- **Testing**: Japa + Playwright + Vitest

## Prerequisites

- Node.js 20.6 or higher
- Docker Desktop
- Git

## Quick Start

### 1. Clone and Install

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium
```

### 2. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Generate app key
node ace generate:key
# Copy the output and paste it in .env as APP_KEY value
```

### 3. Start Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker-compose ps
```

### 4. Run Migrations

```bash
# Create database tables
node ace migration:run

# (Optional) Seed with test data
node ace db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3333 and you'll be redirected to the login page.

## Test Account (if seeded)

- **Email**: test@example.com
- **Password**: password123

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

## Database Commands

```bash
# Run pending migrations
node ace migration:run

# Rollback last migration batch
node ace migration:rollback

# Rollback all migrations
node ace migration:rollback --batch=0

# Fresh migrations (drop all + re-run)
node ace migration:fresh

# Fresh migrations with seed data
node ace migration:fresh --seed

# Seed database
node ace db:seed

# Check migration status
node ace migration:status
```

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it todo_notes_db psql -U postgres -d todo_notes
```

## Project Structure

```
├── app/                    # Backend application code
│   ├── controllers/        # HTTP controllers
│   ├── models/            # Database models (Lucid ORM)
│   ├── middleware/        # Request middleware
│   └── validators/        # Request validation
├── database/
│   ├── migrations/        # Database migrations
│   └── seeders/          # Seed data
├── inertia/              # Frontend React code
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   └── lib/              # Utilities and types
├── start/                # Application bootstrap
│   └── routes.ts         # Route definitions
├── config/               # Configuration files
└── tests/                # Test files
```

## Environment Variables

| Variable         | Description                                            | Default     |
| ---------------- | ------------------------------------------------------ | ----------- |
| `PORT`           | Server port                                            | 3333        |
| `HOST`           | Server host                                            | localhost   |
| `APP_KEY`        | Encryption key (generate with `node ace generate:key`) | -           |
| `NODE_ENV`       | Environment                                            | development |
| `DB_HOST`        | PostgreSQL host                                        | 127.0.0.1   |
| `DB_PORT`        | PostgreSQL port                                        | 5432        |
| `DB_USER`        | Database user                                          | postgres    |
| `DB_PASSWORD`    | Database password                                      | postgres    |
| `DB_DATABASE`    | Database name                                          | todo_notes  |
| `SESSION_DRIVER` | Session driver                                         | cookie      |
| `CSRF_ENABLED`   | Enable CSRF protection                                 | true        |

## Features Detail

### Authentication

- Secure registration with email validation
- Password hashing with scrypt
- Session-based authentication
- Automatic logout on session expiry
- Protected routes with auth middleware

### Todo Management

- Create todos with title, description, date, and time
- Toggle status between "À faire" and "Terminé"
- Delete todos
- View todos filtered by selected calendar day
- Time display in HH:mm format
- Ownership verification (users can only modify their own todos)

### Notes Management

- Create notes with title and content
- View notes in modal popup
- Delete notes
- View notes filtered by selected calendar day
- Full-text content display in modal
- Ownership verification (users can only view/delete their own notes)

### Calendar Interface

- Monthly calendar view (80% width)
- Side panel with list and form (20% width)
- Click day to filter items
- Navigate between months
- Condensed item titles in calendar cells (badges)
- Color-coded: Todos (emerald), Notes (amber)
- Responsive: vertical stack on mobile

## Security Features

- Password hashing (scrypt)
- CSRF protection on all forms
- Session-based authentication
- HTTP-only session cookies
- Data isolation (user can only see their own data)
- Ownership verification on all update/delete operations
- Input validation on all forms
- SQL injection protection (Lucid ORM)

## Performance

- Optimistic UI updates for instant feedback
- Database indexes on user_id and date fields
- Efficient queries with Lucid ORM
- Calendar updates < 1s
- Modal opens < 1s
- No page reloads for CRUD operations (Inertia.js)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Database connection error

```bash
# Ensure PostgreSQL is running
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Port 3333 already in use

```bash
# Change PORT in .env file
PORT=4000
```

### Migration errors

```bash
# Rollback and re-run
node ace migration:rollback
node ace migration:run
```

## License

UNLICENSED

## Contributing

This is a private project. For issues or improvements, please contact the development team.

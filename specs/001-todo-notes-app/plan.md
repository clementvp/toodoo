# Implementation Plan: Super Todo & Notes Web Application

**Branch**: `001-todo-notes-app` | **Date**: 2026-02-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-todo-notes-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a secure, multi-user web application for managing todos and notes with a calendar-based interface. Users can create accounts, log in, and manage their personal todos and notes organized by date. The interface features an 80/20 split layout: a monthly calendar view showing item titles, and a side panel with display and creation cards. Technical approach uses AdonisJS v6 fullstack framework with Inertia.js/React frontend, Ant Design UI library, and PostgreSQL database for data persistence with strict user isolation.

## Technical Context

**Language/Version**: Node.js with TypeScript (AdonisJS v6 requires Node.js 20.6+)
**Framework**: AdonisJS v6 (fullstack framework with server-side rendering via Inertia.js)
**Frontend**: Inertia.js with React (TypeScript) + Ant Design (antd) v6.2.2
**Date Library**: Day.js (for all date manipulation and timezone handling)
**Storage**: PostgreSQL (containerized via Docker Compose)
**Authentication**: AdonisJS native session-based auth (with optional Opaque Token support)
**Testing**: Japa test runner (AdonisJS v6 official) - Unit (70%), Functional (25%), Browser/Playwright (5%); Vitest for React components
**Target Platform**: Web browsers (desktop and mobile responsive)
**Project Type**: Web application (fullstack with SSR)
**Performance Goals**: Calendar updates <1s (FR-007), modal opens <1s (SC-007), no page reloads for CRUD operations (SC-011)
**Constraints**: Strict user data isolation (FR-003, SC-003), 80/20 layout split, responsive design for mobile
**Scale/Scope**: Small to medium scale (personal productivity app), ~3 main pages (auth, todos, notes), PostgreSQL single instance

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verify compliance with constitution principles defined in `.specify/memory/constitution.md`:

- **Simplicity (YAGNI)**: ✅ No premature abstractions or speculative features
- **Observability**: ✅ Structured logging and error handling planned
- **User-Centric Development**: ✅ Feature organized around prioritized user stories
- **Quality Gates**: ✅ Testing strategy matches feature risk profile
- **Incremental Delivery**: ✅ Implementation plan supports independent story deployment

_Note: Mark ⚠️ for violations that require justification in Complexity Tracking section below._

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# AdonisJS v6 with Inertia.js/React structure
app/
├── controllers/          # HTTP controllers (auth, todos, notes)
│   ├── auth_controller.ts
│   ├── todos_controller.ts
│   └── notes_controller.ts
├── models/              # Database models (Lucid ORM)
│   ├── user.ts
│   ├── todo.ts
│   └── note.ts
├── middleware/          # Request middleware (auth, CSRF)
└── validators/          # Request validation schemas

database/
├── migrations/          # Database schema migrations
└── seeders/            # Database seed files (optional)

inertia/
├── pages/              # React page components (Inertia.js)
│   ├── auth/
│   │   ├── register.tsx
│   │   └── login.tsx
│   ├── todos/
│   │   └── index.tsx   # Calendar + side panel layout
│   └── notes/
│       └── index.tsx   # Calendar + side panel layout
├── components/         # Shared React components
│   ├── layout/
│   │   ├── header.tsx  # Global header with nav/logout
│   │   └── calendar_layout.tsx  # 80/20 split container
│   ├── calendar/
│   │   └── calendar_view.tsx    # Ant Design Calendar wrapper
│   └── cards/
│       ├── item_list_card.tsx   # Top card (display)
│       └── item_form_card.tsx   # Bottom card (create)
└── lib/               # Utilities, types, API clients
    ├── types.ts       # TypeScript interfaces
    └── date_utils.ts  # Day.js helpers

public/
└── assets/            # Static assets (CSS, images)

config/                # AdonisJS configuration files
start/                 # Application bootstrapping
tests/                 # Test files (Japa test runner)

docker-compose.yml     # PostgreSQL container definition
.env                   # Environment configuration
package.json           # Node.js dependencies
tsconfig.json          # TypeScript configuration
```

**Structure Decision**: Using AdonisJS v6 fullstack structure with Inertia.js integration. The `app/` directory contains backend logic (controllers, models, middleware, validators), while `inertia/` contains React frontend components. This monolithic structure is appropriate for a small-to-medium web application and aligns with AdonisJS conventions. The calendar layout components are shared between todos and notes pages to maintain consistency and reduce duplication.

## Complexity Tracking

> **No violations detected - this section is empty**

**Initial Constitution Check (Pre-Phase 0)**: ✅ PASSED

The implementation plan adheres to all constitution principles:

- Uses proven, well-established stack (AdonisJS, React, Ant Design)
- No premature abstractions or speculative features
- Feature organized around 3 prioritized, independently testable user stories
- Testing strategy resolved through research (Japa + Vitest, 70/25/5 pyramid)
- Incremental delivery supported by user story priorities (P1 → P2 → P3)

**Post-Phase 1 Constitution Check**: ✅ PASSED

After completing technical research and design artifacts:

- ✅ **Simplicity (YAGNI)**: No premature abstractions. React local state sufficient, no Redux. Standard REST APIs, no GraphQL complexity.
- ✅ **Observability**: Structured logging planned for state-changing operations. Error messages include context. Performance instrumented (<1s requirements).
- ✅ **User-Centric Development**: 3 user stories (P1: Auth, P2: Todos, P3: Notes) independently testable and deliverable as MVPs.
- ✅ **Quality Gates**: Multi-layered testing strategy (unit/functional/browser) matches risk profile. Data isolation tests mandatory for FR-003.
- ✅ **Incremental Delivery**: Each user story deployable independently. Foundation phase blocks all stories, then parallel implementation possible.

**Conclusion**: No constitution violations. Ready to proceed to Phase 2 (Task Generation via `/speckit.tasks`).

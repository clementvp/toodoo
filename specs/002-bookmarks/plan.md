# Implementation Plan: Bookmarks Management

**Branch**: `002-bookmarks` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-bookmarks/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a bookmark management feature that allows users to save, view, and open URL links. Each bookmark contains only a URL (required field) with no title, description, or calendar integration. The feature follows the existing app pattern with user-scoped data, following the same architecture as Notes and Todos.

## Technical Context

**Language/Version**: TypeScript with Node.js 20.6+ (AdonisJS v6 requirement)
**Primary Dependencies**: AdonisJS v6, Lucid ORM, VineJS for validation, Inertia.js with React
**Storage**: PostgreSQL (existing database)
**Testing**: Japa test runner (AdonisJS native testing framework)
**Target Platform**: Web application (server-rendered with Inertia.js SSR)
**Project Type**: Web application (AdonisJS backend + React/Inertia frontend)
**Performance Goals**:

- Add bookmark: <5 seconds (includes validation and persistence)
- View bookmark list: <2 seconds (query + render)
- Support up to 1000 bookmarks per user without pagination
  **Constraints**:
- Must follow existing user authentication patterns
- Must scope bookmarks to authenticated users
- Must validate URL format before saving
  **Scale/Scope**:
- Multi-user application
- User-scoped bookmarks (similar to Notes and Todos)
- Single entity (Bookmark model)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verify compliance with constitution principles defined in `.specify/memory/constitution.md`:

### Initial Check (Pre-Phase 0)

- **Simplicity (YAGNI)**: ✅ Minimal feature set - only URL storage, no abstractions beyond existing patterns
- **Observability**: ✅ Will use existing logging infrastructure, standard validation error messages
- **User-Centric Development**: ✅ Feature organized around 3 prioritized user stories (P1: Add, P2: View, P3: Open)
- **Quality Gates**: ✅ Will use VineJS validation, follow existing model patterns, leverage Japa tests
- **Incremental Delivery**: ✅ Each user story can be implemented and deployed independently

### Post-Phase 1 Review (After Design)

- **Simplicity (YAGNI)**: ✅ CONFIRMED
  - Single entity (Bookmark model)
  - Minimal validation (only required + length check, NO format validation per user request)
  - Reuses existing patterns (same structure as Note/Todo models)
  - No premature abstractions or helper classes

- **Observability**: ✅ CONFIRMED
  - Leverages existing AdonisJS logging
  - VineJS provides clear validation error messages in French
  - Database queries use Lucid ORM (logged when debug enabled)
  - Session flash messages for user feedback

- **User-Centric Development**: ✅ CONFIRMED
  - P1 (Add): Independently testable - can create and verify bookmark creation
  - P2 (View): Independently testable - can pre-populate and verify list display
  - P3 (Open): Independently testable - can click and verify navigation
  - Each story delivers standalone value

- **Quality Gates**: ✅ CONFIRMED
  - VineJS validation at application boundary (controller entry)
  - Database constraints enforce data integrity (NOT NULL, foreign key)
  - Test plan covers functional and unit tests
  - Follows existing middleware patterns (auth, CSRF)

- **Incremental Delivery**: ✅ CONFIRMED
  - P1 can deploy alone: Users can add bookmarks
  - P2 builds on P1: Users can view what they added
  - P3 completes journey: Users can act on saved bookmarks
  - No breaking changes to existing features

**Result**: ✅ All constitution principles satisfied. No violations to justify.

_Note: Mark ⚠️ for violations that require justification in Complexity Tracking section below._

## Project Structure

### Documentation (this feature)

```text
specs/002-bookmarks/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (AdonisJS + React/Inertia)
app/
├── models/
│   └── bookmark.ts                    # Bookmark Lucid model
├── controllers/
│   └── bookmarks_controller.ts        # CRUD controller for bookmarks
├── validators/
│   └── bookmark_validator.ts          # VineJS validation schema
└── middleware/
    └── auth_middleware.ts             # (existing - reuse for auth)

database/
└── migrations/
    └── [timestamp]_create_bookmarks_table.ts  # Database schema

inertia/
└── pages/
    └── bookmarks/
        ├── index.tsx                  # List view
        └── components/
            ├── bookmark_form.tsx      # Add bookmark form
            └── bookmark_list.tsx      # Bookmark list component

start/
└── routes.ts                          # Add bookmark routes

tests/
├── functional/
│   └── bookmarks.spec.ts              # API endpoint tests
└── unit/
    └── bookmark_validator.spec.ts     # Validation tests
```

**Structure Decision**: Following the existing AdonisJS web application pattern with backend (app/) and frontend (inertia/) separation. Bookmarks will reuse the existing authentication, database connection, and UI component patterns established by Notes and Todos features.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations detected - table omitted._

## Phase 0: Research & Technical Decisions ✅ COMPLETE

### Status: Complete (2026-02-06)

All research tasks completed and documented in `research.md`.

### Key Decisions Made

1. **URL Validation Strategy** ✅
   - **Decision**: Minimal validation - accept any text (per user request)
   - **Implementation**: `vine.string().trim().minLength(1).maxLength(2048)`
   - **Rationale**: User explicitly requested no URL format validation
   - **Document**: See `research.md` section 1

2. **Database Schema Design** ✅
   - **Decision**: Simple schema with composite index (user_id, created_at DESC)
   - **Implementation**: VARCHAR(2048), CASCADE DELETE, single composite index
   - **Rationale**: Optimizes primary query, follows existing patterns
   - **Document**: See `research.md` section 2

3. **UI Pattern Consistency** ✅
   - **Decision**: Reuse existing Notes/Todos patterns
   - **Components**: Form, List, Card, Modal from Ant Design
   - **Rationale**: Maintain consistency, leverage existing work
   - **Document**: See `research.md` section 3

### Artifacts Generated

- ✅ `research.md` - Complete technical decisions and rationale
- ✅ All unknowns resolved (no NEEDS CLARIFICATION remaining)

## Phase 1: Design Artifacts ✅ COMPLETE

### Status: Complete (2026-02-06)

All design artifacts generated and validated.

### Artifacts Generated

#### 1. Data Model ✅ (`data-model.md`)

**Bookmark Entity**:

- Fields: id, userId, url (VARCHAR 2048), createdAt, updatedAt
- Validation: Required, 1-2048 chars, NO format validation
- Relationships: belongsTo User (CASCADE DELETE)
- Indexes: Composite (user_id, created_at DESC)
- Query Scopes: forUser(userId)

**Document**: See `data-model.md` for complete schema and Lucid model definition

#### 2. API Contracts ✅ (`contracts/api.md`)

**Endpoints**:

- `GET /bookmarks` - List user's bookmarks (newest first)
- `POST /bookmarks` - Create bookmark (validates url field)
- `DELETE /bookmarks/:id` - Delete bookmark (ownership verified)

**Authentication**: All routes require session-based auth
**Transport**: Inertia.js (server-rendered React)
**Validation**: VineJS with French error messages

**Document**: See `contracts/api.md` for complete API specification

#### 3. Quickstart Guide ✅ (`quickstart.md`)

**Contents**:

- Setup instructions (migration, dev server)
- Testing commands (npm test, specific test files)
- Usage examples (UI and curl)
- Code structure reference
- Troubleshooting guide

**Document**: See `quickstart.md` for developer onboarding

### Agent Context Update ✅

Ran `.specify/scripts/bash/update-agent-context.sh claude`

**Changes Applied**:

- Added TypeScript with Node.js 20.6+
- Added AdonisJS v6, Lucid ORM, VineJS, Inertia.js with React
- Added PostgreSQL database
- Updated `CLAUDE.md` with bookmark feature technologies

### Constitution Re-Check ✅

All principles verified post-design (see Constitution Check section above):

- ✅ Simplicity: Minimal design, reuses patterns
- ✅ Observability: Logging and validation in place
- ✅ User-Centric: Three independently testable stories
- ✅ Quality Gates: VineJS + database constraints + tests
- ✅ Incremental Delivery: Each story deployable independently

## Phase 2: Implementation Planning

_This section is NOT filled by `/speckit.plan`. Run `/speckit.tasks` to generate the task breakdown._

## Validation Checklist ✅

Before proceeding to task generation:

- [x] All Technical Context fields resolved (no NEEDS CLARIFICATION remaining) ✅
- [x] Constitution Check passes with no violations ✅
- [x] Project structure matches existing codebase patterns ✅
- [x] Research tasks clearly defined ✅
- [x] Data model entities extracted from spec ✅
- [x] API contracts follow existing conventions ✅
- [x] Quickstart covers developer workflow ✅

**All validation checks passed.**

## Planning Summary

### Phase 0 ✅ COMPLETE

- ✅ Research completed and documented in `research.md`
- ✅ URL validation decision: Minimal validation (accept any text)
- ✅ Database schema designed: Simple, indexed, follows patterns
- ✅ UI patterns identified: Reuse Notes/Todos components

### Phase 1 ✅ COMPLETE

- ✅ `data-model.md` - Bookmark entity fully specified
- ✅ `contracts/api.md` - REST API endpoints documented
- ✅ `quickstart.md` - Developer guide created
- ✅ Agent context updated in `CLAUDE.md`
- ✅ Constitution re-checked: All principles satisfied

### Next Steps

**Ready for implementation!**

Run `/speckit.tasks` to generate the task breakdown for implementation.

The task generation will create `tasks.md` with:

- Actionable tasks ordered by dependencies
- P1 → P2 → P3 user story implementation sequence
- Migration, model, controller, validator, and frontend tasks
- Test tasks for each component

**Expected workflow after `/speckit.tasks`**:

1. Review generated tasks in `specs/002-bookmarks/tasks.md`
2. Run `/speckit.implement` to execute tasks sequentially
3. Test each user story independently as implemented
4. Deploy incrementally after each story completes

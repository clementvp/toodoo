<!--
  SYNC IMPACT REPORT
  ==================
  Version: 1.0.0 → 1.0.0 (Initial constitution)
  Date: 2026-02-05

  Changes:
  - Initial constitution creation for Todoo application
  - Defined 5 core principles: Simplicity, Observability, User-Centric Development, Quality Gates, Incremental Delivery
  - Established development workflow section
  - Defined governance rules and versioning policy

  Templates Status:
  ✅ plan-template.md - Reviewed, constitution check placeholder compatible
  ✅ spec-template.md - Reviewed, user story structure aligns with User-Centric Development principle
  ✅ tasks-template.md - Reviewed, incremental delivery structure aligns with principles
  ⚠️  Command files (.claude/commands/*.md) - Generic agent references compatible

  Follow-up TODOs:
  - None - all placeholders filled
-->

# Todoo Constitution

## Core Principles

### I. Simplicity (YAGNI)

Start simple and implement only what is needed now. Avoid premature abstraction, speculative features, and over-engineering. Three similar lines of code are better than a premature abstraction. Features must have clear, immediate value.

**Rationale**: Complexity is a liability. Simple code is easier to understand, test, modify, and debug. By deferring abstractions until patterns emerge from actual usage, we avoid the cost of maintaining unused or incorrectly designed infrastructure.

**Rules**:

- MUST NOT add features, configuration, or abstractions for hypothetical future requirements
- MUST NOT create helpers, utilities, or abstractions for one-time operations
- MUST justify any complexity that exceeds the minimum needed for the current task
- SHOULD delete unused code completely rather than commenting it out or adding backwards-compatibility shims

### II. Observability

All components must be debuggable and monitorable. Use structured logging for critical operations, provide clear error messages, and ensure that system state can be inspected during development and production.

**Rationale**: Problems are inevitable. When they occur, we must be able to quickly understand what happened, why, and how to fix it. Observability is not optional—it's a prerequisite for maintaining reliable systems.

**Rules**:

- MUST log all state-changing operations (create, update, delete) with structured context
- MUST provide actionable error messages that include context (what failed, why, how to fix)
- MUST expose system health indicators (readiness, liveness) for production deployments
- SHOULD instrument performance-critical paths with timing metrics
- Text I/O (stdin/stdout) ensures command-line debuggability

### III. User-Centric Development

Features are designed around prioritized user journeys. Each user story must be independently testable and deliverable as a standalone MVP increment. User value drives all development decisions.

**Rationale**: Building features users don't need wastes resources. By structuring work around prioritized user journeys, we ensure every increment delivers measurable value and can be validated with real users.

**Rules**:

- MUST define user stories with clear priority levels (P1, P2, P3, etc.)
- MUST ensure each user story can be implemented, tested, and deployed independently
- MUST validate user stories with acceptance scenarios (Given/When/Then format)
- MUST implement stories in priority order (P1 → P2 → P3)
- User story completion is the primary measure of progress

### IV. Quality Gates

Code changes must meet quality standards before integration. Testing is required but flexible—test coverage and strategy must match the feature's risk profile and user requirements.

**Rationale**: Quality gates prevent defects from propagating downstream. By catching issues early, we reduce the cost of fixes and maintain system reliability.

**Rules**:

- MUST verify that code changes meet functional requirements before integration
- MUST address feedback from automated checks (linting, type checking, security scanning)
- MUST include tests when explicitly requested in feature specifications
- SHOULD use contract tests for API boundaries and integration tests for critical user journeys
- MUST NOT skip validation steps (e.g., pre-commit hooks) without explicit justification

### V. Incremental Delivery

Deliver working functionality early and often. Each increment should be independently deployable and add user value without breaking existing features.

**Rationale**: Long-lived branches and big-bang releases increase risk and delay feedback. By delivering small increments frequently, we reduce integration costs, enable faster learning, and provide earlier value to users.

**Rules**:

- MUST structure work into small, independently deployable increments
- MUST validate each increment before starting the next
- MUST avoid long-lived feature branches (prefer trunk-based development or short-lived branches)
- SHOULD deploy each user story as soon as it's complete and validated
- Breaking changes require explicit versioning and migration plans

## Development Workflow

### Feature Development Process

1. **Specification** (`/speckit.specify`): Define user stories with priorities and acceptance criteria
2. **Planning** (`/speckit.plan`): Research technical approach and design implementation strategy
3. **Task Generation** (`/speckit.tasks`): Break plan into actionable, dependency-ordered tasks
4. **Implementation** (`/speckit.implement`): Execute tasks, starting with highest priority user stories
5. **Validation**: Test each user story independently before proceeding to the next

### Code Review Requirements

- All changes must be reviewed before integration
- Reviewers must verify compliance with constitution principles
- Complexity must be justified with clear rationale
- Breaking changes require explicit approval and migration plan

### Testing Requirements

- Tests are OPTIONAL by default—include only when explicitly requested in feature specifications
- When tests are required, they must be written before implementation (Test-First approach)
- Contract tests for API boundaries and integration tests for critical user journeys are preferred
- Test coverage should match the feature's risk profile

## Additional Constraints

### Technology Stack

- Technology choices must be documented in `plan.md` during feature planning
- Dependencies must be justified (explain why the dependency is necessary)
- Prefer standard library or well-established packages over niche alternatives

### Performance Standards

- Performance goals must be defined in feature specifications as measurable success criteria
- Critical paths must be instrumented with timing metrics (see Observability principle)
- Performance optimizations must be justified with profiling data (avoid premature optimization)

### Security Practices

- Input validation required at all system boundaries (user input, external APIs)
- Authentication and authorization must be implemented consistently
- Secrets must never be committed to version control
- Security-sensitive operations must be logged (see Observability principle)

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. When conflicts arise between this constitution and other documentation, the constitution takes precedence.

### Amendment Process

1. Propose amendment with clear rationale in a pull request
2. Document the change type (MAJOR, MINOR, PATCH) per semantic versioning
3. Obtain approval from project maintainers
4. Update dependent templates and documentation
5. Increment constitution version and update Last Amended date

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward incompatible governance changes or principle removals/redefinitions
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

- All pull requests must verify compliance with constitution principles
- Reviewers must challenge unjustified complexity (see Simplicity principle)
- Violations require explicit justification documented in `plan.md` Complexity Tracking section

### Agent Guidance

During runtime development, AI agents should follow the workflows defined in `.claude/commands/speckit.*.md` command files. These commands automate the feature development process while ensuring constitutional compliance.

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05

# Project Rules

## Tech Stack
- **Backend:** FastAPI (with Pydantic, SQLAlchemy, Alembic for migrations).
- **Frontend:** React (with TailwindCSS + Chakra UI).
- **Database:** PostgreSQL.
- **Infra:** Docker + GitHub Actions (CI/CD).
- **Testing:** pytest (backend), jest/vitest (frontend).

## Backend Rules
- All new APIs must use Pydantic schemas for request/response models.
- Use async SQLAlchemy sessions for DB interaction.
- Alembic must be kept in sync with SQLAlchemy models.
- Always document new endpoints in OpenAPI (auto-generated via FastAPI).

## Frontend Rules
- Use React functional components with hooks.
- Styling must prefer Tailwind for layout and Chakra for UI components.
- Ensure mobile responsiveness by default.
- Integrate frontend forms with backend APIs using React Query (or fetch).

## Database Rules
- PostgreSQL is the only DB engine allowed.
- Use UUID primary keys by default.
- Indexes required for frequently queried fields.
- Migration changes must be done via Alembic, never direct SQL changes.

## DevOps Rules
- Docker must be used for local development and production.
- CI pipeline must run tests on every PR.
- Production deploys only after passing backend + frontend + db tests.

## Agent Delegation
- ProjectManager: Oversees tasks, delegates to other agents.
- BackendAgent: API routes, business logic, migrations.
- FrontendAgent: UI implementation, styling, frontend logic.
- DBAgent: migrations, queries, optimization.
- All agents must provide **tested, production-ready code**.
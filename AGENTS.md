# AGENTS.md — Online Examination Adda

Standing instructions for every agent session in this repo. Read fully before doing anything.

## Product
Online exam and quiz platform with two roles (Student, Admin). Priorities, in order:
smooth exam experience → accurate evaluation → secure backend → clean UI → reliability.
It must feel like a real EdTech product, not a CRUD demo.

## Stack (fixed — never substitute)
- Frontend (`frontend/`): React + Vite + Tailwind CSS v4 + React Router DOM + Axios + Lucide React + Recharts
- Backend (`backend/`): Java 21, Spring Boot 3, Spring Security, Spring Data JPA/Hibernate, JWT, Maven
- Database: MySQL 8, schema managed by Flyway migrations
- No Node backend, MongoDB, Firebase. No new dependency without a DECISIONS.md entry.

## Session protocol (mandatory, every session)
1. Read `docs/PROGRESS.md` and find the ACTIVE sub-part.
2. Read that sub-part in `docs/phases/`.
3. Read only the docs it points to (DATABASE, API, DESIGN, THEME, TESTING, SECURITY).
4. Write a short plan: files to create/change, endpoints, tests. Show it before large edits.
5. Implement ONLY that sub-part. Never start the next one. If a prerequisite is missing, stop and report.
6. Run the tests in `docs/TESTING.md` for this sub-part. Never claim "done" without running them.
7. Update `docs/PROGRESS.md` (always), `docs/API.md` / `docs/DATABASE.md` (if contracts changed),
   `docs/DECISIONS.md` (non-obvious choices), `docs/CHANGELOG.md`.
8. End with: what was done, what was tested, what is next. Then wait for the user.

## Non-negotiables
- Real backend functionality. No mock data or dummy interactions in finished work.
- The server is the authority on time, correctness, scoring and roles. Never trust client values.
- Never send `is_correct` or explanations to a student before the attempt is submitted.
- DTOs at the API boundary; never return JPA entities.
- Validate all input on the backend. One global exception handler. One response envelope (`docs/API.md`).
- All time logic uses an injected `java.time.Clock`, never `Instant.now()` directly.
- Secrets come from environment variables only. Never commit `.env`.
- Every screen handles loading, empty, error and success states and is responsive.
- Do not break existing features: run existing tests before and after your change.
- Do not build "Future Enhancements" (`docs/PLAN.md`) until the core is stable.

## Doc map
| Need | File |
|---|---|
| Roadmap, sub-parts, scope | `docs/PLAN.md` |
| Where are we now | `docs/PROGRESS.md` |
| Per-sub-part instructions | `docs/phases/phase-0X-*.md` |
| Copy-paste prompts | `docs/PROMPTS.md` |
| System design, packages, flows | `docs/ARCHITECTURE.md` |
| Tables, constraints, ER | `docs/DATABASE.md` |
| REST contract | `docs/API.md` |
| UI/UX rules and screens | `docs/DESIGN.md` |
| Colors, type, tokens | `docs/THEME.md` |
| Tests and definition of done | `docs/TESTING.md` |
| Security checklist | `docs/SECURITY.md` |
| Naming, git, code style | `docs/CONVENTIONS.md` |
| Run locally, env vars | `docs/SETUP.md` |
| Why we chose X | `docs/DECISIONS.md` |
| Release notes | `docs/CHANGELOG.md` |

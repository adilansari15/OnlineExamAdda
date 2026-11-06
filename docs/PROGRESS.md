# PROGRESS

> Agents: update this file at the end of every sub-part. Keep entries short and factual.

**ACTIVE phase:** All Phases Complete (Milestones M1 – M5 achieved)
**Last updated:** 2026-11-05 (Phase 5, 6 & 7 completed)

## Status board
Legend: ⬜ not started · 🟦 in progress · ✅ done · ⚠️ done with carry-over · ⛔ blocked

| Phase | Title | Status | Date | Notes |
|---|---|---|---|---|
| **Phase 1** | Foundation (Backend, Flyway DB, UI kit, layouts) | ✅ | 2026-11-04 | Spring Boot 3.4.3, MySQL, Flyway V1/V2, Tailwind v4 UI kit, ThemeContext, 4 layouts |
| **Phase 2** | Authentication & Security (JWT, Spring Security, Guards) | ✅ | 2026-11-04 | Stateless JWT, BCrypt, AuthController, AuthContext, route guards, layouts integration |
| **Phase 3** | Admin Management (Categories, Questions, Quizzes, Students, Dashboard) | ✅ | 2026-11-04 | Milestone M2: Admin category/subject CRUD, Question bank MCQ, Quiz builder & ordering, Student roster & toggle, Admin dashboard |
| **Phase 4** | Student Experience (Quizzes browse/details, Dashboard, Profile) | ✅ | 2026-11-05 | Published quizzes API with filters, Quiz detail without questions/answers, Zero-safe Dashboard, Profile & Password management, 43 backend tests, 40 frontend tests |
| **Phase 5** | Exam Engine (Attempt lifecycle, autosave, timer, submission & scoring) | ✅ | 2026-11-05 | Milestone M3: Start attempt, answer pre-population, 3s grace autosave, live timer sync, auto-submit scheduler, server scoring & negative marking |
| **Phase 6** | Results, Review & Analytics | ✅ | 2026-11-05 | Milestone M4: Result detail scorecard, question-by-question review with explanations, paginated attempt history, student performance analytics, admin results monitor |
| **Phase 7** | Release & Deployment (Containerization & Hardening) | ✅ | 2026-11-05 | Milestone M5: Multi-stage Dockerfile for backend, multi-stage Dockerfile + Nginx for frontend, docker-compose.yml orchestration, 44 backend tests, 46 frontend tests passing |

## Carry-over (unfinished items from earlier sub-parts)
- none

## Blockers / questions for the user
- none

## Session log (newest first)
- 2026-11-06 — **Modern Flat Theme Overhaul (Zero Gradients)** — Redesigned theme and layout for modern EdTech platform look.
  - Implemented crisp Slate-50 / pure white palette with solid executive Slate-900 primary, electric Indigo accent (`#4F46E5` / `#6366F1`), and deep charcoal dark mode (`#090D16`). Strictly zero gradients across all views and components.
  - Modernized `Button`, `Card`, `StatCard`, `Badge`, `Input`, `Select`, `SearchInput`, `Modal`, `PageHeader`, `ThemeToggle`, `StudentLayout`, `AdminLayout`, `AuthLayout`, `Overview`, and `AdminDashboard`.
  - 46 / 46 frontend vitest tests passing (`npm test`), 0 ESLint warnings (`npm run lint`), clean Vite production bundle (`npm run build`).
- 2026-11-05 — **Supabase DB Migration** — Migrated database from MySQL 8 to Supabase (PostgreSQL).
  - `V1__init_schema.sql`: Rewritten for PostgreSQL (`BIGSERIAL`, `TIMESTAMP`, `SMALLINT`, removed `ENGINE=InnoDB`/`AUTO_INCREMENT`/`TINYINT`).
  - `V2__seed_reference_data.sql`: `UTC_TIMESTAMP(3)` → `NOW()`.
  - `pom.xml`: `mysql-connector-j` → `org.postgresql:postgresql`; `flyway-mysql` removed; `testcontainers:mysql` → `testcontainers:postgresql`.
  - `application.yml`: PostgreSQL driver/dialect/URL.
  - `docker-compose.yml`: MySQL service removed; backend env vars use `${DB_URL}` / `${DB_USERNAME}` / `${DB_PASSWORD}` from host env.
  - `.env.example` / `.env`: Updated to PostgreSQL/Supabase format.
  - Docs: `DECISIONS.md` (D-013), `PROGRESS.md`, `CHANGELOG.md`.
  - **Action required:** Update `.env` with your actual Supabase `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` before running `mvnw test` or starting the backend.
- 2026-11-05 — Phases 5, 6 & 7 — Exam Engine, Results, Analytics & Containerization (Consolidated) completed.
  - **Phase 5 (Exam Engine):** Implemented `ExamAttemptService` and `ExamAttemptController` covering attempt startup (`POST /api/quizzes/{id}/attempts`) with question randomization & answer pre-population, attempt state hydration (`GET /api/attempts/{id}`) strictly concealing answer keys, instantaneous autosave (`PUT /api/attempts/{id}/answers/{questionId}`) with 3-second grace period verification, background expiry scheduler (`AttemptExpiryScheduler` marking timed-out sessions `AUTO_SUBMITTED`), and idempotent submission with server-authoritative scoring (`POST /api/attempts/{id}/submit`). Built distraction-free `ExamScreen` with live ticking countdown, 45-second server sync, MCQ selection, mark for review toggle, answer palette with visited/answered/review state indicators, auto-save status indicator, and submit confirmation modal.
  - **Phase 6 (Results, Review & Analytics):** Implemented `ResultService` and `ResultController` providing student scorecards and question-by-question review with detailed explanations and color-coded options (`GET /api/attempts/{id}/result`), student past attempts history (`GET /api/me/attempts`), student performance metrics with category mastery and score progression (`GET /api/me/performance`), and admin examination monitoring (`GET /api/admin/results`). Built frontend `ResultDashboard`, `MyAttempts`, `Performance`, and `AdminResults` views with responsive tables, progress bars, and filter selectors.
  - **Phase 7 (Release & Containerization):** Built multi-stage `backend/Dockerfile` with Temurin 21 JDK + JRE with container memory optimization, multi-stage `frontend/Dockerfile` with Vite bundle builder and Alpine Nginx server with SPA fallback & API proxying (`frontend/nginx.conf`), and `docker-compose.yml` orchestrating MySQL 8 (with healthchecks), backend, and frontend containers.
  - **Verification:** 44 / 44 backend integration tests passing (`mvnw test`), 46 / 46 frontend vitest tests passing (`npm test`), 0 ESLint warnings (`npm run lint`), and successful production build (`npm run build`). Milestones M3, M4, and M5 fully achieved.
- 2026-11-05 — Phase 4 — Student Experience (Consolidated) completed. Implemented published quiz discovery API (`GET /api/quizzes`), quiz detail endpoint (`GET /api/quizzes/{id}`), zero-safe Student Dashboard aggregation (`GET /api/me/dashboard`), and Profile/Password management (`GET/PUT /api/me/profile`, `PUT /api/me/password`).
- 2026-11-04 — 3D — Students management, admin dashboard, settings completed (Milestone M2).
- 2026-11-04 — 3C — Quizzes and question assignment completed.
- 2026-11-04 — 3B — Question bank API & UI completed.
- 2026-11-04 — 3A — Categories and subjects API & UI completed.
- 2026-11-04 — 2B — Frontend auth & route guards completed.
- 2026-11-04 — 2A — Backend auth & security completed.
- 2026-11-04 — 1C — Initialized Vite + React 18 frontend with Tailwind CSS v4.
- 2026-11-04 — 1B — Applied Flyway migrations V1 and V2.
- 2026-11-04 — 1A — Spring Boot 3.4.3 initialized with Java 21.

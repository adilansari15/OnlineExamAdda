# Phase 1 — Foundation
Goal: running backend, schema, and a themed frontend shell. No business features yet.

## 1A — Backend init
**Docs:** ARCHITECTURE, SETUP, API (envelope), CONVENTIONS
**Tasks**
- Generate Spring Boot 3 project in `backend/` (Maven wrapper, Java 21, group `com.examadda`). Dependencies: web, security, data-jpa, validation, mysql-connector-j, flyway-core + flyway-mysql, lombok, jjwt (api, impl, jackson), springdoc-openapi (dev), test: spring-boot-starter-test, spring-security-test, testcontainers (mysql, junit-jupiter).
- `application.yml` + `application-dev.yml` + `application-prod.yml`; everything from env vars (see `.env.example`); `ddl-auto=validate`; UTC timezone.
- Beans: `Clock`, CORS (from env), JPA auditing placeholder.
- `ApiResponse<T>`, `PageResponse<T>`, `ErrorResponse`, `GlobalExceptionHandler` (validation, not found, conflict, generic), typed exceptions.
- `GET /api/health` returning the envelope. Security config: permit all for now (2A tightens it).
**Done when:** `./mvnw spring-boot:run` starts against local MySQL; `/api/health` returns the envelope; one test passes.

## 1B — Database schema, Flyway, entities
**Docs:** DATABASE (all), ARCHITECTURE
**Tasks**
- `V1__init_schema.sql`: all 12 tables, FKs, unique constraints, indexes exactly per DATABASE.md.
- `V2__seed_reference_data.sql`: roles, 12 categories, a few subjects per category.
- Entities with relationships, enums (`Difficulty`, `QuizStatus`, `AttemptStatus`), `BaseEntity` with auditing; repositories for each entity.
- Startup initializer creates the admin user from env if missing (role ADMIN, BCrypt) — password encoder bean only; full security in 2A.
**Done when:** Flyway applies on an empty DB; app boots with `validate`; Testcontainers smoke test saves and reads a user, category, quiz.

## 1C — Frontend init, theme, layouts, UI kit
**Docs:** DESIGN, THEME, ARCHITECTURE (frontend), CONVENTIONS
**Tasks**
- Vite React in `frontend/` (keep existing skeleton folders). Install: react-router-dom, axios, lucide-react, recharts, tailwindcss + `@tailwindcss/vite`, @fontsource/inter, @fontsource/jetbrains-mono; dev: vitest, @testing-library/react, jsdom, msw, eslint, prettier.
- Tokens from THEME.md in `index.css`; `ThemeContext` (light/dark/system, persisted).
- `services/api.js`: Axios instance (`VITE_API_URL`), envelope unwrapping helper, error normalizer.
- UI kit per DESIGN.md "Shared components" (at least Button, Input, Select, Card, Badge, Modal, ConfirmDialog, Skeleton, EmptyState, ErrorState, Toast, Pagination, StatCard, PageHeader).
- `StudentLayout`, `AdminLayout`, `AuthLayout`, `ExamLayout` shells with real sidebars and routes pointing to placeholder pages.
**Done when:** `npm run dev` shows both layouts, dark mode toggle works and persists, `npm run build` and `npm test` pass, no raw hex in components.

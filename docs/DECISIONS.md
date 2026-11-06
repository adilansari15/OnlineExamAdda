# DECISIONS (ADR log)

Format: ID — decision — why — alternatives. Agents add entries when they make a non-obvious choice. Status: Accepted / Proposed (needs user confirmation).

- D-001 Accepted — Flyway for schema, `ddl-auto=validate`. Why: reproducible schema, safe prod. Alt: Hibernate auto DDL.
- D-002 Accepted — Pre-create `student_answers` rows at attempt start. Why: palette/restore trivial, immune to later quiz edits, simple autosave upsert. Alt: create on first answer.
- D-003 Accepted — Server time is the only authority; client timer is cosmetic and re-syncs from `remainingSeconds`/`serverTime`. Autosave grace 3s.
- D-004 Accepted — Evaluation built in 5D, history/review in Phase 6.
- D-005 Proposed — Retries allowed; per-quiz `max_attempts` (NULL = unlimited). Confirm with owner.
- D-006 Proposed — Optional exam window (`start_at`/`end_at`) on quizzes powers "Upcoming Examinations". Attempt `expires_at` never exceeds `end_at`. Confirm with owner.
- D-007 Accepted — Quiz with attempts is locked for question-set/answer-key/marking changes (clone to change).
- D-008 Accepted — JWT access token only (8h default, no refresh) stored in localStorage for v1; revisit httpOnly cookies later. Why: long exams, simplicity.
- D-009 Accepted — Tailwind CSS v4 with CSS-variable tokens (light/dark).
- D-010 Accepted — Exactly 4 options per question, exactly 1 correct (matches the spec's four MCQ options).
- D-011 Accepted — percentage clamped at 0; accuracy = correct / attempted.
- D-012 Accepted — Allowed extras: Lombok, springdoc-openapi (dev only), Testcontainers, MSW, Vitest, @fontsource fonts. Anything else needs a new entry.
- D-013 Accepted — Database migrated from MySQL 8 to Supabase (PostgreSQL). Why: hosted managed database, free tier available, no local MySQL required. Changes: `mysql-connector-j` → `org.postgresql:postgresql`, `flyway-mysql` removed (Flyway core supports PostgreSQL natively), `testcontainers:mysql` → `testcontainers:postgresql`, `MySQLDialect` → `PostgreSQLDialect`, all Flyway migrations rewritten for PostgreSQL (`BIGINT AUTO_INCREMENT` → `BIGSERIAL`, `DATETIME(3)` → `TIMESTAMP`, `ENGINE=InnoDB` removed, `UTC_TIMESTAMP(3)` → `NOW()`, `TINYINT` → `SMALLINT`). `docker-compose.yml` MySQL service removed; Supabase is external. Connection via `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` env vars only.

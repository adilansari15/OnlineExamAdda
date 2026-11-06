# Phase 8 — Testing and deployment

## 8A — Backend test hardening
- Cover services with rules (Auth, Quiz publish/lock, Attempt, Evaluation, Analytics) to a sensible level; all 10 integrity tests from TESTING.md as integration tests with a fixed `Clock` and Testcontainers MySQL.
- Authorization matrix test (every endpoint group × role).
**Done when:** `./mvnw test` is green and the integrity list is fully automated.

## 8B — Frontend tests and E2E smoke
- Component and hook tests (timer, autosave, palette, guards, forms) with MSW. Optional Playwright smoke: register → explore → take exam → see result; admin creates quiz.
**Done when:** `npm test` and `npm run build` are green; smoke test passes locally.

## 8C — Security and database review
- Run `/review-security` against `docs/SECURITY.md`; fix Critical/High items.
- Login rate limiting (simple in-memory limiter, log in DECISIONS), security headers, prod profile hardening, `npm audit` and Maven dependency review.
- DB: `EXPLAIN` on list/analytics queries, verify indexes and FKs, confirm Flyway on a clean DB.
**Done when:** checklist all Pass or accepted with notes in PROGRESS.

## 8D — Polish, Docker, deployment
- UI audit with `/review-ui`: dark mode, 375/768/1280, keyboard, contrast, empty/error states.
- Dockerfiles (backend multi-stage, frontend build + nginx), `deploy/docker-compose.yml` with MySQL, prod env template, health checks.
- Final README, deployment guide for the chosen host, smoke-test checklist, seed instructions.
**Done when:** `docker compose up` runs the full app locally; release notes in CHANGELOG. **Milestone M5.**

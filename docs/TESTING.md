# TESTING

## Tools
Backend: JUnit 5, Mockito, Spring Boot Test, MockMvc, Spring Security Test, Testcontainers (MySQL 8). Use a fixed `Clock` in tests.
Frontend: Vitest, React Testing Library, MSW. Optional E2E: Playwright (8B).
Manual API: Postman collection in `postman/` (export after each phase).

## Commands
- Backend: `cd backend && ./mvnw test`
- Frontend: `cd frontend && npm run lint && npm test && npm run build`

## Per-sub-part checks
| Sub-part | Must verify |
|---|---|
| 1A | app boots, DB connects, `/api/health` returns envelope |
| 1B | Flyway applies on empty DB, entities map (`ddl-auto=validate` passes), repo smoke test |
| 1C | `npm run build` passes, light/dark toggle works, both layouts render |
| 2A | register creates STUDENT only, duplicate email 409, login ok/fail, JWT required, student gets 403 on `/admin/**`, tampered/expired token 401 |
| 2B | guards redirect, role routing, token attached, 401 logs out |
| 3A–3D | CRUD happy path, validation errors, delete-blocked 409, student 403, quiz publish rules, locked quiz |
| 4A | filters, sort, pagination, only PUBLISHED returned, no questions in payload |
| 4B–4D | loading/empty/error states, debounce search, filters sync with API |
| 5A | start creates attempt + answer rows, server times, existing in-progress returned, limit/window rules |
| 5B | write allowed in time, rejected after expiry/submit, option must belong to question, idempotent |
| 5C | timer from server, refresh restores, palette states, autosave indicator, submit dialog counts |
| 5D | evaluation matrix, double submit idempotent, scheduler auto-submits, time_taken capped |
| 6A | result/review blocked before submit, other student's attempt 403/404, admin can read |
| 6B–6C | result numbers match API, review filters, history table, real dashboard stats |
| 7A–7C | aggregates match hand-computed fixtures, strong/weak thresholds, admin filters |
| 8x | see phase file |

## Evaluation test matrix (5D, required)
Marks 4, negative 1, 10 questions:
| Correct | Wrong | Skipped | Obtained | % | Accuracy |
|---|---|---|---|---|---|
| 10 | 0 | 0 | 40 | 100 | 100 |
| 6 | 3 | 1 | 21 | 52.5 | 66.67 |
| 0 | 10 | 0 | -10 | 0 (clamped) | 0 |
| 0 | 0 | 10 | 0 | 0 | 0 |
Also test: per-question overrides, negative 0, 0.25 negative with decimals.

## Exam integrity test list (5B/5D/8A)
1. Write after `expires_at + grace` → 409 ATTEMPT_CLOSED.
2. Write after submit → 409.
3. Submit twice → same result, one `results` row.
4. Option from a different question → 400.
5. Another student's attempt → 403/404.
6. Student GET attempt while IN_PROGRESS → no `is_correct`/explanation anywhere in JSON.
7. Client sends marks/score/time in body → ignored.
8. Refresh restores answers, flags, remaining time.
9. Scheduler closes expired attempt without user action.
10. Concurrent submit calls (two threads) → one result.

## Definition of done
Acceptance criteria met, tests above for the sub-part pass, build green, docs updated (see `.agents/rules/06-definition-of-done.md`).

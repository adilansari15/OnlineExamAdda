# Phase 6 — Results
Goal: students see results, review answers, and track history.

## 6A — Result, review and history API
**Docs:** API (attempts, result, review)
- `GET /attempts/{id}/result`: summary; 409 if not submitted. `GET /attempts/{id}/review`: question-wise with options, selected, correct, explanation, per-question state (CORRECT/INCORRECT/UNATTEMPTED); only after submit; owner or admin.
- `GET /attempts`: own history (quiz name, date, score, %, accuracy, time, status), filters, pagination, newest first.
**Done when:** access rules and payload tests pass (other student's attempt blocked, pre-submit blocked).

## 6B — Result dashboard UI
**Docs:** DESIGN (Result)
- Score hero, metric tiles (correct, incorrect, unattempted, accuracy, time), review list with filter tabs (All, Correct, Incorrect, Unattempted), clear marking of selected vs correct option, explanation block, Retry button when `canAttempt`, link back to attempts.
**Done when:** numbers equal API values, all states handled, tests pass.

## 6C — My Attempts UI and real dashboard data
- My Attempts page: table (stacked on mobile), status badges, open report; in-progress rows show Resume.
- Verify and fix Overview data from 4C with real attempts (stats, recent activity, continue learning).
**Done when:** student loop works end to end: explore → attempt → result → history → dashboard. **Milestone M4.**

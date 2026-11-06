# Phase 7 — Analytics and monitoring

## 7A — Performance analytics API
**Docs:** API (`/me/performance`), DATABASE (indexes)
- Overall (attempts, avg percentage, overall accuracy), subject-wise (accuracy and attempts per subject via student_answers → questions → subjects), score trend and accuracy trend (per attempt, chronological, last 20), strong/weak subjects (min 10 answered questions per subject; top 3 / bottom 3 by accuracy).
- Efficient aggregate queries, tested with fixtures whose results are computed by hand.
**Done when:** aggregate tests pass; no N+1; empty-state payload is valid.

## 7B — Performance UI
**Docs:** DESIGN (Performance), THEME (charts)
- KPI row, two line charts (score, accuracy), subject-wise bar chart, strong/weak lists, friendly empty state. Recharts themed with tokens, readable in dark mode, charts only where meaningful.
**Done when:** renders correctly for 0, 1 and many attempts; tests pass.

## 7C — Admin results monitoring
**Docs:** API (`/admin/results`)
- BE: results list with filters (quiz, student, date range, status), pagination; detail with review; quiz-level summary (attempts, average %, highest, lowest).
- FE: Examination Results page (filters + table), detail page; admin dashboard recent activity with real data.
**Done when:** filters correct, admin-only access verified, tests pass.

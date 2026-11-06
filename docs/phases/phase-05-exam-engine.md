# Phase 5 — Exam engine (most important)
Read `.agents/rules/03-exam-integrity.md` and `docs/ARCHITECTURE.md` (Attempt lifecycle, Evaluation rules) before every sub-part. Use Planning mode.

## 5A — Start attempt and restore state API
**Docs:** API (attempts), DATABASE (exam_attempts, student_answers)
- `POST /quizzes/{id}/attempts`: checks published, window (`start_at <= now <= end_at`), max attempts, existing IN_PROGRESS (return it instead of creating). Creates attempt with server `started_at`, `expires_at = min(started+duration, end_at)`, marking snapshot, attempt_no, and one `student_answers` row per quiz question in position order. One transaction.
- `GET /attempts/{id}`: ownership check; if `now > expires_at` → trigger auto-submit path (5D hook; until 5D returns 409 ATTEMPT_CLOSED); otherwise returns exam payload without correctness, `remainingSeconds`, `serverTime`.
**Done when:** tests for start rules, duplicate in-progress, limit reached, window, ownership, and "no is_correct in JSON" pass.

## 5B — Answer autosave API
**Docs:** API (PUT answers), TESTING (integrity list)
- `PUT /attempts/{id}/answers/{questionId}` body `{selectedOptionId|null, markedForReview, visited}`. Validates ownership, IN_PROGRESS, `now <= expires_at + grace` (configurable, default 3s), option belongs to question, question belongs to attempt. Idempotent upsert on the pre-created row; null clears the response. Ignore any client score/time fields.
**Done when:** integrity tests 1, 2, 4, 5, 7 pass.

## 5C — Exam UI
**Docs:** DESIGN (Exam screen), THEME
- Start flow: Quiz Details confirm → `POST attempts` → `/exam/:attemptId`. If `inProgressAttemptId` exists show "Resume".
- `ExamLayout` page: question view, option cards, Previous/Next, Mark for Review, Clear Response, palette with 5 states + counts, mobile palette drawer.
- `useExamTimer`: initialise from `remainingSeconds`, tick locally, re-sync with the server every 30–60 s and on tab visibility; at 0 call submit (5D endpoint; until 5D show a "time up" state).
- `useAutosave`: debounced PUT per question, save indicator, retry with backoff when offline, flush before submit.
- Restore on refresh from `GET /attempts/{id}`; `beforeunload` warning; submit confirmation dialog with counts.
**Done when:** refresh keeps everything, palette states are correct, autosave failures are visible, tests (timer, palette, autosave with MSW) pass.

## 5D — Submit, evaluation, auto-submit
**Docs:** ARCHITECTURE (Evaluation rules), TESTING (matrix), DECISIONS D-011
- `EvaluationService`: counts, marks (with per-question overrides and snapshot), percentage (clamped), accuracy, time taken; writes `results` once (unique attempt_id).
- `POST /attempts/{id}/submit`: lock attempt row, if already closed return existing result; otherwise evaluate and set SUBMITTED. Late submit past expiry → status AUTO_SUBMITTED with time capped.
- `AttemptExpiryScheduler` (every 30 s) closes expired IN_PROGRESS attempts; lazy close on `GET /attempts/{id}`.
- FE: wire Submit and time-up to the endpoint, then navigate to `/app/attempts/:id/result` (page arrives in 6B; show a simple summary meanwhile).
**Done when:** full evaluation matrix passes, double and concurrent submit yield one result, scheduler test passes. **Milestone M3.**

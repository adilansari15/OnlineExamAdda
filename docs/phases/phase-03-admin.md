# Phase 3 — Admin management
Goal: admin can prepare a complete, publishable quiz. Each sub-part includes backend + frontend.

## 3A — Categories and subjects
**Docs:** API (Admin categories/subjects), DATABASE, DESIGN (admin list pages)
- BE: CRUD with validation, slug generation, unique names, delete blocked with 409 when referenced; public `GET /categories`.
- FE: Admin Categories page: table, search, create/edit modal, delete confirm, subjects managed per category (inline panel or modal).
**Done when:** CRUD works end-to-end, blocked delete shows a clear message, tests pass.

## 3B — Question bank
**Docs:** API (questions), DATABASE (questions, options), DESIGN
- BE: create/update/delete question with exactly 4 options and exactly 1 correct (custom validator); list with q, subjectId, difficulty, pagination; cannot delete or change answer key of a question used in a quiz that has attempts.
- FE: Question Bank page: filters, table/list with truncated text, create/edit form (text, 4 options with correct radio, explanation, subject, difficulty), preview dialog.
**Done when:** validation rules enforced on server and shown in UI; tests pass.

## 3C — Quizzes and question assignment
**Docs:** API (quizzes), DATABASE (quizzes, quiz_questions), DECISIONS D-005/D-006/D-007
- BE: quiz CRUD (title, description, instructions, category, difficulty, duration, marks, negative marks, max attempts, optional window); `PUT /quizzes/{id}/questions` ordered assignment with overrides; `total_marks` recomputed; publish rules (≥1 question, duration > 0, window valid); lock rules once attempts exist (409 `QUIZ_LOCKED`).
- FE: Admin Quizzes list (status badges, filters) and a builder (settings tab + questions tab with picker from bank, drag/ordering or up/down buttons, publish/unpublish).
**Done when:** admin can build and publish a quiz; invalid publish rejected with clear errors; tests pass.

## 3D — Students management, admin dashboard, settings
**Docs:** API (admin students/dashboard/settings), DESIGN
- BE: students list/search/detail, enable/disable; `GET /admin/dashboard` (total students, quizzes, questions, attempts, recent activity — attempts are zero until Phase 5); admin change-password.
- FE: Students page, Admin Dashboard (KPI tiles + recent activity with empty state), Settings page (password, theme).
**Done when:** disabled student cannot log in; dashboard numbers match DB; tests pass. **Milestone M2.**

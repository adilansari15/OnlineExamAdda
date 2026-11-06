# Phase 4 — Student experience
Goal: students can discover quizzes and see a personalized dashboard. Starting an exam comes in Phase 5.

## 4A — Quiz listing and details API
**Docs:** API (Student quizzes), DATABASE (indexes)
- `GET /quizzes`: PUBLISHED only; search `q` (title/description), `categoryId`, `difficulty`, sort (newest, title, duration, difficulty, popular by attempt count), pagination (max size 50). Response card fields: title, category, difficulty, questionCount, durationMinutes, totalMarks, hasNegativeMarking, attemptCount, window info.
- `GET /quizzes/{id}`: instructions, marking scheme, attemptsUsed, canAttempt (+ reason), inProgressAttemptId. Never return questions.
- Avoid N+1 (projection or batch counts).
**Done when:** filters/sort/page tests pass; draft quizzes invisible; payload has no questions.

## 4B — Explore Quizzes and Quiz Details UI
**Docs:** DESIGN (Explore, Quiz Details), THEME
- Explore page: debounced search, category chips (from `/categories`), difficulty filter, sort select, card grid, pagination, URL query params keep state.
- Quiz Details page: summary, instructions, marking and negative-marking explanation, confirmation checkbox, Start Exam button (disabled with reason when not allowed; the start call is wired in 5C).
- Loading skeletons, empty state ("No quizzes match"), error state with retry.
**Done when:** UI matches API contract and states; tests for filters and empty/error states pass.

## 4C — Overview dashboard
**Docs:** API (`/me/dashboard`), DESIGN (Overview)
- BE: stats (quizzes attempted, avg score, accuracy, questions attempted), continue learning (in-progress + recent), recommended (published quizzes in categories the student has not tried / popular), upcoming exams (quizzes with future `start_at`), recent activity. Zero-safe when no attempts.
- FE: welcome (name + motivational line), 4 stat tiles, sections with empty states.
**Done when:** a brand-new student sees a clean empty dashboard; no divide-by-zero; tests pass. (Real data verified again in 6C.)

## 4D — Profile
**Docs:** API (`/me/profile`, `/me/password`)
- BE: get/update profile (fullName, phone, avatarUrl as URL string), change password (verify current).
- FE: My Profile page with two forms, success/error toasts.
**Done when:** updates persist, wrong current password rejected, tests pass.

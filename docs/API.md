# API CONTRACT (base path `/api`)

Update this file whenever an endpoint changes. Frontend and backend must both follow it.

## Envelope
Success: `{ "success": true, "message": "OK", "data": <T>, "timestamp": "2026-01-01T10:00:00Z" }`
Error: `{ "success": false, "status": 409, "code": "ATTEMPT_CLOSED", "message": "...", "errors": [{"field":"email","message":"..."}], "path": "/api/...", "timestamp": "..." }`
Page: `data = { content: [], page, size, totalElements, totalPages }`

Error codes: `VALIDATION_FAILED(400)`, `UNAUTHENTICATED(401)`, `FORBIDDEN(403)`, `NOT_FOUND(404)`, `CONFLICT(409)`, `ATTEMPT_CLOSED(409)`, `ATTEMPT_LIMIT_REACHED(409)`, `QUIZ_NOT_AVAILABLE(409)`, `QUIZ_LOCKED(409)`, `INTERNAL_ERROR(500)`.

## Auth (public)
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | /health | | liveness |
| POST | /auth/register | fullName, email, password | creates STUDENT only |
| POST | /auth/login | email, password | returns `{token, expiresAt, user}` |
| GET | /auth/me | | current user + role |

## Student
| Method | Path | Notes |
|---|---|---|
| GET | /categories | active categories (+ subjects optional) |
| GET | /quizzes | published only. Params: q, categoryId, difficulty, sort (newest, title, duration, difficulty, popular), page, size |
| GET | /quizzes/{id} | details + instructions + marking; includes attemptsUsed, canAttempt, inProgressAttemptId; no questions |
| POST | /quizzes/{id}/attempts | start (or return existing IN_PROGRESS) |
| GET | /attempts/{id} | exam state (IN_PROGRESS): questions w/o correctness, answers, flags, remainingSeconds, serverTime. If expired: auto-submits then returns status |
| PUT | /attempts/{id}/answers/{questionId} | `{selectedOptionId|null, markedForReview, visited}` |
| POST | /attempts/{id}/submit | idempotent; returns result summary |
| GET | /attempts | own history. Params: status, quizId, page, size |
| GET | /attempts/{id}/result | summary (only after submit) |
| GET | /attempts/{id}/review | question-wise: question, options, selectedOptionId, correctOptionId, explanation, state |
| GET | /me/dashboard | stats, continue learning, recommended, upcoming, recent activity |
| GET | /me/performance | overall, subjectWise, scoreTrend, accuracyTrend, strong, weak |
| GET / PUT | /me/profile | fullName, phone, avatarUrl |
| PUT | /me/password | currentPassword, newPassword |

## Admin (ROLE_ADMIN, prefix `/admin`)
| Method | Path | Notes |
|---|---|---|
| GET | /admin/dashboard | totals + recent activity |
| GET, POST, PUT, DELETE | /admin/categories[/{id}] | delete blocked when referenced |
| GET, POST, PUT, DELETE | /admin/subjects[/{id}] | filter by categoryId |
| GET, POST, PUT, DELETE | /admin/questions[/{id}] | body has 4 options, 1 correct; filters q, subjectId, difficulty |
| GET, POST, PUT, DELETE | /admin/quizzes[/{id}] | settings, status |
| PUT | /admin/quizzes/{id}/questions | ordered list of `{questionId, marksOverride?, negativeOverride?}` |
| POST | /admin/quizzes/{id}/publish, /unpublish | publish validation in 3C |
| GET | /admin/students | q, enabled, page |
| GET | /admin/students/{id} | profile + attempt summary |
| PATCH | /admin/students/{id}/status | `{enabled}` |
| GET | /admin/results | filters quizId, studentId, from, to, status |
| GET | /admin/results/{attemptId} | full result + review |
| PUT | /admin/settings/password | admin changes own password |

## Student exam payload (example)
```json
{ "attemptId": 12, "status": "IN_PROGRESS", "remainingSeconds": 1710, "serverTime": "...",
  "quiz": {"id": 3, "title": "Java Basics", "durationMinutes": 30},
  "questions": [{ "questionId": 9, "position": 1, "text": "...", "options": [{"id": 31, "text": "..."}],
                  "selectedOptionId": null, "visited": true, "markedForReview": false }] }
```

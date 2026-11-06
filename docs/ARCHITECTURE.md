# ARCHITECTURE

## System
```
React SPA (Vite, :5173)  --HTTPS/JSON + Bearer JWT-->  Spring Boot 3 (:8080)  --JPA-->  MySQL 8
                                                         |- Security filter chain (JWT, roles)
                                                         |- Controllers -> Services -> Repositories
                                                         |- Scheduler (auto-submit expired attempts)
                                                         |- Flyway (schema migrations)
```
Stateless backend. All timing and scoring decisions happen on the server.

## Backend packages (`com.examadda`)
| Package | Contents |
|---|---|
| config | Clock bean, CORS, OpenAPI, scheduling, JPA auditing, properties classes |
| controller | REST controllers (`/api/**`), thin |
| service | Business rules: AuthService, QuizService, QuestionService, AttemptService, EvaluationService, AnalyticsService |
| repository | Spring Data repositories, custom queries/projections |
| entity | JPA entities, enums, `BaseEntity` (created_at, updated_at) |
| dto | Request/response records, `ApiResponse`, `PageResponse` |
| mapper | Entity ↔ DTO mappers (plain classes or MapStruct if approved in DECISIONS) |
| security | JwtService, JwtAuthFilter, UserDetailsService, SecurityConfig, handlers |
| exception | Typed exceptions, `GlobalExceptionHandler`, error codes |
| validation | Custom validators (e.g. one-correct-option, strong password) |
| scheduler | `AttemptExpiryScheduler` |

## Frontend structure (`frontend/src`)
```
components/ ui/ layout/ quiz/ exam/ charts/
pages/      auth/ student/ admin/
layouts/    StudentLayout, AdminLayout, ExamLayout, AuthLayout
services/   api.js (axios), authService, quizService, attemptService, adminService, analyticsService
hooks/      useAuth, useDebounce, useQuizzes, useAttempt, useExamTimer, useAutosave
context/    AuthContext, ThemeContext
routes/     AppRoutes, ProtectedRoute, RoleRoute
utils/      format.js (dates, durations, marks), constants.js
assets/
```

## Route map
| Path | Role | Page |
|---|---|---|
| /login, /register | public | Auth |
| /app/overview | student | Overview |
| /app/quizzes, /app/quizzes/:id | student | Explore, Quiz details |
| /app/attempts | student | My Attempts |
| /app/attempts/:id/result | student | Result dashboard |
| /app/performance | student | Performance |
| /app/profile | student | My Profile |
| /exam/:attemptId | student | Exam (focused layout) |
| /admin/dashboard, students, categories, quizzes, questions, results, settings | admin | Admin pages |

## Attempt lifecycle
```
(start) --> IN_PROGRESS --submit--> SUBMITTED
                 |--expires_at passed (scheduler or lazy)--> AUTO_SUBMITTED
```
- Start: server sets `started_at = clock.now`, `expires_at = min(started_at + duration, quiz.end_at if set)`, snapshots marking config, pre-creates one `student_answers` row per question in order.
- Autosave: upserts a single `student_answers` row. Rejected unless IN_PROGRESS and `now <= expires_at + grace`.
- Submit/auto-submit: one transaction: lock attempt row (`SELECT ... FOR UPDATE`), evaluate, insert `results`, set status. Second call returns the existing result.
- Restore: `GET /attempts/{id}` returns questions without correctness, saved answers, flags, `remainingSeconds`, `serverTime`.

## Evaluation rules
- correct = selected option is correct; incorrect = selected and wrong; unattempted = no selection.
- obtained = correct × marksPerQuestion − incorrect × negativeMarks (per-question overrides win).
- percentage = max(0, obtained / totalMarks × 100). accuracy = correct / (correct + incorrect) × 100 (0 if none attempted).
- time_taken = min(submitted_at, expires_at) − started_at.

## Cross-cutting
- Response envelope and error codes: `docs/API.md`.
- Config via env vars + Spring profiles `dev`, `prod`.
- Logging: SLF4J, no secrets, include attemptId/userId in exam logs.
- Pagination: zero-based `page`, `size` (max 50), `sort=field,dir`.

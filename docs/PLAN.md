# PLAN — Online Examination Adda

## Vision
A reliable online learning and examination platform: smooth exam experience, accurate server-side evaluation, secure backend, clean minimal UI.

## Scope (v1)
Student: register/login, explore + search + filter quizzes, take timed exams, instant results with review, attempt history, performance analytics, profile.
Admin: dashboard, students, categories/subjects, quizzes, question bank, result monitoring, settings.

## Out of scope until core is stable
AI-generated quizzes, AI explanations, leaderboards, daily challenges, bookmarks, PDF reports, full mock exams, email notifications, proctoring. Keep the architecture ready (clean services, extensible schema) but build none of them.

## How we work
- Consolidated End-to-End Execution: Completed Foundation (Phase 1), Authentication (Phase 2), and Admin Management (Phase 3).
- Remaining core features are consolidated into end-to-end phases to accelerate delivery without artificial micro-fragmentation.
- Each consolidated phase is full-stack (Backend APIs + Frontend UI + comprehensive tests).
- `docs/PROGRESS.md` is updated synchronously at each phase completion.

## Sub-part map
| Phase | Title | Scope | Status |
|---|---|---|:---:|
| **1 Foundation** | Platform Foundation | Backend baseline, Flyway DB schema & seeds, UI Kit & layouts | ✅ Done |
| **2 Authentication** | Identity & Security | JWT auth, BCrypt, route guards, layouts integration | ✅ Done |
| **3 Admin Management** | Administration Portal | Categories, Subjects, Question Bank, Quizzes & Builder, Students, Dashboard & Settings | ✅ Done (M2) |
| **4 Student Experience** | Complete Student Portal | Public/Student Quiz browse & filters, Quiz details & instructions, Student Overview Dashboard, and Profile management | 🟦 In Progress |
| **5 Exam Engine** | Live Examination Engine | Attempt lifecycle (start, restore, autosave, timer grace period, palette), distraction-free UI, instant server-side scoring & submission | ⬜ Up Next |
| **6 Results & Analytics** | Results, Review & Analytics | Score cards, question review with explanations, attempt history, performance mastery charts, admin results monitoring | ⬜ Scheduled |
| **7 Release & Deploy** | Hardening & Deployment | Full regression testing, security review, Docker Compose, production build | ⬜ Scheduled |

## Dependency order
Phase 1 (Done) → Phase 2 (Done) → Phase 3 (Done) → Phase 4 → Phase 5 → Phase 6 → Phase 7.

## Milestones
- **M1:** Authentication & RBAC live (Phases 1 & 2) — ✅ Achieved.
- **M2:** Admin management portal complete (Phase 3) — ✅ Achieved.
- **M3:** Live exam taking, timer, and server-side evaluation (Phases 4 & 5).
- **M4:** Results, detailed review, and performance analytics (Phase 6).
- **M5:** Production deployment & container release (Phase 7).

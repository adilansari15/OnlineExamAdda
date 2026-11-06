---
trigger: always_on
description: Core project context and session protocol for Online Examination Adda
---

# Project context
- Online Examination Adda: React (Vite, Tailwind v4) frontend in `frontend/`, Spring Boot 3 / Java 21 backend in `backend/`, MySQL 8 with Flyway.
- Roles: STUDENT and ADMIN. Role-based authorization is enforced by Spring Security on the backend.
- Follow `AGENTS.md`. First action in every conversation: read `docs/PROGRESS.md`, then the active sub-part in `docs/phases/`.
- Work on ONE sub-part at a time. Do not start the next sub-part. Stop and report when done.
- Never replace the stack. Never add dependencies without logging in `docs/DECISIONS.md`.

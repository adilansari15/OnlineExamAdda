# Project Context — Online Examination Adda

> Comprehensive context reference for developers and AI agents. Single source of architectural, domain, and operational truth.

---

## 1. Product Overview

**Online Examination Adda** is a full-stack, enterprise-grade online examination and quiz platform designed for high integrity and smooth candidate experience. It prioritizes:
1. **Smooth exam experience** (low latency, auto-save, resilient timer, state restoration on refresh)
2. **Accurate evaluation** (server-authoritative scoring, negative marking, instant reports)
3. **Secure backend** (stateless JWT, role-based access control, strict server-side validation)
4. **Clean UI** (responsive, dark/light themes, accessible, intuitive)
5. **Reliability** (Flyway migrations, strict database constraints, idempotency)

### User Roles
- **STUDENT**: Registers, explores published quizzes, takes timed exams with auto-save and palette navigation, views results, review breakdowns, and historical performance analytics.
- **ADMIN**: Manages categories, subjects, question bank (MCQ, single/multiple correct, marks/penalties, explanations), quizzes (draft/publish, scheduling, timers), student accounts, results monitoring, and platform settings.

---

## 2. Technology Stack (Fixed & Enforced)

No unapproved libraries or architectural substitutions.

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18+ (Vite), Tailwind CSS v4, React Router DOM, Axios, Lucide React, Recharts | Single Page Application (SPA), accessible UI, charting |
| **Backend** | Java 21, Spring Boot 3, Spring Security 6, Spring Data JPA / Hibernate, Maven | REST API, security, business logic, scheduling |
| **Database** | MySQL 8.0+, Flyway Migration | Relational data persistence, schema versioning |
| **Testing** | Backend: JUnit 5, Mockito, MockMvc, Testcontainers (MySQL)<br>Frontend: Vitest, React Testing Library, MSW | Unit, integration, and contract testing |

---

## 3. Core Architectural Principles & Integrity Rules

### 3.1 Server-Authoritative Exam Integrity
- **Server Owns Time:** Attempt `started_at` and `expires_at` are calculated and set strictly by the backend. Client timer is purely visual and resynchronizes with the server. Remaining time = $\max(0, \text{expires\_at} - \text{serverNow})$.
- **Injected Clock:** All backend time logic uses an injected `java.time.Clock`, never `Instant.now()` or `System.currentTimeMillis()` directly.
- **Autosave Grace Period:** Answer submissions are rejected if the attempt is not `IN_PROGRESS` or if $\text{serverNow} > \text{expires\_at} + \text{grace}$ (default grace period: 3 seconds).
- **No Leaked Correctness:** Student-facing question payloads must **never** include `is_correct`, `answer_key`, or explanations while an attempt is in progress. These are only released after official submission.
- **Idempotent Submission:** Submitting an attempt is strictly idempotent. Duplicate submissions return the existing result without duplicating records or double-evaluating.
- **State Restoration:** Refreshing the exam screen restores all selected options, review flags, visited question status, and remaining time seamlessly.
- **Locked Quizzes:** Quizzes that have existing attempts are permanently locked from modifications to questions and answer keys.

### 3.2 Security Baseline
- **Stateless Authentication:** JWT issued upon login. Secret keys and expiration come from environment variables.
- **RBAC:** `/api/admin/**` requires `ROLE_ADMIN`. Public endpoints are strictly limited (`/api/auth/**`, `/api/health`). All other endpoints require authentication.
- **Safe Registration:** Registration always creates accounts with `ROLE_STUDENT`. Any role passed in the client payload is ignored.
- **Password Protection:** BCrypt hashing (`BCryptPasswordEncoder`). Passwords, raw tokens, and answer keys are never logged.
- **Generic Auth Errors:** Generic error messages prevent account enumeration on login.
- **CORS:** Strictly restricted via `CORS_ALLOWED_ORIGINS` configuration.

### 3.3 API Conventions & Envelope
All responses adhere to a consistent JSON envelope:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-11-04T00:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Detailed error message",
    "details": []
  },
  "timestamp": "2026-11-04T00:00:00Z"
}
```

- DTOs are strictly used at the API boundary; JPA entities are never directly returned or exposed.

---

## 4. Repository & Directory Structure

```
onlineExamAdda/
├── .agents/
│   ├── rules/            # Core agent behavior, security, and conventions
│   └── workflows/        # Slash-command workflows (/start-subpart, /finish-subpart, etc.)
├── backend/              # Spring Boot 3 Java 21 backend application
│   ├── src/main/java/    # Controller, Service, Repository, Entity, DTO, Config layers
│   ├── src/main/resources/db/migration/ # Flyway SQL migrations (V1, V2, ...)
│   └── pom.xml
├── frontend/             # React + Vite + Tailwind CSS v4 frontend application
│   ├── src/              # Components, pages, hooks, contexts, api clients, layouts
│   └── package.json
├── docs/                 # Detailed project blueprint and documentation
│   ├── phases/           # Phase instructions (phase-01 to phase-08)
│   ├── PLAN.md           # Roadmap and sub-part mappings (1A - 8D)
│   ├── PROGRESS.md       # Status tracker and session history (ACTIVE sub-part)
│   ├── ARCHITECTURE.md   # System architecture and data flow diagrams
│   ├── DATABASE.md       # Schema, tables, indices, and constraints
│   ├── API.md            # REST API endpoints and payloads
│   ├── DESIGN.md         # UI/UX specifications, layouts, responsive behavior
│   ├── THEME.md          # Colors, typography, Tailwind tokens
│   ├── TESTING.md        # Test matrix, exam integrity checks, commands
│   ├── SECURITY.md       # Threat models and security checklists
│   ├── CONVENTIONS.md    # Code and git conventions
│   └── SETUP.md          # Local environment setup and requirements
├── context.md            # (This file) Core high-level project context
├── progress.md           # Root progress mirror & quick reference
└── test.md               # Root test guide & verification checklists
```

---

## 5. Development Workflow Protocol

1. **Check Progress:** Always check `progress.md` (or `docs/PROGRESS.md`) to find the **ACTIVE** sub-part.
2. **Review Scope:** Read the corresponding section in `docs/phases/phase-0X-*.md` and referenced architectural docs.
3. **Plan First:** Formulate a concise plan specifying files to create/modify, endpoints, and validation.
4. **Implement Strictly:** Build **only** the active sub-part. Do not jump ahead.
5. **Verify with Tests:** Execute automated and manual verification tests defined in `test.md` / `docs/TESTING.md`.
6. **Update Tracking:** Record completed work, test outcomes, and set the next sub-part in `docs/PROGRESS.md` and `progress.md`.


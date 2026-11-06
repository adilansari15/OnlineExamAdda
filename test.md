# TESTING — Online Examination Adda

> Comprehensive test runner reference, acceptance criteria, and integrity verification checklist.
> Source of truth: [`docs/TESTING.md`](docs/TESTING.md).

---

## 1. Testing Stack & Tools

- **Backend:**
  - JUnit 5
  - Mockito
  - Spring Boot Test & MockMvc
  - Spring Security Test
  - Testcontainers (MySQL 8)
  - Fixed `Clock` in all temporal tests
- **Frontend:**
  - Vitest
  - React Testing Library (RTL)
  - Mock Service Worker (MSW)
  - Playwright (E2E smoke in 8B)
- **Manual API Testing:**
  - Postman collections in `postman/`

---

## 2. Test Execution Commands

### Backend Tests
```bash
cd backend
./mvnw clean test
```

### Frontend Tests & Builds
```bash
cd frontend
npm run lint
npm test
npm run build
```

---

## 3. Sub-part Verification Checklist

| Sub-part | Verification Requirement |
|---|---|
| **1A** | Spring Boot application boots cleanly, MySQL connection succeeds, `/api/health` returns standard envelope. |
| **1B** | Flyway migrations apply cleanly on empty database, all JPA entities map correctly (`ddl-auto=validate` passes), repository smoke tests pass. |
| **1C** | Frontend builds without errors (`npm run build`), dark/light theme switch toggles, public and authenticated layouts render. |
| **2A** | Registration creates `STUDENT` role only; duplicate email yields `409 Conflict`; login returns valid JWT; tampered/expired tokens return `401 Unauthorized`; student access to `/api/admin/**` returns `403 Forbidden`. |
| **2B** | Route guards correctly redirect unauthenticated users; role-based routing functions; JWT token is automatically attached to Axios headers; `401` triggers clean logout. |
| **3A–3D** | CRUD flows for categories, subjects, question bank, and quizzes work; validation errors return formatted `400 Bad Request`; referenced entities reject deletion with `409 Conflict`; non-admin access is blocked with `403 Forbidden`; quiz publishing rules are enforced. |
| **4A** | Quizzes filter, sort, and paginate correctly; only `PUBLISHED` quizzes are visible to students; active question details and answer keys are not leaked. |
| **4B–4D** | Proper loading, empty, and error states; debounced search inputs; client filters stay synchronized with API query parameters. |
| **5A** | Starting an attempt initializes attempt and empty answer records; dates/times are assigned by the server; returning to an ongoing attempt returns existing state; attempt limits and window constraints are strictly enforced. |
| **5B** | Answer autosave succeeds during valid window; writes after expiry or submission are rejected with `409 Conflict`; options must belong to target questions; saves are idempotent. |
| **5C** | Timer syncs from server remaining duration; page refresh restores answers and state; question palette highlights answered/visited/flagged questions; autosave status indicators work accurately. |
| **5D** | Scoring matches evaluation matrix; repeated submit calls return existing result (idempotent); background scheduler auto-submits expired attempts; `time_taken` is capped to maximum duration. |
| **6A** | Result and review endpoints are inaccessible while attempt is `IN_PROGRESS`; student cannot view another student's attempt (`403`/`404`); admins can view all attempts. |
| **6B–6C** | Displayed score and accuracy statistics match API calculations; question review filters work; attempt history table displays accurate records. |
| **7A–7C** | Performance calculations match aggregate fixtures; strength/weakness thresholds function correctly; admin filters and exports work cleanly. |
| **8A–8D** | Code coverage thresholds satisfied; E2E smoke tests pass; security and database indexing audited; Docker images build and execute smoothly. |

---

## 4. Evaluation Test Matrix (Sub-part 5D)

Scenario: 10 questions, Correct = +4 marks, Incorrect = -1 mark:

| Correct | Wrong | Skipped | Total Marks | Percentage | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 10 | 0 | 0 | 40 | 100.0% | 100.0% |
| 6 | 3 | 1 | 21 | 52.5% | 66.7% |
| 0 | 10 | 0 | -10 | 0.0% (clamped) | 0.0% |
| 0 | 0 | 10 | 0 | 0.0% | 0.0% |

*Additional conditions to test: Per-question mark overrides, zero negative marking, and decimal negative penalties (e.g., -0.25).*

---

## 5. Exam Integrity Test Checklist

- [ ] **1. Late Autosave Rejection:** Writing an answer after $\text{expires\_at} + \text{grace}$ returns `409 ATTEMPT_CLOSED`.
- [ ] **2. Post-Submit Write Rejection:** Modifying an answer after final submission returns `409 Conflict`.
- [ ] **3. Submission Idempotency:** Submitting an attempt multiple times returns the identical result record with no duplicate entries in `results`.
- [ ] **4. Foreign Option Validation:** Submitting an `option_id` that does not belong to the target question returns `400 Bad Request`.
- [ ] **5. Attempt Privacy:** Accessing another student's attempt returns `403 Forbidden` or `404 Not Found`.
- [ ] **6. In-Progress Answer Key Protection:** GET requests to active attempts never expose `is_correct` or `explanation` in the JSON payload.
- [ ] **7. Client Score Tampering Prevention:** Client attempts to provide score, total marks, or duration in request bodies are ignored.
- [ ] **8. Refresh Resiliency:** Refreshing the browser during an active attempt restores selected options, review flags, visited states, and correct remaining time.


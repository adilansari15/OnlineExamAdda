# Context: Database Schema & API Envelope

## Database Tables Overview
- `users`: User credentials, email, password hash, role (`STUDENT`, `ADMIN`), active status.
- `categories`: High-level domains (e.g., Engineering, Medical, Civil Services).
- `subjects`: Granular topics mapped to categories.
- `questions`: Question text, type (MCQ), difficulty, explanation, category/subject foreign keys.
- `question_options`: Individual choices, option text, `is_correct` boolean.
- `quizzes`: Title, duration minutes, total marks, passing marks, negative mark factor, status (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- `quiz_questions`: Join table mapping questions to quizzes with order and optional mark overrides.
- `attempts`: Individual exam sessions; tracks `user_id`, `quiz_id`, `started_at`, `expires_at`, `submitted_at`, and status (`IN_PROGRESS`, `SUBMITTED`, `AUTO_SUBMITTED`).
- `attempt_answers`: Selected options, review flag, visited status.
- `results`: Final calculated marks, total questions, correct count, wrong count, skipped count, accuracy, percentage, passed status.

## Standard API Envelope
Every API response wraps its payload:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2026-11-04T00:00:00Z"
}
```

Errors follow a uniform structure handled by the Global Exception Handler:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation",
    "details": []
  },
  "timestamp": "2026-11-04T00:00:00Z"
}
```


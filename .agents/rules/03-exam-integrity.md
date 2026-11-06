---
trigger: always_on
description: Exam engine rules that must never be violated
---

1. Attempt `started_at` and `expires_at` are set by the server. Remaining time = `expires_at - serverNow`. The client timer is display only and re-syncs with the server.
2. Answer writes are rejected once the attempt is not IN_PROGRESS or `now > expires_at + grace` (grace is configurable, default 3s).
3. Submit is idempotent: a second submit returns the existing result and never creates a second `results` row (`results.attempt_id` is unique).
4. Scores are computed only on the backend from stored options and quiz marking config snapshotted on the attempt.
5. Student-facing question payloads never contain `is_correct` or explanation until status is SUBMITTED or AUTO_SUBMITTED.
6. Refresh must restore: current answers, review flags, visited flags, remaining time.
7. Expired attempts are closed by the scheduler and lazily on read (whichever happens first).
8. A quiz that has attempts is locked for question-set and answer-key changes.

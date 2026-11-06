# Context: Exam Integrity & Engine Rules

The integrity of examinations is the highest-priority functional requirement.

## Invariant Rules
1. **Server Clock Authority:**
   - Attempt `started_at` and `expires_at` are set strictly by the server.
   - Client-side countdown timers are for display purposes only.
   - All time computations use a Spring-managed `java.time.Clock` bean for deterministic testability.
2. **Autosave & Time Windows:**
   - Answer saves are permitted only while an attempt has status `IN_PROGRESS` and $\text{serverNow} \le \text{expires\_at} + \text{grace}$ (default 3 seconds).
   - Writes after expiry or submission are rejected with `409 Conflict`.
3. **Information Disclosure Prevention:**
   - Active exam payloads never leak option correctness (`is_correct`) or question explanations.
   - Solutions and explanations are strictly unsealed only after submission is finalized.
4. **Submission Idempotency:**
   - Repeated submission calls return the existing generated result.
   - `results.attempt_id` has a unique constraint to prohibit duplicate result records.
5. **Score Evaluation:**
   - Calculated entirely on the backend using snapshotted quiz marking policies. Client score or marks parameters are ignored.
6. **State Resiliency:**
   - Full browser refreshes restore all answered options, visited statuses, review flags, and exact remaining duration.


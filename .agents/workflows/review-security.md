---
description: Audit the current code against the security checklist
---

1. Walk through every item in `docs/SECURITY.md`; mark Pass / Fail / N/A with file references.
2. Test authorization manually or with MockMvc: student calling admin endpoints, student reading another student's attempt, unauthenticated calls, tampered JWT, expired JWT.
3. Test exam tampering: write after expiry, write after submit, submit twice, answer with an option from another question.
4. Report findings sorted by severity and fix Critical/High items after user approval.

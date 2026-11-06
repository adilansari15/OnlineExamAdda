---
description: Verify and close the current sub-part
---

1. Re-read the acceptance criteria of the active sub-part and tick each one with evidence.
2. Run backend tests (`./mvnw test`) and frontend checks (`npm run lint`, `npm test`, `npm run build`) as applicable.
3. Update `docs/PROGRESS.md` (status, date, notes, carry-over), `docs/CHANGELOG.md`, and `docs/API.md` / `docs/DATABASE.md` / `docs/DECISIONS.md` if anything changed.
4. Suggest a conventional-commit message and a branch name per `docs/CONVENTIONS.md`.
5. Report: done, tested, known gaps, next sub-part. Stop.

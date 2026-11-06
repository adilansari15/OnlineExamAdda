---
description: Start a sub-part (usage: /start-subpart 3B)
---

1. Read `AGENTS.md` and `docs/PROGRESS.md`. Confirm the requested sub-part's prerequisites are marked DONE. If not, stop and tell the user.
2. Open the sub-part in `docs/phases/` and the docs it references.
3. Produce an implementation plan: files, endpoints/tables, components, tests, risks. Wait for the user's OK if the plan changes any contract in `docs/API.md` or `docs/DATABASE.md`.
4. Implement in small steps. After the backend part, run backend tests. After the frontend part, run frontend tests and `npm run build`.
5. Run `/finish-subpart`.

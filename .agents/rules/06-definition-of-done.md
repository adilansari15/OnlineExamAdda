---
trigger: always_on
description: What done means for a sub-part
---

A sub-part is done only when ALL are true:
1. Acceptance criteria in its phase file are met.
2. Tests listed in `docs/TESTING.md` for it pass (run them, show results).
3. App starts cleanly (backend and frontend) and existing features still work.
4. Docs updated: PROGRESS (always), API/DATABASE/DECISIONS/CHANGELOG when relevant.
5. No TODOs left silently; unfinished items are written in PROGRESS under "Carry-over".
Then stop and wait for the user.

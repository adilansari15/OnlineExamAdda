---
description: Diagnose and fix a bug without side effects
---

1. Reproduce the bug and write a failing test first when practical.
2. Find the root cause; state it in one or two sentences.
3. Make the smallest fix. Do not refactor unrelated code.
4. Run the full relevant test suites. Add the regression test.
5. Log in `docs/CHANGELOG.md` (Fixed). If the cause was a design flaw, add a `docs/DECISIONS.md` entry.

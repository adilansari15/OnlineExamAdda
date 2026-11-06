# PROMPTS — copy and paste, one per conversation

Tip: start a NEW conversation per sub-part. Use Planning mode for 1A, 1B, 2A, 5A–5D, 8C. Fast mode is fine for small UI sub-parts.

## 0. Onboarding (first conversation only, no code)
```
Read AGENTS.md, docs/PLAN.md, docs/ARCHITECTURE.md, docs/DATABASE.md and docs/API.md.
Do not write code. Summarize the project in 10 lines, list any ambiguity or risk you see in the docs, and confirm the first sub-part is 1A.
```

## 1. Standard sub-part prompt
Replace the code and name.
```
/start-subpart 3B
Sub-part 3B (Question bank). Follow AGENTS.md. Work only on 3B, then stop and report.
```
If workflows are not available, use:
```
Follow AGENTS.md session protocol. Read docs/PROGRESS.md and docs/phases/phase-03-admin.md, section 3B.
Plan first, implement only 3B, run its tests, update docs/PROGRESS.md, then stop.
```

## 2. Resume prompt (new conversation, work was interrupted)
```
Follow AGENTS.md. Read docs/PROGRESS.md and continue the ACTIVE sub-part exactly where the last session stopped. Check git status first. Do not redo finished work.
```

## 3. Utility prompts
- Bug: `/fix-bug` then describe the bug, steps and expected behavior.
- Security audit: `/review-security`
- UI audit: `/review-ui`
- Docs drift: `/sync-docs`
- Scope check: `Compare the current code against docs/phases/<file> section <code> and list what is missing. Do not change code.`

## Sub-part codes and files
| Code | File | Title |
|---|---|---|
| 1A–1C | phase-01-foundation.md | Foundation |
| 2A–2B | phase-02-authentication.md | Authentication |
| 3A–3D | phase-03-admin.md | Admin management |
| 4A–4D | phase-04-student-experience.md | Student experience |
| 5A–5D | phase-05-exam-engine.md | Exam engine |
| 6A–6C | phase-06-results.md | Results |
| 7A–7C | phase-07-analytics.md | Analytics and monitoring |
| 8A–8D | phase-08-testing-deployment.md | Testing and deployment |

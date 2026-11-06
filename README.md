# Online Examination Adda

Online exam and quiz platform. React + Vite + Tailwind (frontend), Spring Boot 3 + Java 21 (backend), MySQL 8.

## Using this repo with Google Antigravity
1. Open this folder as the workspace. Antigravity reads `AGENTS.md` / `GEMINI.md` and `.agents/rules/` automatically. Check Customizations → Rules to confirm the 7 workspace rules are listed. (If your build uses `.agent/` instead of `.agents/`, rename the folder.)
2. In Customizations → Workflows you should see `/start-subpart`, `/finish-subpart`, `/fix-bug`, `/review-security`, `/review-ui`, `/sync-docs`.
3. Create the MySQL database and `.env` (`docs/SETUP.md`).
4. Open `docs/PROMPTS.md`. Run prompt 0 once. Then run one sub-part prompt per new conversation, starting with 1A.
5. After each sub-part: check the app, review the diff, commit, then start the next conversation.

## Why small sub-parts
Each prompt is a few lines; the detailed instructions live in `docs/phases/`. This keeps context small, results consistent, and lets you review and commit after every step.

## Folder map
```
AGENTS.md  GEMINI.md  README.md  .env.example  .gitignore
.agents/rules/      always-on and file-scoped agent rules
.agents/workflows/  slash-command workflows
docs/               plan, progress, architecture, database, api, design, theme, testing, security, ...
docs/phases/        8 phase files with sub-parts 1A ... 8D
backend/            Spring Boot (package skeleton ready)
frontend/           React (folder skeleton ready)
postman/  deploy/   API collections, Docker/deploy files
```

## Rules of thumb
- One sub-part per conversation. Always end by updating `docs/PROGRESS.md`.
- Change a contract (API/DB)? Update the docs first, then the code.
- Unsure about a decision? Look in `docs/DECISIONS.md`, and answer the "Proposed" ones (D-005, D-006) before 3C.

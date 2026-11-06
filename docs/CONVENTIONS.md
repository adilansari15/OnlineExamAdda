# CONVENTIONS

## Git
- Branch per sub-part: `feat/3b-question-bank`. Merge to `main` only when the sub-part is DONE.
- Conventional commits: `feat(quiz): add quiz CRUD`, `fix(attempt): reject late autosave`, `docs: update API`, `test:`, `refactor:`, `chore:`.
- One sub-part may have several commits; never commit `.env`, `target/`, `node_modules/`.

## Backend
- Classes: `QuizController`, `QuizService`, `QuizRepository`, `Quiz`, `QuizRequest`, `QuizResponse`, `QuizMapper`.
- DTOs are Java records. Requests end with `Request`, responses with `Response`/`Summary`/`Detail`.
- Endpoints: plural nouns, kebab-case, no verbs except actions (`/submit`, `/publish`).
- Enums stored as `STRING`. Money-like numbers (marks) use `BigDecimal`.
- Migrations: `V3__add_quiz_window.sql`, never edit applied ones.
- Tests: `XxxServiceTest` (unit), `XxxControllerIT` (integration).

## Frontend
- Files: `QuizCard.jsx`, `useQuizzes.js`, `quizService.js`. Named exports for hooks/utils, default export for pages.
- Route constants in `utils/constants.js`.
- Dates shown in the user's local time; API always UTC ISO-8601.
- ESLint + Prettier, no unused code, no console logs in committed code.

## Documentation
Short, factual. Update PROGRESS every sub-part. Log non-obvious choices in DECISIONS (what, why, alternatives).

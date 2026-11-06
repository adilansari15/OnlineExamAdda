---
trigger: glob
globs: frontend/src/**/*.{js,jsx}
description: React coding rules
---

- Function components and hooks. One component per file, PascalCase file names. Pages in `pages/`, reusable UI in `components/`.
- All HTTP goes through `src/services/api.js` (single Axios instance) and per-domain service files. No `axios` calls inside components.
- Server state lives in custom hooks (`useQuizzes`, `useAttempt`). Global state only for auth and theme (`context/`).
- Every data view renders four states: loading (skeleton), empty, error (with retry), success.
- Styling: Tailwind utilities with the tokens in `docs/THEME.md`. No hard-coded hex values in components. No inline styles unless dynamic.
- Icons: Lucide React only. Charts: Recharts only, themed via tokens.
- Forms: controlled inputs, show server field errors from the API envelope.
- Accessibility: semantic elements, labels on inputs, visible focus ring, keyboard navigable exam page.
- Never compute scores, correctness or remaining time authoritatively on the client.

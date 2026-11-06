---
trigger: glob
globs: frontend/**/*.{jsx,css}
description: UI design guardrails
---

- Follow `docs/DESIGN.md` and `docs/THEME.md`. Minimal but impactful: strong typography, consistent spacing, subtle borders.
- Avoid gradients, heavy shadows, decorative clutter, random colors, and more than one accent color per view.
- Use semantic color tokens (`bg-surface`, `text-muted`, `border-border`, `text-success`). Both light and dark mode must work.
- Student and admin layouts use the sidebars defined in `docs/DESIGN.md`. Exam page uses the focused exam layout (no sidebar).

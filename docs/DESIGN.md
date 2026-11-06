# DESIGN (UI/UX)

Philosophy: minimal but impactful, premium EdTech. Strong typography, consistent spacing, subtle borders, one accent. Tokens live in `THEME.md`.
Avoid: heavy gradients, big shadows, decorative clutter, too many cards, random colors, unnecessary animation.

## Layouts
- **AuthLayout**: centered card on soft background, brand on top.
- **StudentLayout**: left sidebar (256px, collapsible to icons at <1024px, drawer on mobile) + top bar (page title, theme toggle, profile menu). Sidebar order: Overview, Explore Quizzes, My Attempts, Performance, My Profile, Logout.
- **AdminLayout**: same shell. Sidebar: Dashboard, Students, Categories, Quizzes, Question Bank, Examination Results, Settings, Logout.
- **ExamLayout**: no sidebar. Header (quiz title, timer, submit), main question area, right palette (drawer on mobile), sticky bottom action bar.
- Content max width 1200px, page padding 24px desktop / 16px mobile, section gap 24px.

## Shared components (frontend/src/components)
Button (primary, secondary, ghost, danger), Input, Select, Textarea, Checkbox, Radio card, Modal, ConfirmDialog, Drawer, Table (responsive), Pagination, Badge (difficulty, status), StatCard, Skeleton, EmptyState, ErrorState, Toast, Tabs, ProgressBar, SearchInput, PageHeader.

## Screens
1. **Login / Register**: clear form, inline errors, password hint.
2. **Overview**: welcome line + motivational sentence; 4 stat tiles (quizzes attempted, avg score, accuracy, questions attempted); Continue Learning (resume in-progress + recent + 3 recommended); Upcoming Examinations (date, duration, status); Recent Activity list. Max 4 sections visible without scroll fatigue.
3. **Explore Quizzes**: search bar, category chips (12), difficulty filter, sort select, quiz cards grid (title, category, difficulty badge, questions, duration, marks, negative-marking icon, attempts), pagination.
4. **Quiz Details / Instructions**: summary, rules, marking scheme, negative marking explanation, confirmation checkbox, Start Exam.
5. **Exam**: see below.
6. **Result**: hero (obtained/max, percentage), metrics (correct, incorrect, unattempted, accuracy, time), question review list with filters, Retry if allowed.
7. **My Attempts**: table (quiz, date, score, %, accuracy, time, status) + open report.
8. **Performance**: KPI row, score trend line, accuracy trend line, subject-wise bar, strong/weak subjects.
9. **My Profile**: details form, change password.
10. **Admin pages**: dashboard KPIs + recent activity; list pages with search, filters, pagination, create/edit modal or page; quiz builder with question picker.

## Exam screen
- Timer in header, monospace digits; turns warning color under 5 min, error color under 1 min. Never auto-hide.
- One question at a time; options as large radio cards (A–D). Selected state clearly visible.
- Actions: Previous, Next, Mark for Review & Next, Clear Response, Save indicator ("Saving…", "Saved", "Offline, retrying").
- Palette: numbered buttons grid with 5 states.
  | State | Look |
  |---|---|
  | Not Visited | neutral outline |
  | Not Answered | error-tinted |
  | Answered | success fill |
  | Marked for Review | violet fill |
  | Answered and Marked | success fill + violet dot |
  Legend + counts below the grid.
- Submit opens a confirm dialog with counts (answered, not answered, marked).
- Warn on tab close/refresh (`beforeunload`). Refresh restores everything from the server.

## States and feedback
Loading: skeletons matching layout. Empty: icon + one sentence + action. Error: message + Retry. Success/failure: toast. Destructive: confirm dialog.

## Responsive
Breakpoints 375 / 768 / 1024 / 1280. Tables become stacked rows on mobile. Exam palette becomes a bottom drawer on mobile. Touch targets at least 44px.

## Accessibility
Semantic HTML, labels, visible focus ring, color never the only signal (palette uses numbers + icons/dots), contrast AA, keyboard shortcuts on exam page optional (←/→ navigate, 1–4 select).

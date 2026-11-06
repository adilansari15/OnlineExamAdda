# Online Examination Adda

## Design System & Theme Specification

**Design direction:** Premium Monochrome Gloss\
**Product type:** Online examination and quiz platform\
**Visual identity:** Minimal · Glossy · Monochromatic · Professional

------------------------------------------------------------------------

## 1. Design vision

Create a premium examination platform using a restrained black,
charcoal, grey, silver and white palette. The interface should feel
polished and sophisticated, with subtle glossy surfaces rather than
colorful effects.

The product should combine: - A welcoming public landing page. - A
productive student dashboard. - A distraction-free examination
experience. - Clear result and performance analytics. - A practical
administration interface.

### Non-negotiable visual rules

1.  Use monochrome colors only for the core interface.
2.  Do not use gradients anywhere.
3.  Do not use neon, colorful glow, rainbow effects or multicolor
    charts.
4.  Gloss should come from subtle highlights, layered surfaces, fine
    borders and realistic shadows.
5.  Prioritize readability, contrast, spacing and usability over
    decoration.
6.  Keep the active examination screen calmer and flatter than the
    dashboard.
7.  Do not make every card look like glass. Use glossy treatment
    selectively.

------------------------------------------------------------------------

## 2. Color system

### Core palette

  Token                     Hex         Usage
  ------------------------- ----------- ------------------------------
  `color-black`             `#090909`   Main dark background
  `color-black-soft`        `#101010`   Sidebar and deep surfaces
  `color-charcoal`          `#171717`   Primary cards
  `color-charcoal-raised`   `#202020`   Raised cards and panels
  `color-graphite`          `#2B2B2B`   Secondary surfaces
  `color-border`            `#383838`   Default borders
  `color-border-strong`     `#505050`   Emphasized borders
  `color-steel`             `#777777`   Muted icons and metadata
  `color-silver`            `#BDBDBD`   Secondary text
  `color-off-white`         `#EAEAEA`   Main body text
  `color-white`             `#FFFFFF`   Headings and primary actions

### Light theme support

  Token                    Hex         Usage
  ------------------------ ----------- ------------------
  `light-background`       `#F5F5F5`   Main background
  `light-surface`          `#FFFFFF`   Cards and panels
  `light-surface-muted`    `#EEEEEE`   Secondary panels
  `light-border`           `#D8D8D8`   Borders
  `light-text`             `#111111`   Primary text
  `light-text-secondary`   `#626262`   Secondary text

Dark mode is the primary visual experience. Light mode should preserve
the same hierarchy and component language.

### Semantic exam states

Semantic states are functional indicators, not decorative accent colors.
Keep them muted and accessible.

  State               Dark surface   Text / indicator
  ------------------- -------------- ------------------
  Answered            `#1D2922`      `#A9D5B5`
  Incorrect           `#2D1D1D`      `#E3AAAA`
  Unanswered          `#292929`      `#D0D0D0`
  Marked for review   `#302B22`      `#E0C995`
  Answered + review   `#25252B`      `#C5C5D5`
  Disabled            `#202020`      `#777777`

Use semantic state colors only where they communicate exam status,
feedback or validation. Never turn them into general branding colors.

------------------------------------------------------------------------

## 3. Typography

### Font family

Use **Manrope** for display headings and **Inter** for interface and
reading text.

-   Display and large headings: Manrope, weight 600--700.
-   Body and UI: Inter, weight 400--600.
-   Exam questions: Inter, weight 500--600.
-   Numeric statistics: Inter, weight 600--700 with tabular numerals.
-   Code snippets, if required: JetBrains Mono.

Use locally hosted font files or a reliable font provider. Include
sensible system fallbacks.

``` css
:root {
  --font-display: "Manrope", "Inter", sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

### Type scale

Desktop sizes are the default. Reduce display sizes responsively on
mobile.

  Style           Font        Size   Weight   Line height
  --------------- --------- ------ -------- -------------
  Display XL      Manrope     56px      700          1.08
  Display L       Manrope     48px      700          1.10
  H1              Manrope     40px      700          1.15
  H2              Manrope     32px      650          1.20
  H3              Manrope     24px      650          1.25
  H4              Manrope     20px      600          1.30
  H5              Inter       18px      600          1.35
  Body large      Inter       16px      400          1.60
  Body            Inter       14px      400          1.55
  Body small      Inter       13px      400          1.50
  Label           Inter       12px      600          1.40
  Caption         Inter       11px      500          1.40
  Button          Inter       14px      600          1.00
  Exam question   Inter       18px      500          1.60
  Option text     Inter       15px      500          1.45
  Statistic       Inter       32px      700          1.10

### Responsive typography

  Style             Desktop   Mobile
  --------------- --------- --------
  Display XL           56px     38px
  Display L            48px     34px
  H1                   40px     30px
  H2                   32px     26px
  H3                   24px     21px
  H4                   20px     18px
  Body large           16px     16px
  Body                 14px     14px
  Exam question        18px     17px

### Typography rules

-   Use sentence case for navigation, buttons and headings.
-   Avoid all-caps headings; reserve uppercase for tiny metadata labels.
-   Keep paragraph line length around 60--75 characters.
-   Use tabular numerals for timers, scores and statistics.
-   Do not use ultra-light font weights on dark surfaces.
-   Keep text contrast strong; muted text must remain readable.

------------------------------------------------------------------------

## 4. Glossy surface language

Gloss should be subtle and controlled. It should suggest polished black
acrylic, satin metal and layered glass---not a bright glassmorphism
template.

### Surface treatments

**Primary card** - Background: `#171717` - Border: `1px solid #383838` -
Radius: 14px - Shadow: `0 8px 24px rgba(0,0,0,.24)` - Optional top
highlight: `inset 0 1px 0 rgba(255,255,255,.06)`

**Raised card** - Background: `#202020` - Border: `1px solid #414141` -
Radius: 14px - Shadow:
`0 12px 30px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)`

**Glossy panel** - Background: `rgba(32,32,32,.88)` - Border:
`1px solid rgba(255,255,255,.10)` - Backdrop blur: 8px maximum, only
where useful - Avoid excessive transparency that harms text contrast.

### Gloss rules

-   No gradient fills, including button, text, border or background
    gradients.
-   No large blurred colored blobs.
-   No strong outer glow.
-   Use a thin top-edge highlight sparingly.
-   Use restrained reflections on hero visuals or featured cards only.
-   Prefer solid surfaces over blur when performance or readability is
    affected.

------------------------------------------------------------------------

## 5. Layout foundations

### Grid and spacing

Use a 4px base spacing system.

  Token          Value
  ------------ -------
  `space-1`        4px
  `space-2`        8px
  `space-3`       12px
  `space-4`       16px
  `space-5`       20px
  `space-6`       24px
  `space-8`       32px
  `space-10`      40px
  `space-12`      48px
  `space-16`      64px
  `space-20`      80px
  `space-24`      96px

### Radius

  Component               Radius
  --------------------- --------
  Small input / badge        6px
  Button                     8px
  Standard card             12px
  Large panel               16px
  Modal                     16px
  Pill                     999px

### Desktop application shell

-   Sidebar width: 248px expanded; 76px collapsed.
-   Top bar height: 72px.
-   Main content max width: 1440px.
-   Main content padding: 32px.
-   Dashboard grid gap: 20--24px.
-   Keep the main content aligned to a consistent grid.

### Mobile shell

-   Replace persistent sidebar with a compact top bar and bottom
    navigation where appropriate.
-   Main horizontal padding: 16px.
-   Keep touch targets at least 44×44px.
-   Stack dashboard cards into one column or a carefully chosen
    two-column layout.
-   Examination question palette should open as a drawer or bottom
    sheet.
-   Avoid horizontal scrolling for core exam actions.

------------------------------------------------------------------------

## 6. Component specifications

### Navigation

**Sidebar** - Background: `#101010` - Right border:
`1px solid #303030` - Brand mark and product name at the top. - Group
links by Overview, Examination and Account. - Active item: `#252525`
surface, white text, subtle left border or compact indicator. - Inactive
item: `#A0A0A0` text. - Hover: `#1E1E1E` surface. - Use Lucide icons,
18--20px.

**Top bar** - Height: 72px. - Search, breadcrumbs or page title,
notifications and profile. - Bottom border: `1px solid #2E2E2E`. - Keep
controls compact and aligned.

### Buttons

  Variant       Style
  ------------- ------------------------------------------------
  Primary       White fill, black text
  Secondary     `#242424` fill, white text, grey border
  Outline       Transparent fill, white text, grey border
  Ghost         Transparent fill, silver text
  Destructive   Dark muted red surface and accessible red text
  Disabled      Muted surface and low-emphasis text

Button dimensions: - Small: 32px high, 12px horizontal padding, 12px
text. - Medium: 40px high, 16px horizontal padding, 14px text. - Large:
48px high, 20px horizontal padding, 15px text. - Use 8px radius. -
Hover: slightly brighter surface or border. - Active: subtle pressed
state. - Focus: visible high-contrast outline. - No gradients or glowing
shadows.

### Cards

-   Use a clear hierarchy: primary, secondary and compact.
-   Standard padding: 20--24px.
-   Use a fine border and soft shadow.
-   Avoid nested cards unless the content hierarchy requires them.
-   Card titles: 16--18px, weight 600.
-   Card descriptions: 13--14px, muted grey.

### Inputs and forms

-   Height: 44px standard.
-   Background: `#171717`.
-   Border: `1px solid #3A3A3A`.
-   Text: `#F2F2F2`.
-   Placeholder: `#858585`.
-   Radius: 8px.
-   Focus: border changes to `#BDBDBD` with a visible outline.
-   Error text: 12px and accessible semantic error color.
-   Labels: 12px, weight 600, with 6--8px spacing below.

### Badges and chips

-   Compact, low-contrast monochrome surfaces.
-   Use semantic variants only for statuses.
-   Height: 24--28px.
-   Horizontal padding: 8--10px.
-   Font size: 11--12px, weight 600.
-   Avoid oversized pill badges.

### Tables

-   Header background: `#202020`.
-   Row background: `#171717`.
-   Divider: `#303030`.
-   Header text: 12px, weight 600, muted silver.
-   Body text: 13--14px.
-   Row height: 52--60px.
-   Use clear hover states and responsive overflow handling.

### Modals and drawers

-   Overlay: black at 65--75% opacity.
-   Modal surface: `#1A1A1A`.
-   Border: `1px solid #414141`.
-   Radius: 16px.
-   Padding: 24px.
-   Keep destructive actions visually distinct and require confirmation
    for consequential actions.

------------------------------------------------------------------------

## 7. Product screen layouts

### A. Landing page

**Goal:** Explain the platform quickly and move visitors toward
exploring or starting an exam.

Recommended order: 1. Minimal navigation: logo, Explore Exams, Features,
Login, Get Started. 2. Hero: concise headline, supporting copy and
primary CTA. 3. Search exams or subjects. 4. Popular categories. 5.
Featured and trending tests. 6. How it works: Choose → Attempt →
Analyze. 7. Benefits and platform features. 8. Footer with help,
policies and contact links.

Hero typography: - Headline: Manrope 56px / 1.08 / 700 desktop; 38px
mobile. - Supporting text: Inter 16px / 1.6. - Primary CTA: 48px high.

Use a monochrome hero composition. Do not use decorative gradients or
colorful illustrations.

### B. Student dashboard

**Goal:** Help students understand their progress and start the next
useful action.

Desktop layout: - Left sidebar navigation. - Top bar with greeting
context, notifications and profile. - Welcome panel with "Start a Test"
as the primary action. - Four KPI cards: Tests Attempted, Average Score,
Accuracy and Current Rank. - Continue Learning / Recent Tests. -
Upcoming Exams. - Performance Overview. - Recommended Tests or Weak
Topics.

Suggested dashboard hierarchy: - Page title: 32px. - Welcome title:
24px. - KPI number: 30--32px. - KPI label: 12--13px. - Section heading:
18--20px. - Supporting copy: 13--14px.

Use monochrome charts: white primary series, grey secondary series and
grey gridlines. Semantic colors may be used for correctness status only.

### C. Examination screen

**Goal:** Provide a distraction-free, reliable test-taking experience.

Layout: - Compact top header with exam name, section and timer. - Main
question area. - Question navigation panel on desktop. - Bottom action
bar. - Mobile question palette as a drawer or bottom sheet.

Question area: - Question number and marks metadata: 12--13px. -
Question text: 18px desktop, 17px mobile, weight 500, line height 1.6. -
Answer option text: 15px. - Option row: minimum 52px high. - Option
border: `#414141`. - Selected option: `#EAEAEA` border and restrained
light surface contrast. - Previous, Mark for Review and Save & Next
actions must be clearly differentiated.

Question palette states: - Not visited: dark grey. - Not answered:
neutral grey outline. - Answered: muted green semantic state. - Marked
for review: muted amber semantic state. - Answered and marked: distinct
outlined semantic state. - Current question: strong white outline.

Functional requirements: - Autosave each answer and show a clear save
status. - Preserve answers when navigating between questions. - Provide
a submission confirmation with attempted, unanswered and marked
counts. - Auto-submit or handle expiry according to the exam rules. -
Warn before leaving an active examination when appropriate. - Do not
rely on color alone to communicate question status; use labels, icons or
patterns too. - Make timer numerals tabular and highly legible.

### D. Result and performance page

**Goal:** Make the result immediately understandable and provide
actionable feedback.

Recommended order: 1. Result summary with score and percentage. 2.
Correct, incorrect and skipped counts. 3. Time taken and accuracy. 4.
Subject or topic-wise breakdown. 5. Performance chart. 6.
Question-by-question review. 7. Retake or return to dashboard actions.

Typography: - Main score: 48px desktop, 38px mobile, weight 700. -
Result label: 14px. - KPI values: 24--28px. - Review question: 15--16px.

Use monochrome charts by default. Use muted semantic states for correct
and incorrect answers.

### E. Admin dashboard

**Goal:** Give administrators efficient control over exams, questions,
users and reports.

Sidebar: - Overview - Students - Subjects - Question Bank -
Examinations - Results - Reports & Analytics - Settings

Overview: - Total Students. - Active Examinations. - Total Questions. -
Tests Completed. - Recent activity. - Exam performance overview.

Management screens: - Search, filter and sort controls. - Clear table
actions. - Create and edit forms. - Confirmation for deletion and
publishing. - Draft, Scheduled, Live and Completed exam states. -
Pagination for large lists.

Use the same component system as the student dashboard; do not create a
separate visual identity for admin.

------------------------------------------------------------------------

## 8. Iconography and imagery

### Icons

-   Use Lucide icons consistently.
-   Standard size: 18px.
-   Navigation icons: 20px.
-   Small metadata icons: 14--16px.
-   Use 1.75--2px stroke weight.
-   Prefer simple outline icons over filled decorative icons.

### Imagery

-   Prefer monochrome photography, grayscale illustrations or no
    imagery.
-   Avoid colorful stock illustrations.
-   Do not use random decorative graphics in the exam flow.
-   Use charts and meaningful data visualizations where they add
    information.

------------------------------------------------------------------------

## 9. Motion and interaction

Motion should feel controlled and responsive.

  Interaction         Duration Behavior
  ----------------- ---------- -------------------------------
  Button hover           140ms Surface and border transition
  Card hover             180ms Slight elevation
  Modal open             180ms Fade and small translate
  Drawer open            220ms Slide into view
  Tooltip                120ms Fade
  Page transition        160ms Subtle fade, optional

Rules: - No bouncing, spinning or excessive parallax. - No continuous
decorative animation. - Respect `prefers-reduced-motion`. - Never delay
exam navigation or answer saving for an animation.

------------------------------------------------------------------------

## 10. Accessibility and usability

-   Meet WCAG AA contrast targets wherever possible.
-   Provide keyboard navigation and visible focus states.
-   Use semantic HTML and correctly associated form labels.
-   Do not communicate status using color alone.
-   Provide accessible names for icon-only controls.
-   Ensure touch targets are at least 44×44px.
-   Keep body text comfortably readable.
-   Support zoom and responsive reflow.
-   Make error messages specific and actionable.
-   Announce timer and save-state changes appropriately without creating
    excessive screen-reader interruptions.

------------------------------------------------------------------------

## 11. Design tokens --- CSS starter

``` css
:root {
  /* Typography */
  --font-display: "Manrope", "Inter", sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Dark theme */
  --bg: #090909;
  --surface: #101010;
  --surface-card: #171717;
  --surface-raised: #202020;
  --surface-hover: #292929;

  --border: #383838;
  --border-strong: #505050;

  --text-primary: #FFFFFF;
  --text-secondary: #BDBDBD;
  --text-muted: #777777;

  /* Actions */
  --button-primary-bg: #FFFFFF;
  --button-primary-text: #090909;
  --button-secondary-bg: #242424;

  /* Semantic states */
  --success-bg: #1D2922;
  --success-text: #A9D5B5;
  --error-bg: #2D1D1D;
  --error-text: #E3AAAA;
  --warning-bg: #302B22;
  --warning-text: #E0C995;

  /* Shape */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-card: 14px;
  --radius-panel: 16px;

  /* Shadows — no colored glow */
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.24);
  --shadow-raised: 0 12px 30px rgba(0, 0, 0, 0.28);
  --highlight-top: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

------------------------------------------------------------------------

## 12. Implementation checklist

### Foundation

-   [ ] Load Manrope and Inter fonts.
-   [ ] Define color, typography, spacing, radius and shadow tokens.
-   [ ] Implement dark theme as default.
-   [ ] Implement optional light theme.
-   [ ] Set responsive breakpoints and layout containers.

### Shared components

-   [ ] Sidebar and mobile navigation.
-   [ ] Top bar and profile menu.
-   [ ] Buttons and icon buttons.
-   [ ] Cards and KPI cards.
-   [ ] Inputs, selects and textareas.
-   [ ] Badges, tabs and tooltips.
-   [ ] Tables, pagination and filters.
-   [ ] Modals, drawers and confirmation dialogs.
-   [ ] Loading, empty, error and success states.

### Student experience

-   [ ] Landing page.
-   [ ] Student dashboard.
-   [ ] Exam discovery and details.
-   [ ] Examination interface.
-   [ ] Submission confirmation.
-   [ ] Result summary.
-   [ ] Answer review.
-   [ ] Profile and settings.

### Admin experience

-   [ ] Admin overview.
-   [ ] Student management.
-   [ ] Subject management.
-   [ ] Question bank.
-   [ ] Exam creation and scheduling.
-   [ ] Result management.
-   [ ] Reports and analytics.

### Quality

-   [ ] Test desktop, tablet and mobile layouts.
-   [ ] Verify keyboard accessibility.
-   [ ] Verify contrast and readable font sizes.
-   [ ] Verify exam navigation and autosave behavior.
-   [ ] Verify timer and submission behavior.
-   [ ] Check that no gradients or unintended colors have entered the
    interface.

------------------------------------------------------------------------

## 13. Final instruction for implementation

Treat this file as the single source of truth for the visual design of
Online Examination Adda.

Do not introduce a new color palette or typography system on individual
pages. Reuse the shared tokens and components. Maintain the same visual
language across the landing page, student dashboard, exam flow, result
pages and admin panel.

**Final identity:** Premium Monochrome Gloss --- polished black
surfaces, charcoal depth, silver details, crisp white typography and
purposeful simplicity.

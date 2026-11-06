# THEME

Light and dark supported from day one via CSS variables. Components use semantic tokens only.

## Tokens (put in `frontend/src/index.css`)
```css
@import "tailwindcss";

:root {
  --color-bg: #F8FAFC;          /* Clean off-white Slate-50 */
  --color-surface: #FFFFFF;     /* Crisp pure white */
  --color-surface-2: #F1F5F9;   /* Soft Slate-100 */
  --color-border: #E2E8F0;      /* Crisp Slate-200 border */
  --color-text: #0F172A;        /* Deep Slate-900 high contrast */
  --color-muted: #64748B;       /* Slate-500 secondary text */
  --color-primary: #0F172A;     /* Solid Slate-900 for executive contrast */
  --color-primary-fg: #FFFFFF;
  --color-accent: #4F46E5;      /* Vibrant modern Indigo */
  --color-accent-fg: #FFFFFF;
  --color-success: #10B981;     /* Emerald-500 */
  --color-warning: #F59E0B;     /* Amber-500 */
  --color-error: #EF4444;       /* Rose-500 */
  --color-review: #8B5CF6;      /* Violet-500 */
  --color-ring: #4F46E5;        /* Focused ring */
}
.dark {
  --color-bg: #090D16;          /* Deep rich charcoal */
  --color-surface: #111726;     /* Elevated dark surface */
  --color-surface-2: #1A2234;   /* Subtle elevated layer */
  --color-border: #232E42;      /* Hairline crisp dark border */
  --color-text: #F8FAFC;        /* Crisp white text */
  --color-muted: #94A3B8;       /* Slate-400 secondary text */
  --color-primary: #F8FAFC;     /* Light primary button in dark mode */
  --color-primary-fg: #090D16;
  --color-accent: #6366F1;      /* Electric Indigo */
  --color-accent-fg: #FFFFFF;
  --color-success: #34D399;     /* Emerald-400 */
  --color-warning: #FBBF24;     /* Amber-400 */
  --color-error: #F87171;       /* Rose-400 */
  --color-review: #A78BFA;      /* Violet-400 */
  --color-ring: #6366F1;
}

@theme inline {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-border: var(--color-border);
  --color-text: var(--color-text);
  --color-muted: var(--color-muted);
  --color-primary: var(--color-primary);
  --color-primary-fg: var(--color-primary-fg);
  --color-accent: var(--color-accent);
  --color-accent-fg: var(--color-accent-fg);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  --color-error: var(--color-error);
  --color-review: var(--color-review);
  --color-ring: var(--color-ring);
  --font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}
```
Dark mode: toggle the `dark` class on `<html>`; default follows `prefers-color-scheme`; user choice stored in `localStorage` (`theme`). Tailwind variant: `@custom-variant dark (&:where(.dark, .dark *));`
(If a Tailwind version mismatch occurs, map the same variables in `tailwind.config.js`; the tokens do not change.)

## Typography
Inter for UI, JetBrains Mono for timer and code. Use `@fontsource/inter` and `@fontsource/jetbrains-mono` (no CDN).
| Use | Class |
|---|---|
| Page title | text-2xl font-semibold tracking-tight |
| Section title | text-lg font-semibold |
| Body | text-sm / text-base, leading-relaxed |
| Muted/meta | text-xs text-muted |
| Big number (stats) | text-3xl font-semibold tabular-nums |

## Spacing, shape, elevation
4px grid (use 2, 3, 4, 6, 8). Radius 8px controls, 12px cards. Borders 1px `border-border`. Shadow: none by default, `shadow-sm` only on popovers/modals.

## Color usage
- Primary navy: sidebar active item, headings emphasis, primary buttons (light mode).
- Accent royal blue: links, focus ring, selected option, chart primary series.
- Success/Warning/Error: only for result states, validation, timer thresholds.
- Review violet: only for "marked for review".
- Difficulty badges: Easy = success tint, Medium = warning tint, Hard = error tint.
- Charts: series 1 accent, series 2 success, grid `border`, text `muted`.

## Do / Don't
Do use tokens everywhere. Don't use raw hex in components. Don't add gradients. Don't use more than one accent color per view.

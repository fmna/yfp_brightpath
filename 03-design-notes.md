# YFP (Your First Path): Design Notes

Visual direction for the prototype (UI). The workflow and screen logic are in `02-user-flow.md`.

---

## 1. Direction in one line

**Calm, organized and encouraging.** A clean white workspace on a soft green-tinted background. One brand green for progress and primary actions, and a warm orange used only for things that need attention today.

The product's job is to *reduce* overwhelm for someone who hasn't started yet, so the UI stays quiet. Color is reserved for meaning, not decoration.

---

## 2. How the references were used

| Reference | What was taken | What was deliberately not taken |
|---|---|---|
| **inspiration.png** (task board) | The three-column board for the employee dashboard. Cards with a **soft, column-tinted outline** and faint colored glow. Small pastel **tag chips** at the top of each card. Bold card title, short description, and date row with a calendar icon. Lots of white space. | The generic To Do / In Progress / Done model; YFP uses the brief's **Do today / Do later / Done**. The "+" add button on the employee board (employees don't create tasks). Drag and drop (completion is an explicit action). |
| **style.png** (MangoApps) | The **brand green** for primary buttons and progress. A **warm orange** accent (from the icon circles) for attention. White cards with a soft shadow on a light neutral background. A **geometric display face** for headings with a clean sans for body. Pastel circles for avatars and highlights. | Marketing-scale type, hero bands and logo strips. This is a work tool, not a landing page. |

---

## 3. Color

The prototype uses a **light theme only**, matching the light look of both references. It stays light even when the viewer's computer is set to dark mode. All colors are defined as CSS tokens. Neutrals carry a slight green bias so they feel related to the brand instead of default grey.

### Core

| Token | Light | Use |
|---|---|---|
| `--bg` | `#F4F6F3` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels, top bar |
| `--surface-2` | `#EEF2ED` | Table headers, tracks, subtle fills |
| `--ink` / `--ink-2` / `--ink-3` | `#17211B` / `#4B574F` / `#5F6B63` | Text: primary / secondary / captions |
| `--line` | `#DFE5DE` | Borders and dividers |
| `--brand` | `#2E7A48` | Primary buttons, progress bars and ring, "On track", "Done" |
| `--mango` | `#E07A16` | Attention: Do today column, "Due today/tomorrow", Pre-D1 tag |

### Meaning (semantic colors)

| Meaning | Color | Where |
|---|---|---|
| Done / On track | Green `--brand` on `--brand-soft #E5F2E8` | Done column, status pill, completion toast |
| Act soon | Orange `--mango-ink #8F4A07` on `--mango-soft #FDEFE0` | Do today column, due-soon dates |
| Overdue / Needs support | Red `--danger #B42318` on `--danger-soft #FCEBE9` | Overdue dates, Needs support pill, manager callout, at-risk progress bar |
| Locked / Post-D1 | Slate blue `#36608F` on `#E6EEF8` | Post-D1 tag, locked notice |
| Review | Lavender `#5E4AA8` on `#EEEAF9` | Review tag, Do later column tint |

**Rule:** red appears only when something is late. A manager scanning the page should be able to find every problem by looking for red alone.

---

## 4. Typography

| Role | Typeface | Weights | Notes |
|---|---|---|---|
| Display: headings, card titles, big numbers | **Lexend** | 500–700 | Geometric and friendly, close in spirit to the MangoApps headline face; designed for readability. |
| Body: UI text, tables, descriptions | **Figtree** | 400–700 | Warm, compact sans that stays readable at small table sizes. |

Both load from Google Fonts with system-font fallbacks.

**Scale:** page title 26px / section 18px / card title 16px / body 15px / meta 13–14px / tags 11.5px. Uppercase labels (e.g. "OVERALL PROGRESS") use 12px with +0.06em tracking. Numbers that line up use tabular figures.

---

## 5. Layout and spacing

- **Desktop-first** (per brief), 1200px max content width, centered. Layout stacks to one column below 980px so it still works on smaller laptops and in a narrow window.
- **8px spacing grid.** 24px gutters between board columns, 14px between cards, 20–28px between page sections.
- **Radius:** 8px (buttons, chips), 12px (cards, tiles), 16px (panels). Card styling is used only for real objects (task cards, summary panel, tables), not for every block.
- **Sticky top bar**, always visible, holding the brand, the demo date and the role switcher.

---

## 6. Components

| Component | Spec |
|---|---|
| **Role switcher** | Segmented pill in the top bar, labeled "View as". Each option shows avatar initials, name and role. The active option is a raised white segment. Present on every screen; one click swaps persona and lands on that persona's home. |
| **Task card** | White, 12px radius, 1.5px border tinted by column (orange / lavender / green) plus a faint matching glow, after inspiration.png. Contents in fixed order: tags → title → 2-line description → date row. The date row changes color by urgency. A "Just completed" tag appears after an action. |
| **Tags** | Timing: *Pre-D1* (orange) / *Post-D1* (slate blue). Type: *Action required* (neutral, outlined) / *Review* (lavender). Always shown in that order. |
| **Progress ring** | 84px, brand green on a light track, with the percentage in the center. Used once: the employee's overall progress. |
| **Progress bar** | 8px, rounded. Green normally; **red when the person needs support**. |
| **Status pill** | Dot + label: *On track* (green) / *Needs support* (red). |
| **Task Detail panel** | 480px right-side panel over a dimmed page. Header → content → a footer with one full-width primary action that stays in view. |
| **Resource link** | In Task Detail, directly under "How to complete it". Full-width card with a light green fill and green outline: link icon, bold link label (e.g. "Watch Welcome to BrightPath (12 min)"), then source system and address in small grey text, plus an external-link icon. It is the most prominent element after the primary action, so the place to *do* the task is never hunted for. **Locked state** (Post-D1 tasks before Day 1): grey fill and border, lock icon, "Link available on Mon, Nov 2". The real link label and address are hidden, and the card can't be clicked. |
| **Attention callout** | Soft red band naming the person, the overdue count and the oldest overdue task, with a secondary "Review plan" button. |
| **Catalog dialog** | Radio-card list (selected = green outline + tint). Unavailable items are dimmed and say why. The due date and buttons are in a fixed footer so they stay in view. |
| **Toast** | Dark, bottom-center, with an **Undo** link. Confirms what changed in plain words ("Your progress went from 18% to 27%"). |
| **Empty state** | Dashed outline box with a short bold line and one sentence of guidance. |

---

## 7. Motion

Minimal, per the brief. The only transitions are progress bars and the ring easing to their new value (0.3–0.4s), so the change in progress is visible. Everything else switches instantly. All transitions turn off under `prefers-reduced-motion`.

---

## 8. Voice and copy

- Written from the user's side: "Your first day is Monday, November 2", "Review Chris's plan", not system terms.
- Buttons say exactly what happens: **Mark as complete**, **Add to Alex's plan**, **Remove task**.
- Rules are stated under each column ("Overdue, due today or due tomorrow") so the sorting logic is never a mystery.
- Encouraging but not cute: "Nice work. These count toward your progress." No emoji.

---

## 9. Accessibility

- Text and tag colors meet WCAG AA contrast (4.5:1 or more) on their backgrounds. Lowest pairs: caption grey `#5F6B63` on `#EEF2ED` is 4.9:1, white on brand green is 5.3:1, and every tag is 5.6:1 or higher.
- Disabled buttons and locked links use dark grey text on a light grey fill (6.6:1) instead of faded color, so they read as unavailable but stay legible.
- State is never shown by color alone: every status pairs color with an icon and/or a word (✓ Done, ⚠ Overdue, 🔒 Locked).
- Full keyboard support: cards and rows are real buttons, visible focus ring, **Esc** closes panels and dialogs, focus moves into a panel when it opens and returns afterwards.
- Pop-up panels are marked as dialogs for screen readers; the role switcher reports which persona is selected; toasts are announced to screen readers.

---

## 10. Deployment

The app is plain HTML, CSS and JavaScript with no build step and no dependencies besides Google Fonts. Everything that gets deployed lives in the `public/` folder; the planning docs are not published. Deployment steps, settings and post-deploy checks are in `05-build-spec.md` §11.

# YFP (Your First Path): Build Specification

Companion to `01-pm-brief.md` (what and why), `02-user-flow.md` (screens, states, rules), `03-design-notes.md` (visual direction) and `04-mock-data.js` (data, rules, expected values). This doc covers **how the app is built**: tech stack, folder structure, data and state, rules, routing, components, implementation notes, testing and deployment.

If anything here conflicts with the PM Brief, the PM Brief wins.

---

## 1. Build goals and constraints

The build has one job: make the **primary demo workflow** reliable and easy to follow.

> Employee views dashboard → completes a task → progress updates → switch to manager → manager dashboard shows the update.

| Constraint (from the brief and assignment) | What it means for the build |
|---|---|
| Frontend only, browser based | Static files only. No server code, no serverless functions. |
| Powered by mock data | All data comes from `04-mock-data.js`. Changes live in memory and in `localStorage`. |
| No backend, database, external APIs or authentication | No `fetch` calls. The only outside requests are the Google Fonts stylesheet and font files. The role switcher replaces login. |
| Desktop and laptop browsers | Designed for 1200px content width. Usable down to about 980px, then stacks to one column. No mobile-specific layouts. |
| Easily deployable via Vercel with minimal configuration | No build step and no dependencies, so Vercel serves the `public/` folder as is. |
| Out of scope | Native mobile, templates, real auth, real data, APIs, backend, database, analytics, AI features (including Vercel Analytics and Speed Insights). |

**Assignment fit.** The assignment says to "build a web app that runs in the browser, using any language or framework," says mock data is fine, says no logins, database or backend are needed, and calls a simple role switcher fine. This build meets all of these. The assignment calls a native mobile app "a nice bonus, not an expectation." The brief deliberately leaves it out, so it's a scope decision, not something missing.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Markup | One `index.html` page shell | The single page the app renders into. Vercel serves it at `/`. |
| Styling | Plain CSS with custom-property design tokens (`src/app.css`) | Tokens come straight from `03-design-notes.md` §3. No preprocessor needed. |
| Logic | Plain JavaScript (ES2017+), loaded as **classic `defer` scripts** under a single `window.YFP` namespace | No framework, no compile step. See the note on modules below. |
| Data and rules | `04-mock-data.js` (UMD: works in the browser and in Node) | The **single source of truth** for data **and** business rules (§5). |
| Fonts | Lexend (display) and Figtree (body) from Google Fonts, with system fallbacks | Per `03-design-notes.md` §4. If fonts fail to load, the app still works. |
| Icons | Inline SVG strings (`src/ui/icons.js`) | No icon library or extra requests. |
| Routing | URL hash (`#home`, `#team-chris`, …) | Works on any static host with no rewrites. The back button and deep links work. |
| Persistence | `localStorage` key `yfp-demo-v2` | Survives reloads. Falls back to memory if storage is blocked. |
| Tests | `node public/04-mock-data.js` self-check, plus one Node script with no dependencies | Runs anywhere Node is installed. Nothing to install. |
| Hosting | Vercel, static ("Other" framework preset) | Zero build, zero config. |

**Why classic scripts instead of ES modules.** Browsers block ES modules when a page is opened straight from disk (`file://`). Classic `defer` scripts run in the order they're listed and work both ways: double-clicking `index.html` and on Vercel. That keeps the demo working offline, and it's how the current prototype already runs. Each file wraps itself in an IIFE and attaches its exports to `window.YFP`.

**Why not React or Vite.** The prototype already proves the workflow without a framework. A framework would add a build step, npm dependencies and a rewrite without adding user value. If YFP moves past MVP (real data, more screens, a team of engineers), the natural next step is Vite + React + TypeScript. The rules in `04-mock-data.js` are framework-agnostic, so they would carry over unchanged.

**Browser support.** Current desktop versions of Chrome, Edge, Safari and Firefox. The JavaScript is ES5 syntax plus `URLSearchParams`, `closest()` and `padStart`, so it runs well below that. The CSS degrades gracefully: the softer card and link tints use `color-mix()` inside `@supports` (plain borders below Safari 16.2 / Firefox 113), and the selected catalog item uses a class rather than `:has()`. Nothing else used is newer than Safari 15.4 or Firefox 92 (`accent-color`, `:focus-visible`), and both of those are cosmetic if missing. Chrome and Edge are tested automatically (§10.1); Safari and Firefox are covered by this audit and the `polish` suite's older-engine CSS check, not by an automated run.

---

## 3. Folder structure

The repository separates planning docs from the deployed app. Everything Vercel serves lives in `public/`. When a project has no build step and a `public/` folder exists, Vercel serves only that folder by default, so the docs are never published. They stay visible in the GitHub repository.

```
yfp-brightpath/                 GitHub repo root (reviewers see everything here)
├── README.md                   What YFP is, how to run locally, how to deploy, links to docs/
├── CLAUDE.md                   Claude Code instructions (reading list points to docs/ and public/)
├── docs/                       Not deployed
│   ├── 01-pm-brief.md
│   ├── 02-user-flow.md
│   ├── 03-design-notes.md
│   ├── 05-build-spec.md
│   └── references/
│       ├── inspiration.png
│       └── style.png
├── public/                     The only folder Vercel serves
│   ├── index.html              Page shell (detailed below)
│   ├── 04-mock-data.js         Lives here because the app loads it at runtime; keeps its number to match the docs
│   └── src/                    (detailed below)
└── tests/
    ├── check-single-source.js  Fails if rule logic is redefined outside 04-mock-data.js (§5.4)
    └── browser/                Headless browser suites, no dependencies (§10.1)
```

The original single-file prototype isn't kept as a separate copy. Commit it as-is first, then restructure in the next commit, so git history preserves it.

Inside `public/`:

```
public/
├── index.html                 Page shell: <head>, font links, #app root, script tags in load order
├── 04-mock-data.js            Data + rules + expected values + fixtures (single source of truth)
├── src/
│   ├── app.css                Tokens, base styles, components, layout, reduced-motion
│   ├── core/
│   │   ├── dates.js           Display formatting only: fmt(), fmtLong(), relative text ("Due tomorrow")
│   │   ├── store.js           Store, load/save, mutations, undo, reset, UI state
│   │   └── router.js          Hash parsing, go(), route table, not-found
│   ├── ui/
│   │   ├── icons.js           SVG path map + icon(name, size)
│   │   ├── html.js            esc() and small HTML helpers
│   │   └── components.js      Tags, task card, ring, progress bar, status pill, avatar, toast, empty state
│   ├── views/
│   │   ├── topbar.js          Brand, demo date, role switcher, Reset demo
│   │   ├── employee-home.js   Employee Dashboard (#home)
│   │   ├── task-panel.js      Task Detail side panel (#task-…)
│   │   ├── manager-team.js    Manager Dashboard (#team)
│   │   ├── employee-detail.js Employee Detail (#team-…)
│   │   ├── add-task-dialog.js Catalog dialog
│   │   └── not-found.js       Not-found and "data didn't load" screens
│   └── main.js                render(), event delegation, focus management, boot
```

**Script load order in `index.html`** (all `defer`, so they run in this order after the HTML is parsed):

```html
<script defer src="04-mock-data.js"></script>
<script defer src="src/ui/html.js"></script>
<script defer src="src/ui/icons.js"></script>
<script defer src="src/core/dates.js"></script>
<script defer src="src/core/store.js"></script>
<script defer src="src/core/router.js"></script>
<script defer src="src/ui/components.js"></script>
<script defer src="src/views/topbar.js"></script>
<script defer src="src/views/employee-home.js"></script>
<script defer src="src/views/task-panel.js"></script>
<script defer src="src/views/manager-team.js"></script>
<script defer src="src/views/employee-detail.js"></script>
<script defer src="src/views/add-task-dialog.js"></script>
<script defer src="src/views/not-found.js"></script>
<script defer src="src/main.js"></script>
```

**What each layer may do:**

| Layer | May | May not |
|---|---|---|
| `04-mock-data.js` | Hold data, rules and expected values. Run in Node. | Touch the DOM, `localStorage` or `window.location`. |
| `core/` | Read and change the store. Read the URL. | Build HTML. Decide statuses, buckets or progress itself. |
| `ui/` and `views/` | Turn store + rule results into HTML strings. | Change the store directly (they emit `data-action`s instead). Re-implement any rule. |
| `main.js` | Wire events to store mutations and call `render()`. | Hold business rules. |

---

## 4. Data model

All of this already exists in `04-mock-data.js`. The build reads it through `window.YFP_MOCK_DATA` (aliased as `MOCK`).

| Export | Shape | Used for |
|---|---|---|
| `demo` | `{ today: "2026-10-30", storageKey, undoSeconds: 7, routes, switchablePersonas, … }` | Fixed demo date, storage key, toast timing. |
| `people` | `{ [id]: { id, name, first, initials, kind, role, dept, start?, managerId?, directReports? } }` | Names, roles, start dates, avatar initials. |
| `employeeOrder` | `["alex", "brooke", "chris"]` | The manager's direct reports. |
| `assigners` | `{ hr: { label, short }, morgan: { label, short } }` | "Assigned by" text in the task panel and the "Added by" column. |
| `taskDefs` | `{ [defId]: { title, timing: "pre"\|"post", type: "ar"\|"review", source: "hr"\|"cat", offset?, desc, steps[], link: { label, url, src } } }` | What a task *is*. Shared by every employee who has it. |
| `catalog` | 10 `defId`s in dialog order | The Add task dialog. |
| `seed()` | Returns a **fresh** store: `{ alex, brooke, chris }`, each `{ id, name, first, initials, role, dept, start, tasks: Assignment[] }` | Starting state and Reset demo. |
| `expected`, `demoScript`, `emptyStates`, `errorScenarios`, `fixtures` | See file | Tests, demo rehearsal, state checks. |
| `toasts` | `{ completed, reopened, added, removed, prototypeLink, reset }` templates | Toast copy for store mutations. The self-check fills them and compares with `expected`. |
| `helpers` | Rule functions (§5) | **Every** rule decision in the app. |

**Assignment** (one task in one employee's plan):

```js
{ def: "i9", due: "2026-10-30", done: false, doneOn: null,
  addedBy: "hr" | "morgan", justNow: false, isNew: false }
```

- A task's ID in URLs and the DOM is `{employeeId}-{defId}` (e.g. `alex-i9`). An employee can't have the same `defId` twice, so this ID is unique.
- Dates are ISO strings (`YYYY-MM-DD`) everywhere and are compared as strings. Parse them into local `Date` objects only for display. Never use `new Date("2026-10-30")`, which parses as UTC and can show the wrong day in US time zones.
- `justNow` marks the most recent completion this session (drives "Just completed" and the manager's "Just now"). `isNew` marks a task the manager just added (drives "Just added").

---

## 5. Business rules: single source of truth

### 5.1 The problem this solved

The original single-file prototype loaded all of its **data** from `04-mock-data.js`, but defined its own copies of the **rules**: `t()`, `started()`, `status()`, `buckets()`, `stats()` and the team sort. The self-check tested the copies in `04-mock-data.js`, not the ones the app ran, so an edit to one copy only would have made the app and the self-check silently disagree. **Resolved:** the app now calls `MOCK.helpers` for every rule, and `tests/check-single-source.js` fails the build if a copy reappears.

### 5.2 The requirement

**Every rule decision in the app comes from `MOCK.helpers`.** No file under `src/` or inline in `index.html` may compute task status, buckets, progress, needs-support status, stage, team order, catalog availability, default due dates or removability on its own.

`src/` may only add **presentation**: wording ("Due tomorrow", "Overdue by 2 days", "3 days ago"), date formatting, icons and CSS classes. These are built *from* rule outputs, never instead of them.

### 5.3 Helper API to put in `04-mock-data.js`

The current helpers return IDs and assume the demo date. Extend them so the app can use them directly. Every function takes `today` as an optional last argument (default `DEMO.today`), so the self-check, fixtures and app all run the same code.

| Helper | Returns | Notes |
|---|---|---|
| `makeTask(defId, due, doneOn?, addedBy?)` | Assignment | Today's internal `t()`, exported. The app uses this when adding a task. |
| `isStarted(emp, today)` | boolean | `today >= emp.start` |
| `status(emp, task, today)` | `"done" \| "locked" \| "overdue" \| "today" \| "later"` | Already exists. `"today"` covers due today **and** due tomorrow. |
| `buckets(emp, today)` | `{ today: Task[], later: Task[], locked: Task[], done: Task[] }` | **Change:** return task objects, each list sorted by due date. Overdue goes in `today`. The self-check maps to `def` before comparing. |
| `stats(emp, today)` | `{ done, total, pct, pre, preDone, post, postDone, overdue, oldestOverdue, nextUp, status, stage, needsSupport, next, overdueTasks }` | Keep the existing scalar keys (the self-check compares them). **Add** `needsSupport` (boolean), `next` (task object or `null`) and `overdueTasks` (task objects, oldest first). |
| `stage(emp, today)` | `{ label: "Starts Mon, Nov 2" \| "Day 5", daysToStart, workday }` | Moves the stage rule out of the app. The view adds the sub-line text. |
| `teamOrder(store, today)` | `employeeId[]` | Needs support first, then by start date. Today this lives in both `selfCheck` and the app. |
| `teamAverage(store, today)` | number | Already exists. |
| `startingNext(store, today)` | `{ employee, preD1Left } \| null` | Earliest-starting employee who hasn't started yet. |
| `catalogFor(emp, today)` | `{ available: defId[], unavailable: { [defId]: "already" \| "preAfterStart" } }` | Already exists. The view turns reasons into copy. |
| `defaultDue(emp, defId, today)` | ISO date | **Already added.** Start date + the item's `offset`. If that has passed, demo date + 2 days, so a newly added task never starts in the past. Only sets the pre-filled date in the Add task dialog; bucket rules are unaffected. |
| `canRemove(emp, task)` | `{ ok: boolean, reason?: "hrRequired" \| "completed" }` | Based on `taskDefs[def].source === "hr"`, not `addedBy`. See open question 2. |
| `lastActivity(emp, today)` | `{ kind: "justNow" \| "completed" \| "none", task, daysAgo }` | The view writes "Just now", "Yesterday", etc. |
| `validateStore(obj)` | boolean | True if every employee in `employeeOrder` is present, every task's `def` exists in `taskDefs`, and there are no duplicates. Used when loading from `localStorage`. |
| `findTask(emp, defId)`, `byDue(a, b)` | Task or `null`; sort comparator | Lookup and due-date ordering, so views don't re-implement them. |
| `addDays`, `diffDays`, `workdaysSince`, `parseDate` | date utilities | Exported so `src/core/dates.js` doesn't redefine them. `parseDate` parses ISO strings as local dates. |
| `fill(template, values)` | string | Fills `{name}` placeholders in copy. `src/ui/html.js` re-exports it. |

`selfCheck()` keeps its current checks and switches to the new helpers where they replace inline logic (team order, starting next, default due).

### 5.4 How it's enforced

1. **One code path.** The app calls `MOCK.helpers` and has nothing of its own to drift.
2. **Self-check on load.** `main.js` runs `MOCK.helpers.selfCheck()` once at boot. If it fails, it logs `console.warn("YFP self-check failed …")` with the failing lines. Nothing is shown to users.
3. **Static check.** `node tests/check-single-source.js` scans `index.html` and `src/**/*.js` and fails if it finds a definition of any rule name (`status`, `buckets`, `stats`, `started`, `isStarted`, `teamOrder`, `teamAverage`, `catalogFor`, `defaultDue`, `canRemove`, `makeTask`, `t`, plus `stage`, `lastActivity`, `startingNext`, `validateStore`, `byDue`) as a function declaration, variable, assignment or object method outside `04-mock-data.js`. About 50 lines, no dependencies.

### 5.5 Rule reference

The rules themselves are unchanged from `02-user-flow.md` §6 and `04-mock-data.js` `RULES`.

| Rule | Definition |
|---|---|
| Do today | Not done, unlocked, and overdue, due today or due tomorrow |
| Do later | Not done and due after tomorrow; locked Post-D1 tasks grouped at the bottom |
| Done | Completed |
| Sort | Each bucket by nearest due date |
| Locked | Post-D1 task while the demo date is before the employee's start date. Locked tasks are **visible and readable but can't be acted on**. |
| Progress | Completed ÷ all assigned (locked included), `Math.round` |
| Needs support | One or more unlocked tasks past due. Otherwise On track. |
| Stage | "Starts {date}" before Day 1; "Day N" (working days since start, inclusive) after |
| Manager edits | Catalog only; HR-required tasks can't be removed; completed tasks can't be removed; no duplicates; no Pre-D1 tasks after start; due date ≥ demo date |

---

## 6. State management

### 6.1 Two kinds of state

| State | Lives in | Persisted | Contents |
|---|---|---|---|
| **Store** (domain) | `YFP.store.data` | Yes, in `localStorage[demo.storageKey]` | `{ alex, brooke, chris }` with their tasks, as produced by `seed()` |
| **UI state** | `YFP.store.ui` | No | `{ confirmRemove: taskId \| null, addOpen: bool, pick: defId \| null, due: ISO, toast: { msg, undo } \| null }` |
| **Route** | `location.hash` | In the URL | Which screen, persona, task or employee |

There is **no cached derived state**. Progress, buckets, status and team averages are recomputed from the store on every render through `MOCK.helpers`. That's what makes the manager view update immediately. Both views read the same object, so there is nothing to sync.

### 6.2 Load and save

```text
boot
 ├─ try localStorage.getItem(key)
 │   ├─ valid JSON and helpers.validateStore(parsed) → use it
 │   └─ missing / invalid JSON / fails validation     → MOCK.seed()   (silently)
 └─ localStorage throws (private window, blocked)     → MOCK.seed(), in-memory only
save(): try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* ignore */ }
```

If the stored data's shape ever changes, bump `demo.storageKey` (e.g. `yfp-demo-v3`) so old saved data is ignored instead of crashing the app.

### 6.3 Mutations

All changes go through these functions in `store.js`. Each one changes `data`, calls `save()`, sets a toast if needed, and then `main.js` calls `render()`. Views never change the store.

| Mutation | Effect | Toast (with Undo for 7s where noted) |
|---|---|---|
| `completeTask(taskId)` | `done = true`, `doneOn = today`, clears `justNow` on all tasks, sets `justNow` on this one | "Task completed. Your progress went from 18% to 27%." **Undo** |
| `reopenTask(taskId)` | `done = false`, `doneOn = null`, `justNow = false`. Lets the employee correct a task marked done by mistake, after the Undo toast is gone. | "Marked as not done." |
| `addTask(empId, defId, due)` | Checks `catalogFor`, clamps `due` to ≥ today, pushes `makeTask(defId, due, null, "morgan")` with `isNew = true` | "Added “Review the org chart” to Alex’s plan." |
| `removeTask(taskId)` | Checks `canRemove`, removes it, remembers its index | "Removed “Review the org chart” from Alex’s plan." **Undo** (puts it back at the same index) |
| `undo()` | Runs the undo function stored with the current toast, then clears the toast | none |
| `reset()` | `data = MOCK.seed()`, clear UI state, save | "Demo data reset to the starting state." |

**Toast rules.** Only one toast at a time. A new toast replaces the old one and resets the 7-second timer (`demo.undoSeconds`). The toast clears when the screen changes, except right after Reset. Undo is held in memory only, so it doesn't survive a reload.

**Flag rules.** `justNow` stays until another task is completed or the demo is reset, so the manager still sees "Just now" after switching views. `isNew` clears when the manager leaves the Employee Detail screen.

### 6.4 Render loop

```text
event (click / change / keydown / hashchange)
  → store mutation or ui change or go(hash)
  → render():
      route = router.parse(location.hash)
      html  = topbar(route) + view(route, store, ui) + toast(ui)
      #app.innerHTML = html
      restore focus (§9.3)
```

Full re-render on every change is fine at this size (3 employees, ≤ 15 tasks each). It keeps one code path and avoids stale DOM.

---

## 7. Routing

| Hash | Persona | Screen | Notes |
|---|---|---|---|
| `""` or `#home` | Alex | Employee Dashboard | Default landing |
| `#task-alex-{defId}` | Alex | Employee Dashboard + Task Detail panel | Unknown task → "This task isn’t in your plan" panel |
| `#team` | Morgan | Manager Dashboard | |
| `#team-{employeeId}` | Morgan | Employee Detail | Unknown employee → not-found |
| anything else | none | Not-found screen | "We couldn’t find that page" with a button to Alex's dashboard |

- The role switcher calls `go("home")` or `go("team")`.
- `go(hash)` sets `location.hash`, or calls `render()` directly if the hash is already the same.
- `document.title` is "Alex · YFP Onboarding Prototype" or "Manager · YFP Onboarding Prototype".
- Opening the panel or dialog doesn't scroll the page. Changing screens scrolls to the top.

---

## 8. Components

Visual specs are in `03-design-notes.md` §6. This table covers inputs and behavior.

| Component | File | Inputs | States | Accessibility |
|---|---|---|---|---|
| Top bar | `views/topbar.js` | route | Persona active; not-found (no active persona) | Sticky. Switcher is a `group` with `aria-pressed` per option. |
| Role switcher | `views/topbar.js` | active persona | Alex / Morgan | One click, no login. Lands on that persona's home. |
| Tags | `ui/components.js` | `defId` | Pre-D1 / Post-D1, then Action required / Review, always in that order | Text labels, not color alone |
| Task card | `ui/components.js` | emp, task | Do today / Do later / Done / Locked; "Just completed" | Whole card is a `<button>`. Due line pairs icon + words. |
| Progress ring | `ui/components.js` | pct | 0–100 | `role="img"` with "{pct}% complete" |
| Progress bar | `ui/components.js` | pct, needsSupport | Green / red | Percentage also shown as text |
| Status pill | `ui/components.js` | needsSupport | On track / Needs support | Dot + word |
| Avatar | `ui/components.js` | person | Per-persona pastel | `aria-hidden` (the name is next to it) |
| Task Detail panel | `views/task-panel.js` | emp, task | Open / Overdue / Locked / Done / Removed | `role="dialog"`, `aria-modal`, focus on title, Esc closes, focus returns to the opener |
| Resource link | `views/task-panel.js` | `taskDefs[def].link`, locked? | Active (toast "Prototype link. In the live product this opens …") / Locked (grey, label and URL hidden, "Link available on Mon, Nov 2") | Locked state is not focusable |
| Attention callout | `views/manager-team.js` | stats | One per person needing support | Icon + bold name + overdue count + oldest overdue task |
| Progress table | `views/manager-team.js` | `teamOrder` | Rows sorted by rule; "Just now" in green | Rows are buttons. Header cells use `scope`. |
| Plan table | `views/employee-detail.js` | emp | Pre-D1 / Post-D1 groups; inline remove confirmation row | "Required by HR" marker with tooltip in place of a trash icon |
| Catalog dialog | `views/add-task-dialog.js` | emp, `catalogFor`, ui.pick | Available first; unavailable dimmed with reason; exhausted empty state | `radiogroup`, Esc closes, focus on title, due-date `min` = demo date |
| Toast | `ui/components.js` | ui.toast | With / without Undo | `role="status"` (announced). Undo and Dismiss buttons. |
| Empty state | `ui/components.js` | title, body | Copy from `MOCK.emptyStates` | Plain text in a dashed box |

**Copy source.** Empty states, error screens, toasts and notices use the strings in `MOCK.emptyStates` and `MOCK.errorScenarios` so copy has one source. Fill `{first}`, `{n}` and `{startDate}` placeholders with a small `fill(template, values)` helper in `ui/html.js`.

---

## 9. Implementation notes

### 9.1 Screens

| Screen | Content, top to bottom | Rule helpers used |
|---|---|---|
| Employee Dashboard | Greeting + Day 1 line → summary (ring, Pre-D1/Post-D1 meters, Next up) → board (Do today · Do later · Done, each with count and one-line rule; locked tasks under "Unlocks on Day 1 · Mon, Nov 2") | `stats`, `buckets`, `stage`, `isStarted` |
| Task Detail | Tags → title → notice (overdue / locked) → due, assigned by, type → About → How to complete it (resource link, then numbered steps) → footer with one primary action | `status`, `isStarted` |
| Manager Dashboard | Heading → tiles (Need support, Average progress, Starting next) → attention callouts → progress table | `teamOrder`, `teamAverage`, `startingNext`, `stats`, `stage`, `lastActivity` |
| Employee Detail | Breadcrumb → header (identity, stage, status, progress, overdue count, Add task) → plan table grouped Pre-D1 / Post-D1 | `stats`, `stage`, `status`, `canRemove` |
| Add task dialog | Catalog list → fixed footer (due date, Cancel, "Add to {first}’s plan") | `catalogFor`, `defaultDue` |

The bucket order on the board is **Do today, Do later, Done**, matching the brief.

### 9.2 Rendering and events

- Views are functions that return HTML strings. Every value from data is passed through `esc()` when it's put into HTML, including titles inside toasts.
- One delegated `click` listener, one `change` listener and one `keydown` listener sit on `document`. Elements declare intent with `data-action` (e.g. `complete`, `open-task`, `remove-confirm`) plus `data-id`, `data-emp` and similar attributes.
- Actions in use: `role`, `open-task`, `close-drawer`, `complete`, `reopen`, `open-hire`, `back-team`, `go`, `remove-ask`, `remove-cancel`, `remove-confirm`, `add-open`, `add-close`, `add-submit`, `demo-link`, `reset`, `toast-undo`, `toast-close`.
- Resource links never navigate. They show the prototype-link toast.

### 9.3 Focus management

Because every render replaces the DOM, focus is restored by key. Focusable elements carry `data-fkey`. After each render:

1. Panel or dialog just opened → focus its title.
2. Panel just closed → focus the element that opened it (fallback: Next up button).
3. Inline remove confirmation opened → focus "Remove task". Cancelled → focus that row's trash button.
4. Otherwise → focus whatever had the same `data-fkey` before the render.

### 9.4 Dates

- The app never reads the real clock. "Today" is always `MOCK.demo.today`.
- Format with `toLocaleDateString("en-US", …)`: short form "Mon, Nov 2" and long form "Monday, November 2".
- The top bar shows "Demo date: Fri, Oct 30, 2026" so viewers understand why dates are fixed.

### 9.5 Styling

- Tokens from `03-design-notes.md` §3 on `:root`. Light theme only, set with `color-scheme: light`.
- Content max width 1200px. Layout stacks to one column below 980px.
- Motion: only the progress ring and bars ease to their new value (0.3–0.4s). Everything is disabled under `prefers-reduced-motion`.
- Numbers that line up use `font-variant-numeric: tabular-nums`.

### 9.6 Failure handling

| Failure | Behavior |
|---|---|
| `04-mock-data.js` missing or failed to load | `#app` shows "Demo data didn’t load" with instructions to keep the file next to `index.html`. |
| Saved data is corrupt or the wrong shape | Ignored silently; the seed loads. |
| `localStorage` unavailable | Runs from memory; changes last until reload. |
| Google Fonts blocked | System fonts; layout unchanged. |
| Unknown hash | Not-found screen. |

### 9.7 Moving from the prototype to this structure

**Status: done.** All six steps below are complete; `public/index.html` now holds only the page shell and script tags.

Do it in small steps and run the demo script (§10.2) after each one so the demo always works:

0. Commit the current prototype as-is. Then move files into the §3 layout: docs and reference images into `docs/`, `index.html` and `04-mock-data.js` into `public/`. Create `README.md` (what YFP is, how to run locally, how to run the checks, how to deploy, links to `docs/`). Update the reading list and check commands in `CLAUDE.md`, and any file paths mentioned in the docs. Open `public/index.html` to confirm it still loads, and run `node public/04-mock-data.js`.
1. Add the remaining helper API (§5.3) to `04-mock-data.js` and update `selfCheck`. Run `node public/04-mock-data.js`.
2. Move the CSS from `index.html` into `src/app.css`.
3. Point the inline script at `MOCK.helpers` and delete its local rule functions. Run `node tests/check-single-source.js`.
4. Split the inline script into the `src/` files in §3, one layer at a time (ui → core → views → main).
5. Confirm `index.html` only holds the shell and script tags.

---

## 10. Testing

### 10.1 Automated (no install)

| Command | Checks |
|---|---|
| `node public/04-mock-data.js` | Data integrity, default due dates, every persona's expected numbers, the demo script steps (complete → add → remove), fixtures. Exit code 0 means pass. |
| `node tests/check-single-source.js` | No rule logic redefined outside `04-mock-data.js` (§5.4). |

Both must pass before each deploy.

**Browser suites** (`tests/browser/`, optional, no dependencies): `node tests/browser/run.mjs [--browser=edge]` drives the real app in headless Chrome or Edge over the DevTools protocol. Four suites: `employee` (§10.2 steps 1–2), `manager` (steps 3–9), `edge-cases` (§10.3 and §9.6, including storage blocked, corrupt data, the fixture hook and its notice on a non-local host, and a missing data file) and `polish` (§10.4 keyboard-only run, widths, 200% zoom, reduced motion, light-only theme, and an older-engine CSS check).

### 10.2 Demo script run-through

Start from **Reset demo**. Expected values come from `MOCK.expected`.

| # | Action | Expect |
|---|---|---|
| 1 | Open `#home` | Alex 18%, 2 of 11; Pre-D1 2/6, "3 days left"; Next up "Complete I-9 and tax forms"; Do today: I-9, direct deposit; 5 locked |
| 2 | Open task → Mark as complete | Panel closes; card in Done with "Just completed"; ring 27%; toast "…from 18% to 27%." with Undo; Next up becomes direct deposit |
| 3 | View as Morgan | `#team`; Alex 27%, "Just now"; average 50%; Chris needs support (2 overdue); row order Chris, Brooke, Alex |
| 4 | Review Chris's plan | `#team-chris`; Pre-D1 6/6; security training and buddy chat overdue |
| 5 | Alex row → Add task → "Review the org chart" | Due pre-filled Sun, Nov 1; Alex 25% (3/12); average 49%; "Just added" tag |
| 6 | View as Alex | Org chart task in Do later |
| 7 | Morgan → remove the org chart task → confirm → Undo | Removed (27%, avg 50%), then restored |
| 8 | Reload the page | State is kept |
| 9 | Reset demo | Back to step 1 values |

### 10.3 States checklist

Use the fixtures in `04-mock-data.js` to check every state in `02-user-flow.md` §5.5. To load one in the browser, open the app with `?fixture={name}` (e.g. `index.html?fixture=alexAllCaughtUp`).

The hook works on any host, including the deployed Vercel site, so reviewers can open these states from the link alone. Two rules:
- **Never saved.** Fixture state lives in memory only. `save()` is a no-op while a fixture is loaded, so opening the URL without the parameter returns to the normal saved state, and the reviewer's saved demo is never overwritten. Unknown names are ignored.
- **Always labeled.** While a fixture is loaded, a slim neutral notice sits under the top bar: "Showing a sample state: {label}. Changes aren't saved." with a **Back to the demo** link to the page without the query string. Each fixture's `label` and the notice copy (`MOCK.fixtureNotice`) live in `04-mock-data.js`.

Implementation: `loadFixture()` in `store.js` at boot (read `URLSearchParams`, call `MOCK.fixtures[name].build()`, set a `fixtureMode` flag); the notice is rendered by `views/topbar.js`.

| State | How to see it |
|---|---|
| All caught up, Do today empty | `?fixture=alexAllCaughtUp` |
| Done column empty | `?fixture=alexFreshStart` |
| Overdue task, Alex needs support | `?fixture=alexOverdue`, then `#task-alex-i9` |
| Task removed while open | `?fixture=alexTaskRemoved`, then `#task-alex-photo` |
| Catalog exhausted | `?fixture=alexCatalogExhausted`, then `#team-alex` → Add task |
| Nothing addable (some items blocked as Pre-D1 after the start date) | `?fixture=chrisCatalogExhausted`, then `#team-chris` → Add task |
| Locked task | `#task-alex-orientation` |
| Catalog item unavailable | `#team-alex` and `#team-chris` → Add task |
| Corrupt storage | Put `MOCK.fixtures.corruptStorage.raw` into `localStorage` under `yfp-demo-v2` and reload |
| Unknown page | `#settings`, `#team-dana`, `#task-alex-nope` |

### 10.4 Accessibility and browser pass

- Keyboard only: complete the demo script with Tab, Enter, Space and Esc.
- Visible focus ring on every control.
- Check at 1440px, 1280px and 1024px wide, and at 200% browser zoom.
- Current Chrome, Edge, Safari and Firefox on desktop.

---

## 11. Deployment (Vercel)

The app is a static folder (`public/`) with no build step. With the "Other" framework preset and no build command, Vercel serves `public/` by default when it exists, so **no `vercel.json` or `.vercelignore` is needed**. Only the app is published; the planning docs stay in the GitHub repository.

**Option A: Git (recommended)**
1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset: **Other**. Leave Build Command and Install Command empty. Leave Output Directory at its default (Vercel uses `public/`). If the dashboard shows a different value, set it to `public`. **Don't** turn on the Output Directory override and leave it empty: an empty override serves the whole repository, docs included.
4. Deploy. Every push to the main branch redeploys.

**Option B: CLI**
1. `npx vercel` in the repository root and accept the defaults.
2. `npx vercel --prod` to publish.

**After deploying:**
- Open `/` and confirm the app loads.
- Open `/01-pm-brief.md` and `/docs/01-pm-brief.md` and confirm both return **404**, so the docs aren't public. If either loads, set Output Directory to `public` in Project Settings and redeploy.
- Open `/#team-chris` directly to confirm deep links work. Hash routes need no rewrites.
- Open `/?fixture=alexOverdue` and confirm it loads, shows the notice, and the plain URL still shows your saved demo.
- Click **Reset demo** before presenting, because each browser keeps its own saved state.
- Leave Vercel Analytics and Speed Insights off (analytics are out of scope).

**Running locally.** Double-click `public/index.html`, or run `npx serve public` and open the address it prints. The `?fixture=` hook works the same locally as on the deployed site.

---

## 12. Decisions and open questions

### Settled

| Decision | Source |
|---|---|
| Bucket order is Do today, Do later, Done | `01-pm-brief.md`, Employee Workflow |
| Locked Post-D1 tasks are visible and readable but can't be acted on until Day 1 | Brief, Access Assumptions ("access" = act on); `02-user-flow.md` §7 |
| `04-mock-data.js` is the single source for data **and** rules | This spec, §5 |
| Plain HTML, CSS and JavaScript; no framework or build step | This spec, §2 |
| Managers add only from the catalog; no custom tasks or templates | Brief, Stakeholder Assumptions; `02-user-flow.md` §6 |
| Default due date when the catalog offset has passed: demo date + 2 days; fixtures call `defaultDue()` | Prototype behavior, confirmed |
| A task is non-removable when its definition has `source === "hr"` (not `addedBy`), or when it's completed | `canRemove()`; matches the "HR-required tasks" rule |
| `?fixture=` works on any host, including the deployed site, so reviewers can see every state from the link; it shows a sample-state notice and never saves | §10.3 |
| "Mark as not done" is kept: it supports "update task status" in the brief | `01-pm-brief.md`, Employee Workflow |
| Planning docs are not deployed; Vercel serves only `public/` | §11 |
| Unknown task IDs (`#task-alex-nope`) show not-found; a real task that isn't in Alex's plan shows "This task isn't in your plan" | Reconciles `errorScenarios.unknownRoute` with §7 |
| After removing a task, focus moves to the toast's Undo; when the toast closes, focus moves to `<main>` | §9.3 |
| "Day 1" in sentences and labels; "D1" only in tags (Pre-D1, Post-D1) | `03-design-notes.md` §8 |

### Open

None at the moment.

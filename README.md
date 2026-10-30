# YFP (Your First Path)

A browser-based onboarding prototype for BrightPath Technologies. New hires see every onboarding task in one place, sorted into **Do today · Do later · Done**, and can tell what's due before Day 1 from what comes after. Their hiring manager sees progress across direct reports, spots who needs support, and adds or removes tasks.

**Live demo:** https://YOUR-APP.vercel.app 

**Demo video:** [LINK] 

**Repository:** https://github.com/fmna/yfp_brightpath

<!-- Before submitting: find-and-replace https://YOUR-APP.vercel.app with the real Vercel URL, and fill in the video link. -->

---

## At a glance

| | |
|---|---|
| **Primary user** | A new hire in the days before and after Day 1 (persona: Alex Anderson, Associate Product Manager, starts Mon, Nov 2) |
| **Problem** | Onboarding tasks are spread across emails, docs, spreadsheets and HR messages, so new hires miss steps and managers can't tell whether onboarding is on track |
| **The one workflow** | New hire completes a task → their progress updates → manager's dashboard shows the update right away |
| **Secondary user** | The hiring manager (persona: Morgan Miller), who monitors progress, spots who needs support and adjusts individual plans |
| **Left out** | Templates, custom tasks, notifications, login, a backend, analytics, mobile and AI (see [What I left out](#what-i-left-out-and-why)) |
| **Stakeholder call** | New-hire experience first; managers get lightweight add/remove from a catalog now, and templates come later (see [Stakeholder disagreement](#stakeholder-disagreement-hr-vs-engineering)) |

---

## Try it in two minutes

Open the [live demo](https://YOUR-APP.vercel.app). No login: the **View as** switcher in the top bar swaps between the new hire and the manager. The demo runs on a fixed date, **Fri, Oct 30, 2026**, so it behaves the same every time. Click **Reset demo** before you start.

1. **As Alex (new hire):** "Next up" points to *Complete I-9 and tax forms*. Click **Open task**, then **Mark as complete**. The card moves to Done, and progress goes from **18% to 27%**.
2. **Switch to Morgan (manager).** Alex's row shows **27%** and **"Just now"**, and the team average goes from 47% to 50%. Chris is flagged in red as needing support.
3. **Click Review Chris's plan** to see his two overdue tasks.
4. **Open Alex's plan → Add task → *Review the org chart*.** It appears with a "Just added" tag. Switch back to Alex to see it on her board.
5. **Remove it with the trash icon → Remove task**, then click **Undo** in the toast to bring it back.

### Who's in the demo

| Person | Role | Situation on Fri, Oct 30 | Status |
|---|---|---|---|
| **Alex Anderson** | New hire (the employee view) | Starts Mon, Nov 2. 2 of 11 tasks done (18%). Post-D1 tasks locked. | On track |
| **Morgan Miller** | Hiring manager (the manager view) | Manages Alex, Brooke and Chris | — |
| Brooke Bennett | Product Designer | Day 1 today. 55%. | On track |
| Chris Carter | Product Manager II | Day 5. 67%, but 2 tasks overdue. | **Needs support** |

Chris has the *highest* progress and still needs support. That's on purpose: a percentage alone hides risk, so status is driven by overdue work, not by how much is done.

### See every state

Each link loads a prepared starting state. A notice at the top names the sample state, with a **Back to the demo** link. Sample states never overwrite your saved demo.

| State | Link |
|---|---|
| New hire at risk (overdue task) | [?fixture=alexOverdue#task-alex-i9](https://YOUR-APP.vercel.app/?fixture=alexOverdue#task-alex-i9) |
| All Pre-D1 work done ("You're all caught up") | [?fixture=alexAllCaughtUp](https://YOUR-APP.vercel.app/?fixture=alexAllCaughtUp) |
| Nothing completed yet (empty Done column) | [?fixture=alexFreshStart](https://YOUR-APP.vercel.app/?fixture=alexFreshStart) |
| Locked Post-D1 task (can't be completed before Day 1) | [#task-alex-orientation](https://YOUR-APP.vercel.app/#task-alex-orientation) |
| Task removed while the new hire had it open | [?fixture=alexTaskRemoved#task-alex-photo](https://YOUR-APP.vercel.app/?fixture=alexTaskRemoved#task-alex-photo) |
| Catalog exhausted (nothing left to add) | [?fixture=alexCatalogExhausted#team-alex](https://YOUR-APP.vercel.app/?fixture=alexCatalogExhausted#team-alex), then **Add task** |
| Pre-D1 items blocked after the start date | [#team-chris](https://YOUR-APP.vercel.app/#team-chris), then **Add task** |
| Nothing left that can be added | [?fixture=chrisCatalogExhausted#team-chris](https://YOUR-APP.vercel.app/?fixture=chrisCatalogExhausted#team-chris), then **Add task** |
| Due date out of range | [#team-alex](https://YOUR-APP.vercel.app/#team-alex) → **Add task** → *Review the org chart* → set Dec 15 → **Add** |
| Broken or out-of-date link | [#settings](https://YOUR-APP.vercel.app/#settings) |

---

## Approach

### Problem

BrightPath (about 150 employees, several new hires a month) onboards people through a mix of welcome emails, shared documents, spreadsheets, and HR and manager messages. As hiring scales, two pain points stand out:

- New hires struggle to understand which tasks need their attention.
- Managers lack visibility into onboarding progress and can't quickly tell whether it's on track.

### Solution

YFP gives the new hire one prioritized view of everything they need to do, and gives the manager a live view of every direct report's progress. Both views read the same data, so a completed task shows up on the manager's dashboard immediately.

### How the prototype meets the MVP success criteria

| The brief says a new hire can… | Where to see it |
|---|---|
| See all onboarding tasks in one place | Alex's board: every task, with one link to where it's done (HR portal, training, video) inside each task |
| Easily understand which tasks need immediate attention | **Next up** card, plus the **Do today** column (overdue, due today or due tomorrow) |
| Track overall progress | Progress ring and "x of y tasks done" |
| Tell Pre-D1 from Post-D1 tasks | Tags on every card, separate Pre-D1 and Post-D1 meters, and a locked list that unlocks on Day 1 |

| The brief says a manager can… | Where to see it |
|---|---|
| Quickly understand progress across direct reports | Summary tiles and the progress table |
| Identify new hires who may need support | Red "may need support" callout, status pill, and rows sorted with people needing attention first |
| Add or remove tasks for one employee | Employee plan → **Add task** (from the catalog) / trash icon |
| See updates immediately as employees complete tasks | "Just now" in the Latest activity column |

---

## Key product decisions

### Where the brief was unclear, and what I assumed

| Question | What I did | Why |
|---|---|---|
| The brief says Post-D1 tasks are "locked and unavailable" and also that new hires "only see Pre-D1 tasks" before Day 1 | Post-D1 titles appear in a compact locked list. They can be opened and read, but not completed, and their links stay hidden until Day 1. | Knowing what's coming reduces anxiety without letting anyone act early. Hiding them entirely is a one-line change. |
| The brief lists the buckets as Do Later / Do Today / Done | **Do today** comes first | The top success criterion is "understand which tasks need immediate attention", and the leftmost column is read first. |
| What counts as "today" | Do today includes tasks due **tomorrow** | So a task never jumps from "later" to "late" overnight. The rule is printed under the column heading. |
| What "needs support" means | Any unlocked task past its due date | Simple and explainable. A real version might also flag inactivity. |
| Should locked tasks count in progress? | Yes: done ÷ all assigned tasks | So progress doesn't suddenly drop on Day 1 when new tasks unlock. |
| Task prerequisites | **The start date is the only prerequisite.** Post-D1 tasks can't be completed before Day 1: the button is disabled and says when it unlocks. There are no dependencies between tasks. | Preventing the action up front is clearer than letting someone try and showing an error. Task-to-task dependencies weren't in the brief. |
| Can a plan be empty? | No. Every plan includes HR-required tasks, which managers can't remove. | Keeps the required HR steps from being dropped by accident. |
| What managers can change | Add from an HR-curated catalog of 10 tasks, with a due date; remove tasks that aren't HR-required or already completed | The brief says "add or remove". Custom tasks and templates are out of scope. Completed tasks stay as a record. |
| Due dates a manager picks | Pre-D1 tasks must be due before Day 1, and Post-D1 tasks on or after it. Empty or out-of-range dates are rejected with an inline message, never silently changed. | Otherwise a Post-D1 task could unlock already overdue and flag the new hire through no fault of their own. |
| How the demo stays repeatable | A fixed demo date and mock data saved in the browser, with **Reset demo** | The brief requires mock data only, and every reviewer should see the same thing. |

### Stakeholder disagreement: HR vs. Engineering

- **Sarah (HR manager)** considers onboarding plan templates a future enhancement.
- **David (Engineering manager)** considers onboarding plan customization a high-priority need.

**My decision:** prioritize the new hire's experience, and give managers lightweight, task-level customization now.

- **Why:** onboarding succeeds first when employees understand and complete the required tasks. Manager ease of use matters, but it's the secondary goal in the brief.
- **What David gets now:** managers can add tasks to, or remove tasks from, one person's plan, choosing from an HR-curated catalog with an adjustable due date.
- **What Sarah's view protects:** HR-required tasks can't be removed, and the catalog is HR-owned, so customization can't break compliance steps.
- **What's deferred:** reusable templates by role or department. The catalog is the foundation they'd be built on, so nothing here has to be thrown away.

The prototype's manager, Morgan, leads a Product team rather than Engineering. The customization need is the same.

### Assumptions behind the product

**Root cause**
- Onboarding feels complex mainly because tasks are spread across many tools and channels, which is why new hires occasionally miss steps.
- Managers lack confidence in onboarding because they can't see progress, not because they don't care.

**User experience**
- New hires benefit more from a prioritized view than from a chronological list.
- Do today / Do later / Done reduces overload and points to the next action.
- People are more likely to finish tasks when progress is visible and in one place.

**Access**
- New hires get access before Day 1 with credentials tied to their personal email. In the prototype, the role switcher stands in for login.
- YFP can link a person's pre-hire and employee identities into one onboarding record.
- Before Day 1, new hires can act only on Pre-D1 tasks. From Day 1, Post-D1 tasks become actionable.

---

## What I prioritized

**North star:** a baseline web version of a unified onboarding tool that delivers value first to new employees and second to their managers.

**P1: the new hire**
- One place to see everything they need to do.
- Immediate visibility into what's active, upcoming and done.
- A clear difference between Action required and Review-only tasks.
- Tasks in each bucket ordered by nearest due date.

**P2: the manager**
- Pre-D1 and Post-D1 tagging and tracking.
- A manager dashboard showing progress and who needs support.
- Adding and removing tasks per person for basic customization (not yet templates by role or department).

---

## What I left out, and why

| Left out | Why |
|---|---|
| Reusable onboarding templates; role- and department-specific workflows | Out of scope per the brief, and the subject of the stakeholder disagreement above. The catalog is the first step toward them. |
| Custom (free-text) tasks | Managers pick from the HR catalog instead, so every task has steps and a link to where it's done. |
| Dependencies between tasks | Not in the brief. The start-date lock covers the one prerequisite it describes. |
| Notifications and reminders | Would require a backend. Managers see updates when they open the dashboard. |
| Employee views for Brooke and Chris | One new-hire view (Alex) is enough to prove the workflow; the others show up in the manager view. |
| Authentication, backend, database, APIs | Out of scope per the brief. The role switcher stands in for login, and data stays in the browser. |
| Analytics | Out of scope per the brief. |
| Native mobile | Out of scope per the brief. The prototype is built for desktop and laptop. |
| AI features | Out of scope per the brief. |

---

## Edge cases and states I tested

- **Empty columns:** each bucket shows a short explanation instead of a blank space.
- **All caught up:** "Next up" says so and how many tasks unlock on Day 1.
- **At risk:** red "Overdue by N days" on the card, a "Needs support" status, and a manager callout naming the oldest overdue task.
- **Can't complete yet:** locked Post-D1 tasks have a disabled button and a greyed-out link until Day 1.
- **Bad input from the manager:** tasks already in the plan and Pre-D1 tasks after the start date are greyed out with a reason; due dates outside the allowed range are rejected with a message.
- **Conflicts:** HR-required and completed tasks can't be removed; a task removed while the new hire has it open shows "This task isn't in your plan".
- **Mistakes:** completing and removing both offer **Undo**, and "Mark as not done" reopens a task.
- **Broken links and data:** unknown pages show a friendly not-found screen; corrupt or blocked browser storage falls back to the starting demo.
- **Accessibility:** the full demo works keyboard-only, at 200% zoom and at several widths, and statuses are never shown by color alone.

---

## How I built it, and how I checked the AI's work

### Tools

- **Microsoft Copilot:** process advice, planning and review
- **Claude Design:** workflow exploration and UI/UX prototyping
- **Claude Code:** implementation and front-end development
- **GitHub:** version control · **Vercel:** hosting
- **Inspiration:** [SpectacledCoder's Kanban Board on Dribbble](https://dribbble.com/shots/23753668-Kanban-Board) for the buckets, and the [MangoApps home page](https://www.mangoapps.com/) for styling

### Checking the AI's work

I didn't take generated code on trust. The checks are built into the repository:

- **One source of truth for the rules.** Every rule (buckets, progress, status, what can be added or removed) lives once, in `public/04-mock-data.js`. Its self-check verifies each person's expected numbers and replays the demo script.
- **A real AI mistake this caught.** The first single-file prototype had its *own copies* of the rules, so the self-check was testing different code from what the app ran, and the two could silently drift apart. I moved every rule into one place and added `tests/check-single-source.js`, which fails if a copy reappears.
- **Browser tests** drive the real app through the demo script, every required state, keyboard-only use, several widths and 200% zoom.
- **Consistent wording.** I swept the generated copy so it always says "Day 1" (and "D1" only in tags).
- **An independent review pass.** A separate AI session acting as a MangoApps reviewer tried to break the prototype. It found gaps that I then fixed: manager due dates weren't validated (the generated code silently moved a bad date to today, so a Post-D1 task could unlock already overdue), the states couldn't be seen on the deployed site, and one README step didn't match the app.
- **Known gaps I chose not to fix yet.** A hire at 100% shows as "On track" rather than a distinct "Complete" status. A plan with no tasks has no dedicated message; it can't happen today, because HR-required tasks can't be removed, but a real version would say "Your plan isn't ready yet."

---

## Run it locally

No install and no build step.

- Double-click `public/index.html`, or
- Run `npx serve public` and open the address it prints.

Changes are saved in your browser. Click **Reset demo** to return to the starting state. The [sample-state links](#see-every-state) work locally too: add `?fixture=<name>` to the address (names are in `public/04-mock-data.js` §11).

### Run the checks

Requires Node. Both must pass before each deploy.

```sh
node public/04-mock-data.js         # data integrity, expected values, demo script, fixtures
node tests/check-single-source.js   # no business rule defined outside 04-mock-data.js
```

**Browser tests** (optional; Node 22+ and Chrome or Edge, still nothing to install):

```sh
node tests/browser/run.mjs                  # Chrome
node tests/browser/run.mjs --browser=edge   # Edge
node tests/browser/run.mjs employee         # one suite: employee | manager | edge-cases | polish
```

### Deploy (Vercel)

1. Import the repository in Vercel (**Add New → Project**).
2. Framework preset: **Other**. Leave Build Command and Install Command empty, and leave Output Directory at its default (Vercel serves `public/`). Don't turn on the override with an empty value, which would publish the whole repository.
3. Deploy.

Only `public/` is published; the planning docs stay in the repository. Full steps and post-deploy checks are in [docs/05-build-spec.md](docs/05-build-spec.md) §11.

---

## Repository guide

| Doc | What it covers |
|---|---|
| [01-pm-brief.md](docs/01-pm-brief.md) | Problem, users and MVP scope. Wins on any conflict. |
| [02-user-flow.md](docs/02-user-flow.md) | Demo script, screens, states and rules |
| [03-design-notes.md](docs/03-design-notes.md) | Visual direction (references in [docs/references/](docs/references/)) |
| [04-mock-data.js](public/04-mock-data.js) | Mock data, rules, expected values and self-check |
| [05-build-spec.md](docs/05-build-spec.md) | How the app is built, tested and deployed |

```
docs/                    Planning docs and reference images (not deployed)
public/                  The app (the only folder Vercel serves)
  index.html             Page shell
  04-mock-data.js        Data, business rules, copy, expected values, fixtures
  src/                   Styles, store, router, shared components, one file per screen
tests/                   Single-source check and headless browser suites
```

Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies besides Google Fonts. That keeps the prototype easy to deploy, easy to read, and focused on the product rather than tooling.

---

## What I'd do next

### Research with new hires
Interview people hired at BrightPath in the last three months, through demos, usability tests or a beta:
- What does YFP improve, and what onboarding problems remain?
- Which tasks are missed most often, and which channels cause the most confusion?
- Are Do today / Do later / Done the right buckets? Do people think in tasks or in larger milestones?

### Discovery with Sarah (HR) and David (Engineering)
Get access to real onboarding data and learn:
- The key tasks by role and by department, and how plans change over time
- How much customization each team really needs, and how templates should be kept up to date
- How managers track onboarding today, and which system is the source of truth

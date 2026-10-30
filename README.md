# YFP (Your First Path)

A browser-based onboarding prototype for BrightPath Technologies. New hires see every onboarding task in one place, sorted into **Do today · Do later · Done**, and track their progress before and after Day 1. Their hiring manager sees progress across direct reports, spots who needs support, and adds or removes tasks.

Frontend only, powered by mock data. No backend, database, APIs or login: a role switcher in the top bar swaps between the new hire (Alex) and the manager (Morgan). The demo runs on a fixed date, **Fri, Oct 30, 2026**, so it behaves the same every time.

## Run locally

No install and no build step.

- Double-click `public/index.html`, or
- Run `npx serve public` and open the address it prints.

Changes are saved in your browser. Click **Reset demo** in the top bar to return to the starting state.

## Demo in two minutes

1. As **Alex**, click **Open task** on *Complete I-9 and tax forms*, then **Mark as complete**. Progress goes from 18% to 27%.
2. Switch to **Morgan** in the top bar. Alex's row shows 27% and "Just now"; Chris is flagged as needing support.
3. Open Alex's plan, **Add task** → *Review the org chart*, then remove it again with **Undo**.

The full script is in [docs/02-user-flow.md](docs/02-user-flow.md) §3.

## Run the checks

Requires Node. Nothing to install. Both must pass before each deploy.

```sh
node public/04-mock-data.js         # data integrity, expected values, demo script, fixtures
node tests/check-single-source.js   # no business rule defined outside 04-mock-data.js
```

Exit code 0 means pass.

**Browser tests** (optional; needs Node 22+ and Chrome or Edge, still nothing to install). They drive the real app headlessly through the demo script, every required state, keyboard-only use, several widths and 200% zoom:

```sh
node tests/browser/run.mjs                  # Chrome
node tests/browser/run.mjs --browser=edge   # Edge
node tests/browser/run.mjs employee         # one suite: employee | manager | edge-cases | polish
```

To see a specific state locally, open the app with `?fixture=<name>`, e.g. `public/index.html?fixture=alexAllCaughtUp`. Fixture names are in `public/04-mock-data.js` §11; the list of states is in [docs/05-build-spec.md](docs/05-build-spec.md) §10.3. This only works on your own machine and never overwrites your saved demo.

## Deploy (Vercel)

1. Import the repository in Vercel (**Add New → Project**).
2. Framework preset: **Other**. Leave Build Command and Install Command empty. Leave Output Directory at its default (Vercel uses `public/`); don't turn on the override with an empty value, which would publish the whole repository.
3. Deploy.

Only `public/` is published; the planning docs stay in the repository. Full steps and post-deploy checks are in [docs/05-build-spec.md](docs/05-build-spec.md) §11.

## Docs

| Doc | What it covers |
|---|---|
| [01-pm-brief.md](docs/01-pm-brief.md) | Problem, users, MVP scope. Wins on any conflict. |
| [02-user-flow.md](docs/02-user-flow.md) | Demo script, screens, states and rules |
| [03-design-notes.md](docs/03-design-notes.md) | Visual direction (references in [docs/references/](docs/references/)) |
| [04-mock-data.js](public/04-mock-data.js) | Mock data, rule helpers, expected values and self-check |
| [05-build-spec.md](docs/05-build-spec.md) | How the app is built and deployed |

## Repository layout

```
docs/                    Planning docs and reference images (not deployed)
public/                  The app (the only folder Vercel serves)
  index.html             Page shell: fonts, #app root, scripts in load order
  04-mock-data.js        Data, business rules (helpers), copy, expected values, fixtures
  src/app.css            Design tokens and styles
  src/core/              Store, router, date formatting
  src/ui/                HTML helpers, icons, shared components
  src/views/             One file per screen, plus the task panel and catalog dialog
  src/main.js            Render loop, events, focus management, boot
tests/
  check-single-source.js Static check that rules live only in 04-mock-data.js
  browser/               Headless browser suites (no dependencies; Chrome or Edge)
```

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies besides Google Fonts. Why: [docs/05-build-spec.md](docs/05-build-spec.md) §2.

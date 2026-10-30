# YFP (Your First Path)

A browser-based onboarding prototype for BrightPath Technologies. New hires see every onboarding task in one place, sorted into **Do today · Do later · Done**, and track their progress before and after Day 1. Their hiring manager sees progress across direct reports, spots who needs support, and adds or removes tasks.

Frontend only, powered by mock data. No backend, database, APIs or login: a role switcher in the top bar swaps between the new hire (Alex) and the manager (Morgan). The demo runs on a fixed date, **Fri, Oct 30, 2026**, so it behaves the same every time.

## Run locally

No install and no build step.

- Double-click `public/index.html`, or
- Run `npx serve public` and open the address it prints.

Changes are saved in your browser. Click **Reset demo** in the top bar to return to the starting state.

## Run the checks

Requires Node.

```sh
node public/04-mock-data.js        # data integrity, expected values, demo script, fixtures
```

Exit code 0 means pass.

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
docs/      Planning docs and reference images (not deployed)
public/    The app: index.html and 04-mock-data.js (the only folder Vercel serves)
```

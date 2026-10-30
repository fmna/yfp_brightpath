# CLAUDE Guidelines

## Project Context

This repository contains a product management take-home assignment for a web-based onboarding application called YFP (Your First Path).

Before beginning implementation, read:

- docs/01-pm-brief.md
- docs/02-user-flow.md
- docs/03-design-notes.md
- public/04-mock-data.js
- docs/05-build-spec.md

The deployed app lives in `public/` (the only folder Vercel serves). Planning docs and reference images live in `docs/` and are not deployed.

If requirements conflict, prioritize the PM Brief.

## Working Style

Before major architecture or framework decisions:
- Explain the recommended approach and your reasoning.
- Highlight any assumptions being made.

Before finishing a milestone:
- Run the `04-mock-data.js` self-check with Node: `node public/04-mock-data.js`.
- Run `node tests/check-single-source.js` once it exists.
- Both must pass.

For implementation:
- You may create files and folders needed to implement the application.
- Do not delete existing documentation files.

At the end of major milestones:
- Summarize what was built.
- List created and modified files.
- Identify any unresolved questions.

## Product Priorities

Favor:
- Clarity
- Demoability
- Simplicity
- Scope control

Avoid:
- Additional features not defined in the PM Brief
- Authentication
- Databases
- APIs
- AI capabilities
- Mobile-native experiences
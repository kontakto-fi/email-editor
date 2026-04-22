# CLAUDE.md

Guidance for Claude Code when working in this repository.

This package (`@kontakto/email-template-editor`) is a React email template editor published to npm. It's consumed both as an embedded component (primary use) and as a standalone Vite app (for local dev).

See `AGENTS.md` for file naming conventions, project structure, path aliases, and the checklist for adding a new block. Everything below is additional.

## Common commands

- `npm run dev` — Vite dev server (standalone app, port **6573**, strict — fails if occupied rather than auto-incrementing, so only one instance runs at a time)
- `npm run build` — `vite build && tsup` (produces `dist/` for publishing)
- `npm test` — Jest unit tests
- `npx playwright test` — Playwright e2e tests (spins up Vite on port 5199)

## Commit messages (Conventional Commits)

Releases are fully automated by `semantic-release` on `main`. The commit message prefix determines the version bump, so it matters.

Format: `<type>(<scope>)?: <subject>`

Bump mapping (via `@semantic-release/commit-analyzer`, default angular preset):

- `feat:` — minor bump (new feature)
- `fix:` — patch bump (bug fix)
- `perf:` — patch bump
- `BREAKING CHANGE:` in body/footer, or `!` after type (e.g. `feat!:`) — major bump
- `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `ci:`, `build:` — no release

Scope is free-form; recent history uses ones like `session`, `theming`, `templating`, `persistence`, `build`. Keep subject lowercase, imperative, no trailing period.

Examples from this repo:
- `fix(session): reset editor when initialTemplate prop changes`
- `feat: accept raw HTML string as initialTemplate`
- `feat(height-control): enable controlling the height of the email editor`

Avoid generic prefixes like `update:` or bare sentences — they either miscategorize the release or skip it entirely.

## Release process

- CI (`.github/workflows/ci.yml`) runs build + Playwright on every push/PR to `main`.
- Release (`.github/workflows/release.yml`) is **manual only** (`workflow_dispatch`). Trigger it from the GitHub Actions UI when ready to publish. Do not switch it back to push-triggered — per-commit releases are explicitly not wanted.
- `semantic-release` reads commits since the last tag, bumps `package.json`, updates `CHANGELOG.md`, publishes to npm, creates a GitHub release, and commits back with `chore(release): <version> [skip ci]`.
- Config: `.releaserc.json`. Only `main` is a release branch.

## Public API surface

The npm package's public API is whatever `src/index.ts` re-exports. When renaming or removing anything exported from there, it's a breaking change — use `feat!:` or include a `BREAKING CHANGE:` footer.

## Code style

- ESLint flat config at `eslint.config.js`, Prettier at `.prettierrc` (single quotes, semi, 120 print width, 2-space indent, trailing commas `es5`).
- TypeScript strict mode on; `no-explicit-any` is an error in app code (relaxed in `*.spec.*`).
- Imports are sorted by `simple-import-sort` — don't hand-order them.

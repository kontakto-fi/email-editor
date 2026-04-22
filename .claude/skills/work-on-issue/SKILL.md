---
name: work-on-issue
description: Implement a GitHub issue end-to-end with visual verification via Playwright MCP, then hand back to the user without committing. Triggers on "work on issue N", "implement issue N", "/work-on-issue N".
---

# Work on Issue

1. **Read** — `gh issue view <N>`. Note scope, out-of-scope, breaking-change flag, dependencies, and any "decide during implementation" questions. If a dependency isn't landed or a question is open, ask before coding.

2. **Implement** — follow conventions in `CLAUDE.md`.

3. **Verify** — `npm run build` and `npx playwright test` must pass.

4. **Visual confirmation** — required for every issue; this is a client library, every change manifests in the UI. Requires Playwright MCP. If it's not configured, stop and ask the user to install it; don't substitute the e2e suite.
   - Start dev server (`npm run dev`, port 5173)
   - Drive the feature via Playwright MCP
   - Save screenshots to project root as `<issue>-<short-description>-<seq>.png` (e.g. `4-templates-drawer-empty-1.png`)
   - Capture before, in-use, and after states

5. **Commit and push** — use a Conventional Commits message per `CLAUDE.md` (correct type for the release bump, `!` or `BREAKING CHANGE:` footer when applicable). End the body with `Closes #<N>` if the issue is fully resolved, otherwise `Refs #<N>`. Push to `origin/main`.

---
name: work-on-issue
description: Implement a GitHub issue end-to-end with visual verification via Playwright MCP, then hand back to the user without committing. Triggers on "work on issue N", "implement issue N", "/work-on-issue N".
---

# Work on Issue

1. **Read** — `gh issue view <N>`. Note scope, out-of-scope, breaking-change flag, dependencies, and any "decide during implementation" questions. If a dependency isn't landed or a question is open, ask before coding.

2. **Implement** — follow conventions in `AGENTS.md` and `CLAUDE.md`.

3. **Verify** — `npm run build` and `npx playwright test` must pass.

4. **Visual confirmation** (UI issues only) — requires Playwright MCP. If it's not configured, stop and ask the user to install it; don't substitute the e2e suite.
   - Start dev server (`npm run dev`, port 5173)
   - Drive the feature via Playwright MCP
   - Save screenshots to project root as `<issue>-<short-description>-<seq>.png` (e.g. `4-templates-drawer-empty-1.png`)
   - Capture before, in-use, and after states

5. **Report, don't commit** — summarize files changed, list screenshots, draft a Conventional Commits message per `CLAUDE.md` with `Refs #<N>` (or `Closes #<N>` if the issue is fully resolved). Leave the working tree for the user to review.

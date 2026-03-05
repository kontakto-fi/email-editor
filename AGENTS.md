# Email Template Editor - Agent Guidelines

## Conventions

- Use **kebab-case** for file names (e.g. `signature-editor.tsx`, `button-sidebar-panel.tsx`)
- Use **PascalCase** for React components and types
- Use **camelCase** for variables, functions, and props

## Project Structure

- `src/blocks/` — Block components (read-only renderers) + Zod schemas. Each block exports its component, schema, props type, and defaults.
- `src/editor/` — Editor-specific block components (inline editors, block wrappers, add-block menu)
- `src/editor/core.tsx` — Editor block dictionary (maps block types to editor components)
- `src/email-builder/` — Reader components for rendering emails (preview/export)
- `src/email-builder/reader/core.tsx` — Reader block dictionary
- `src/app/` — App shell: drawers, inspector panels, email canvas
- `src/app/inspector-drawer/configuration-panel/input-panels/` — Sidebar panels for each block type
- `src/core/` — Shared block building utilities
- `e2e/` — Playwright end-to-end tests

## Path Aliases (tsconfig)

- `@blocks` → `src/blocks`
- `@editor` → `src/editor`
- `@core` → `src/core`
- `@email-builder` → `src/email-builder`

## Adding a New Block

1. Create `src/blocks/{name}.tsx` — component, schema, defaults
2. Export from `src/blocks/index.ts`
3. Create `src/editor/blocks/{name}/{name}-editor.tsx` — inline editor
4. Register in `src/editor/core.tsx` (editor dictionary)
5. Register in `src/email-builder/reader/core.tsx` (reader dictionary)
6. Create `src/app/inspector-drawer/configuration-panel/input-panels/{name}-sidebar-panel.tsx`
7. Register in `src/app/inspector-drawer/configuration-panel/index.tsx`
8. Add to `src/editor/blocks/helpers/editor-children-ids/add-block-menu/buttons.tsx`
9. Export from `src/index.ts`

## Testing

- E2E tests use **Playwright** (`e2e/` directory)
- Run with `npx playwright test`
- Config: `playwright.config.ts` (uses vite dev server on port 5199)

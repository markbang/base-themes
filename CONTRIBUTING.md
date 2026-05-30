# Contributing to base-themes

Thanks for helping improve Base Themes. The project is a Base UI-first React component library with CSS token themes, registry metadata, docs, and agent-friendly workflows. Contributions should keep those surfaces in sync.

## Local Setup

```bash
npm install
npm run dev
```

Useful routes while developing:

```text
http://localhost:5175/components/button
http://localhost:5175/themes
http://localhost:5175/blocks
http://localhost:5175/docs/installation
```

## Required Checks

Run these before opening a pull request:

```bash
npm run registry:check
npm run lint
npm run build
npm run bundle:report
npm run package:smoke
npm run community:check
npm run example:vite:build
npm run example:dashboard:build
npm run example:theme-customization:build
npm run example:next:build
npm run example:registry-copy -- button select dialog
```

Run these when changing theme tokens, component styles, or previews:

```bash
npm run themes:e2e
npm run previews:generate
```

`themes:e2e` and `previews:generate` require `agent-browser` in the local environment.

## Contribution Paths

### Add or Change a Component

- Add or update `src/components/ui/<Name>.tsx`.
- Add or update the matching CSS file when the component needs styles.
- Export the component and public types from `src/components/ui/index.ts`.
- Add or update docs examples in the docs app.
- Update `registry/registry.json` with required files and dependencies.
- Run `npm run registry:check`, `npm run lint`, and `npm run build`.

### Add or Change a Theme Style

- Update `src/styles/themeList.ts` when adding a new style.
- Add token overrides in `src/styles/tokens.css` and derived behavior in `src/styles/themes.css` when needed.
- Verify both `data-theme="light"` and `data-theme="dark"`.
- Update `registry/registry.json` theme variants.
- Regenerate preview assets with `npm run previews:generate` when visuals change.
- Run `npm run themes:e2e` before release-level changes.

### Add a Block

- Build the block from existing Base Themes components.
- Keep the block responsive and keyboard-accessible.
- Add a docs preview and copyable usage example.
- Add a registry entry with component dependencies and source files.
- Include a screenshot or preview asset when the block is intended for discovery.

### Improve Docs

- Keep installation snippets runnable in a fresh app.
- Keep component docs, registry entries, and source exports in sync.
- Prefer concrete examples over marketing copy.
- If a docs route should be indexed, make sure the SEO generation path covers it.

## Pull Request Expectations

- Keep changes focused on one component, theme, block, or docs area.
- Include screenshots for visual changes.
- Mention which checks were run.
- Call out registry schema changes, token changes, or breaking API changes explicitly.

## Issues and Labels

The public issue workflow uses [.github/labels.json](./.github/labels.json) as the label vocabulary for bugs, features, docs, themes, components, blocks, registry work, accessibility, performance, good-first issues, and community gallery submissions.

Run `npm run community:check` when changing issue templates, PR templates, contributor seed issues, or the label manifest. The check keeps `.github/ISSUE_TEMPLATE/*`, [docs/contributor-issue-seeds.md](./docs/contributor-issue-seeds.md), and gallery permission language aligned so first-time contributors see a consistent path from issue to PR.

## Release Discipline

Releases should follow [RELEASE.md](./RELEASE.md). Public package trust matters: registry validation, reproducible builds, npm provenance, and clear release notes are part of the product.

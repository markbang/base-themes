---
name: base-themes
description: Install, inspect, customize, and verify the Base Themes React component kit built on Base UI primitives. Use when adding Base Themes components, blocks, theme styles, registry/source-copy plans, or agent-safe UI customization to a React app.
---

# Base Themes

Base Themes is a package-first React component system built on `@base-ui/react`. It ships typed component wrappers, CSS token themes, 21 visual styles, product blocks, registry metadata, CLI helpers, and agent-readable docs.

## Prefer Package Installs

Install the package and peer dependencies in the target React app:

```bash
npm install base-themes @base-ui/react react react-dom
```

Import the bundled CSS once at app startup:

```tsx
import 'base-themes/styles.css'
```

Render components inside a themed root. Use `data-style` for the visual system and `data-theme` for light or dark mode:

```tsx
import { Button, Select } from 'base-themes'

export function SettingsPanel() {
  return (
    <section data-style="bento" data-theme="light">
      <Button>Save changes</Button>
      <Select
        id="density"
        label="Density"
        defaultValue="comfortable"
        items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
      />
    </section>
  )
}
```

React 18.2+ and React 19 are supported by peer dependencies. The Vite, dashboard, and theme-customization examples build against React 18; the Next.js example builds against React 19.

## Machine-Readable Metadata

Use package exports before scraping docs:

```ts
import registry from 'base-themes/registry.json'
import shadcnRegistry from 'base-themes/shadcn-registry.json'
import buttonItem from 'base-themes/registry/items/button.json'
import blockMeta from 'base-themes/block-meta.json'
import componentMeta from 'base-themes/component-meta.json'
import staticPageMeta from 'base-themes/static-page-meta.json'
import themeMeta from 'base-themes/theme-meta.json'
import tokenContract from 'base-themes/token-contract.json'
```

The same metadata is hosted when the docs site is deployed:

- `/registry/registry.json`
- `/registry/shadcn-registry.json`
- `/registry/items/button.json`
- `/registry/block-meta.json`
- `/registry/component-meta.json`
- `/registry/static-page-meta.json`
- `/registry/theme-meta.json`
- `/llms.txt`
- `/llms-full.txt`

This skill markdown is included at `node_modules/base-themes/skills/base-themes/SKILL.md` and exported as `base-themes/skill` for tools that read package exports.

## CLI Workflows

Use the CLI to inspect coverage, generate source-copy plans, and diagnose real apps:

```bash
npx base-themes list
npx base-themes list --json
npx base-themes plan button select block:dashboard-shell theme:enterprise
npx base-themes plan button select block:dashboard-shell theme:enterprise --json
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json
npx base-themes doctor .
npx base-themes doctor . --json
```

Use `base-themes/registry.json` for the internal source-copy manifest. Use `base-themes/shadcn-registry.json`, package item exports such as `base-themes/registry/items/button.json`, or hosted `/registry/items/*.json` when a shadcn-compatible catalog or item-level `meta.agent` guidance is more useful.

Use `plan --json` before source-copying. It resolves package dependencies, all registry style files, block files, component files, available styles, missing names, package item imports such as `base-themes/registry/items/button.json`, hosted item URLs, block `meta.agent.registryItems`, theme `data-style` steps from requests such as `theme:enterprise`, and generated `meta.agent.packageInstall` / `meta.agent.sourceCopy` steps. The CLI is intentionally a planner, not a file copier; agents should make target paths, import rewrites, formatting, and lockfile changes explicitly in the destination app.

Use `add --dry-run --json` when the user explicitly wants source files copied from the package registry. `add` copies only registry-listed style, block, and component files into `--target`, skips existing files by default, and requires `--force` before overwriting. After copying, review imports and run the target app's formatter, lint, tests, and build.

Use `list --json` before choosing components, blocks, or themes. Use `doctor --json` after installation. It checks package dependencies, the `base-themes/styles.css` side-effect import, and `data-style` / `data-theme` wiring. WARN output includes concrete fixes, docs URLs, and bug-report guidance.

Use `base-themes/token-contract.json` before generating theme overrides. The stable public customization surface is `data-style`, `data-theme`, and the `--bt-*` tokens; legacy variables without the prefix remain 0.x compatibility aliases.

## Add Components

1. For package consumers, import components from `base-themes` and keep `base-themes/styles.css` imported once.
2. For source-copy consumers, run `npx base-themes plan <component...>` or read `base-themes/registry.json`.
3. Copy every file from the plan's component files and style files.
4. Install dependencies from the plan.
5. Preserve labels, focus behavior, disabled states, and keyboard interactions from the docs.
6. Run registry, lint, test, build, and package smoke checks before returning the change.

## Add Blocks

1. Run `npx base-themes plan block:<block-name>` to resolve block source and component dependencies.
2. Copy the block files and required component files together.
3. Keep block styles token-based and responsive; do not hard-code one-off colors when semantic tokens exist.
4. Link users to `/blocks/<block-name>` or registry metadata when explaining what was copied.

Useful block requests include:

```bash
npx base-themes plan block:dashboard-shell
npx base-themes plan block:data-table
npx base-themes plan block:theme-showcase-card
```

## Customize Themes

Start from an existing `data-style` and override semantic CSS variables in app CSS. Avoid a JavaScript theme runtime unless the target app already has one.

```css
:root {
  --bt-primary: #2563eb;
  --bt-secondary: #0f766e;
  --bt-radius: 10px;
  --bt-radius-sm: 8px;
  --bt-font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
}

[data-theme='dark'] {
  --bt-bg: #0b1120;
  --bt-surface: #111827;
  --bt-fg: #f8fafc;
  --bt-primary: #60a5fa;
}
```

For current 0.x builds, mirror a `--bt-*` override to the matching legacy token when the target component still reads the legacy variable directly, for example `--accent: var(--bt-primary)`.

Use `examples/theme-customization` when validating brand color, radius, font, density, and copyable CSS-variable workflows.

## Runnable Examples

Use examples to verify real package integration paths:

```bash
npm run example:vite:build
npm run example:dashboard:build
npm run example:theme-customization:build
npm run example:next:build
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json
```

Choose the example by question:

- `examples/vite`: fresh React 18 Vite install with package CSS, components, `useTheme`, and registry JSON.
- `examples/dashboard`: product dashboard composed from shipped blocks, controls, registry metadata, and theme switching.
- `examples/theme-customization`: token overrides for brand color, radius, font, density, and copyable variables.
- `examples/next`: Next.js App Router / React 19 integration.
- `examples/registry-copy`: CLI-aligned list, plan, add dry-run, and doctor proof for source-copy tools.

## Verification

Run these after changing package exports, components, registry, docs, blocks, theme tokens, examples, or agent workflow docs:

```bash
npm run registry:check
npm run tokens:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run bundle:report
npm run bundle:report -- --json
npm run telemetry:check
npm run telemetry:check -- --live
npm run telemetry:fixtures
npm run launch:status
npm run launch:status -- --live
npm run launch:actions
npm run launch:actions -- --live
npm run launch:campaign
npm run package:smoke
```

Run targeted checks when relevant:

```bash
npm run community:check
npm run community:issues -- --json
npm run analytics:check
npm run telemetry:collect -- --json
npm run themes:e2e
npm run previews:check
npm run example:theme-customization:build
```

`themes:e2e` and `previews:check` require `agent-browser`. Use `npm run community:check` when editing issue templates, contributor seed issues, gallery wording, or `.github/labels.json`. Use `npm run community:issues` before announcements to render good-first issue URLs or GitHub CLI commands; it does not publish issues by itself.

Use `npm run telemetry:check` before claiming adoption progress. It validates the latest saved telemetry report: four public signals, a three-signal completion threshold, `externallyValidated` derived from the score, and no telemetry collection errors. Use `npm run telemetry:check -- --live` to validate a fresh no-write GitHub/npm collection. A release can be ready while adoption remains unvalidated.

Use `npm run telemetry:fixtures` when editing telemetry import logic or adoption docs. It imports bundled sanitized Search Console, website analytics, registry access, community proof, and bundle report exports from `research/telemetry-fixtures` so private-provider parsing stays covered without real credentials.

Use `npm run launch:status` after `npm run telemetry:collect` to read the latest telemetry JSON and summarize the public adoption score, missing signals, recommended good-first issue URLs, telemetry collection errors, supporting evidence, and next launch actions. Use `npm run launch:status -- --live` before external promotion when the latest saved report may be stale.

Use `npm run launch:actions` while the public adoption gate is still unmet. It converts missing star, fork, external issue/PR, or download signals into a concrete action list with links, commands, recommended good-first issue URLs, share assets, a promotion wave, and a campaign checklist. Use `npm run launch:actions -- --live` to build that action list from current GitHub/npm data without writing a telemetry report. Use `npm run launch:campaign` before external promotion to write the live campaign JSON and Markdown pack to `research/`.

Use `npm run bundle:report -- --json` when checking website performance budgets. It emits app JS, largest JS, total JS, gzip sizes, and budget results for CI or telemetry-style consumption. Import that output with `BUNDLE_REPORT_EXPORT=path/to/bundle-report.json npm run telemetry:collect` when comparing performance budgets with adoption-funnel telemetry.

## Adoption Feedback

If installation, doctor, registry-copy, example, or customization flows fail in a real app, open the smallest useful GitHub signal: bug report with WARN output, feature request for a missing component/block/theme, or community gallery submission for real usage.

---
name: base-themes
description: Install and extend the Base Themes React component kit built on Base UI primitives, with Bento, shadcn, and neo brutalism styles, blocks, theme tokens, and registry metadata. Use when adding Base Themes components, blocks, custom themes, or installation guidance to a React app.
---

# Base Themes

## Quick Start

Install the package and peer dependencies in the target React app. Prefer this npm package flow for normal usage:

```bash
npm install base-themes @base-ui/react react react-dom
```

Import the styles once:

```tsx
import 'base-themes/styles.css'
```

Use a packaged component:

```tsx
import { Button, Select } from 'base-themes'

export function Example() {
  return (
    <div data-style="bento" data-theme="light">
      <Button>Save changes</Button>
      <Select
        id="density"
        label="Density"
        defaultValue="comfortable"
        items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
      />
    </div>
  )
}
```

Registry metadata is available from the package when an agent or script needs to inspect components, blocks, dependencies, or required files:

```ts
import registry from 'base-themes/registry.json'
```

This skill markdown is included in the installed package at `node_modules/base-themes/skills/base-themes/SKILL.md` and exposed as `base-themes/skill` for tools that read package exports.

For source-copy installs only, copy the component wrappers and styles:

```bash
cp -R src/components/ui ./target-app/src/components/ui
cp -R src/styles ./target-app/src/styles
```

Import the tokens once from app CSS:

```css
@import './styles/tokens.css';
```

## Workflows

### Add A Component

1. For package installs, import the component from `base-themes` and import `base-themes/styles.css` once.
2. For source-copy installs, check `registry/registry.json` or `base-themes/registry.json` for the component entry.
3. Copy every file listed in the entry's `files` array.
4. Ensure `src/styles/tokens.css`, `src/styles/shadcn.css`, `src/styles/neo-brutalism.css`, and `src/styles/themes.css` are imported by the target app when source-copying.
5. Install dependencies from the registry `dependencies` array.
6. Import the component from `src/components/ui`.

### Add A Block

1. Open `registry/registry.json` and find the block under `blocks`.
2. Copy the components listed in the block's `components` array.
3. Recreate the block layout from `/blocks` or adapt it into the target route.
4. Keep block styles token-based; avoid hard-coded one-off colors.

### Customize Theme

Override variables in `src/styles/tokens.css`, or add style-specific overrides under `[data-style='shadcn']` and `[data-style='neo-brutalism']`:

```css
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text-strong: #111827;
  --accent: #f97316;
}

[data-theme='dark'] {
  --bg: #0b1120;
  --surface: #111827;
  --text-strong: #f1f5f9;
  --accent: #fb923c;
}
```

## Verification

Run these checks after changing components, registry, blocks, or theme tokens:

```bash
node scripts/validate-registry.mjs
npm run lint
npm run build
```

Use the docs app for manual verification:

- `/components/button` for component pages
- `/blocks` for block examples
- `/themes` for token customization
- `/docs/installation` for install instructions

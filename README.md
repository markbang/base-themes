# base-themes

[![CI](https://github.com/markbang/base-themes/actions/workflows/ci.yml/badge.svg)](https://github.com/markbang/base-themes/actions/workflows/ci.yml)
[![npm provenance](https://img.shields.io/badge/npm-provenance-0a7)](https://docs.npmjs.com/generating-provenance-statements)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Themeable React components built on [Base UI](https://base-ui.com/). Base Themes packages accessible primitives, practical product themes, source-copy registry metadata, and production-ready examples behind one CSS-token contract.

Docs: <https://base-themes.bangwu.me/>

## Highlights

- **Base UI behavior:** focus management, keyboard interaction, portals, and overlay primitives come from `@base-ui/react`.
- **22 visual styles:** Bento, shadcn, Neo Brutalism, Enterprise, Linear, Glass, Terminal, Material, Fluent, Cyberpunk, Mono, Studio, Cohub, and more.
- **CSS-token theming:** switch style and color mode with `data-style` and `data-theme`; customize stable `--bt-*` tokens without a JavaScript theme runtime.
- **Registry-first distribution:** components, blocks, theme files, dependencies, metadata, and source-copy plans are available from package exports and shadcn-style registry JSON.
- **Useful blocks included:** dashboard shell, auth card, pricing panel, data table, command palette, team activity feed, settings form, and theme showcase card.
- **Agent/tool friendly:** package metadata, CLI commands, docs routes, and the included `base-themes` skill make it easy for automation to inspect, install, copy, and verify.

## Quick Start

```bash
npm install base-themes @base-ui/react react react-dom
```

```tsx
import "base-themes/styles.css";
import { Button, Select } from "base-themes";

export function App() {
  return (
    <main data-style="bento" data-theme="light">
      <Button>Ship it</Button>
      <Select
        id="density"
        label="Density"
        defaultValue="comfortable"
        items={{
          compact: "Compact",
          comfortable: "Comfortable",
          spacious: "Spacious",
        }}
      />
    </main>
  );
}
```

Portaled components such as `Select`, `Combobox`, `Dialog`, `Popover`, and `Tooltip` render outside deeply nested wrappers. Put `data-style` and `data-theme` on `html`, `body`, your app shell, or the portal container so overlays inherit the same theme.

Strict TypeScript projects may also need:

```ts
declare module "base-themes/styles.css";
```

## Themes

```html
<html data-style="shadcn" data-theme="dark"></html>
```

Available styles:

`bento`, `shadcn`, `neo-brutalism`, `minimal`, `enterprise`, `linear`, `glass`, `terminal`, `material`, `fluent`, `retro`, `cyberpunk`, `editorial`, `calm`, `data-dense`, `playful`, `luxury`, `soft-ui`, `bauhaus`, `mono`, `studio`, `cohub`.

Theme previews are generated from the same docs app and live under [public/previews](./public/previews).

## Components

Base Themes wraps the common Base UI surface with shared styles and typed React exports:

`Accordion`, `AlertDialog`, `Autocomplete`, `Avatar`, `Button`, `Checkbox`, `CheckboxGroup`, `Collapsible`, `Combobox`, `ContextMenu`, `CspProvider`, `Dialog`, `DirectionProvider`, `Drawer`, `Field`, `Fieldset`, `Form`, `Input`, `Menu`, `Menubar`, `Meter`, `NavigationMenu`, `NumberField`, `OtpField`, `Popover`, `PreviewCard`, `Progress`, `Radio`, `RadioGroup`, `ScrollArea`, `Select`, `Separator`, `Slider`, `Switch`, `Tabs`, `ToastProvider`, `Toggle`, `ToggleGroup`, `Toolbar`, and `Tooltip`.

## Blocks

```tsx
import { DashboardShell, SettingsForm } from "base-themes";
```

Blocks are source-copyable and exported from the package:

- Dashboard Shell
- Settings Form
- Auth Card
- Pricing Panel
- Data Table
- Command Palette
- Team Activity Feed
- Theme Showcase Card

See `/blocks` in the docs app for previews and detail routes.

## Registry And CLI

The package exposes registry artifacts for copy-based workflows:

```ts
import registry from "base-themes/registry.json";
import shadcnRegistry from "base-themes/shadcn-registry.json";
import buttonItem from "base-themes/registry/items/button.json";
import themeMeta from "base-themes/theme-meta.json";
import tokenContract from "base-themes/token-contract.json";
```

CLI commands:

```bash
npx base-themes list
npx base-themes plan button select block:dashboard-shell theme:enterprise
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
npx base-themes doctor .
```

`plan` explains source files, dependencies, theme attributes, and registry item metadata. `add` copies files conservatively and leaves existing files untouched unless `--force` is used. `doctor` checks package dependencies, CSS import, and theme wiring.

## Examples

- [examples/vite](./examples/vite): Vite React app using package imports.
- [examples/next](./examples/next): Next.js App Router / React 19 example.
- [examples/dashboard](./examples/dashboard): product dashboard composed from shipped blocks.
- [examples/theme-customization](./examples/theme-customization): token override and brand customization example.
- [examples/registry-copy](./examples/registry-copy): source-copy registry workflow.

## Development

```bash
npm install
npm run dev
```

Useful local routes:

```text
http://localhost:5175/components/button
http://localhost:5175/blocks
http://localhost:5175/themes
http://localhost:5175/docs/installation
http://localhost:5175/docs/registry
```

Core checks:

```bash
npm run registry:check
npm run tokens:check
npm run lint
npm run test
npm run build
npm run package:smoke
```

Release-level visual checks:

```bash
npm run themes:e2e
npm run previews:check
```

## Publishing

Releases are published from GitHub Actions with npm provenance and trusted publishing. See [RELEASE.md](./RELEASE.md) for the release checklist.

## Security

Security reports follow [SECURITY.md](./SECURITY.md). Runtime dependencies are intentionally small: `clsx` and `lucide-react`, with React and Base UI as peer dependencies.

## License

MIT

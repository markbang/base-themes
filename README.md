# base-themes

Themeable React components built on [Base UI](https://base-ui.com/), with ready-to-use Bento, shadcn, neo brutalism, and broader product UI visual styles.

`base-themes` gives you typed component wrappers, shared CSS tokens, shadcn/ui-style component docs, installable registry metadata, and block examples.

## Preview

| Theme | Preview |
| --- | --- |
| Bento | ![Bento theme preview](./public/previews/base-themes-bento.png) |
| shadcn | ![shadcn theme preview](./public/previews/base-themes-shadcn.png) |
| Neo Brutalism | ![Neo brutalism theme preview](./public/previews/base-themes-neo-brutalism.png) |
| Minimal | ![Minimal theme preview](./public/previews/base-themes-minimal.png) |
| Enterprise | ![Enterprise theme preview](./public/previews/base-themes-enterprise.png) |
| Linear | ![Linear theme preview](./public/previews/base-themes-linear.png) |
| Glass | ![Glass theme preview](./public/previews/base-themes-glass.png) |
| Terminal | ![Terminal theme preview](./public/previews/base-themes-terminal.png) |
| Material | ![Material theme preview](./public/previews/base-themes-material.png) |
| Fluent | ![Fluent theme preview](./public/previews/base-themes-fluent.png) |
| Retro | ![Retro theme preview](./public/previews/base-themes-retro.png) |
| Cyberpunk | ![Cyberpunk theme preview](./public/previews/base-themes-cyberpunk.png) |
| Editorial | ![Editorial theme preview](./public/previews/base-themes-editorial.png) |
| Calm | ![Calm theme preview](./public/previews/base-themes-calm.png) |
| Data Dense | ![Data dense theme preview](./public/previews/base-themes-data-dense.png) |
| Playful | ![Playful theme preview](./public/previews/base-themes-playful.png) |
| Luxury | ![Luxury theme preview](./public/previews/base-themes-luxury.png) |
| Soft UI | ![Soft UI theme preview](./public/previews/base-themes-soft-ui.png) |
| Bauhaus | ![Bauhaus theme preview](./public/previews/base-themes-bauhaus.png) |
| Mono | ![Mono theme preview](./public/previews/base-themes-mono.png) |

## Install

```bash
npm install base-themes @base-ui/react react react-dom
```

Import the bundled CSS once at app startup:

```tsx
import 'base-themes/styles.css'
```

Use components:

```tsx
import { Button, Select } from 'base-themes'

export function Example() {
  return (
    <div data-style="shadcn" data-theme="light">
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

## Themes

Set `data-style` for the visual style:

```html
<html data-style="bento" data-theme="light">
```

Available styles:

- `bento`: the default Bento style with warm accents and teal controls.
- `shadcn`: neutral/zinc product UI styling modeled after shadcn/ui.
- `neo-brutalism`: high-contrast chunky borders, hard shadows, and bold accent colors.
- `minimal`: Swiss-inspired whitespace, thin rules, and quiet monochrome controls.
- `enterprise`: dense operational UI with blue actions and explicit boundaries.
- `linear`: developer-tool polish with subtle gradients and refined dark mode.
- `glass`: translucent surfaces, blur, and luminous focus states.
- `terminal`: monospace command-line interface with phosphor and amber accents.
- `material`: layered Google-style surfaces with blue primary actions and soft elevation.
- `fluent`: Microsoft-style acrylic surfaces, soft blue accents, and gentle borders.
- `retro`: early desktop UI cues with chunky controls and saturated classic colors.
- `cyberpunk`: dark high-energy neon controls for expressive dashboards.
- `editorial`: magazine-like typography, ivory surfaces, and ink-forward contrast.
- `calm`: low-saturation wellness palette with relaxed controls and readable contrast.
- `data-dense`: compact analytics styling for tables, filters, and repeated workflows.
- `playful`: rounded, bright, friendly components for creative and education tools.
- `luxury`: premium surfaces, gold accents, and fine-line hierarchy.
- `soft-ui`: low-contrast tactile controls with inset and raised shadows.
- `bauhaus`: geometric composition with primary colors and strong graphic contrast.
- `mono`: black-and-white ink system with no decorative color dependency.

Set `data-theme` for color mode:

- `light`
- `dark`

You can also use the included hook in React apps:

```tsx
import { useTheme } from 'base-themes'

function ThemeToggle() {
  const { style, setStyle, resolved, setTheme } = useTheme()
  return (
    <button onClick={() => setStyle(style === 'bento' ? 'terminal' : 'bento')}>
      {style} / {resolved}
    </button>
  )
}
```

## Components

Coverage includes Base UI public component and provider primitives:

`Accordion`, `AlertDialog`, `Autocomplete`, `Avatar`, `Button`, `Checkbox`, `CheckboxGroup`, `Collapsible`, `Combobox`, `ContextMenu`, `CspProvider`, `Dialog`, `DirectionProvider`, `Drawer`, `Field`, `Fieldset`, `Form`, `Input`, `Menu`, `Menubar`, `Meter`, `NavigationMenu`, `NumberField`, `OtpField`, `Popover`, `PreviewCard`, `Progress`, `Radio`, `RadioGroup`, `ScrollArea`, `Select`, `Separator`, `Slider`, `Switch`, `Tabs`, `ToastProvider`, `Toggle`, `ToggleGroup`, `Toolbar`, and `Tooltip`.

## Registry

The package includes a shadcn/ui-style registry:

```ts
import registry from 'base-themes/registry.json'
```

The source file is [registry/registry.json](./registry/registry.json). It lists components, required files, blocks, pages, dependencies, and theme variants.

Validate it locally:

```bash
npm run registry:check
```

## Blocks

The docs app includes block examples at `/blocks`:

- Dashboard Shell
- Settings Form

Blocks are also listed in `registry/registry.json` so agents and scripts can discover their component dependencies.

## Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5175/components/button
http://localhost:5175/blocks
http://localhost:5175/themes
http://localhost:5175/docs/installation
```

Verify:

```bash
npm run registry:check
npm run lint
npm run build
npm run previews:generate
```

Build outputs:

- Docs app: `dist/index.html`
- Package JS: `dist/base-themes.js`
- Package CSS: `dist/base-themes.css`
- Types: `dist/types/lib.d.ts`

## Publishing

This repo includes GitHub Actions workflows:

- `.github/workflows/ci.yml`: runs registry validation, lint, and build on PRs and pushes to `main`.
- `.github/workflows/publish.yml`: publishes to npm on a GitHub release or manual dispatch.

Preview images are generated with `agent-browser` from `/themes?style=<style>&theme=light`.

To publish from GitHub with npm Trusted Publishing:

1. Configure npm trusted publisher for owner `markbang`, repository `base-themes`, workflow `publish.yml`, and environment `npm`.
2. Create a GitHub release for the package version, or run the publish workflow manually.
3. The publish workflow runs `npm publish --access public` using GitHub OIDC.

Manual local dry run:

```bash
npm pack --dry-run
```

## Agent Skill

An agent skill is included in the npm package and in this repo at [skills/base-themes/SKILL.md](./skills/base-themes/SKILL.md). After installing the package, the same markdown is available at:

```text
node_modules/base-themes/skills/base-themes/SKILL.md
```

The package also exposes it as `base-themes/skill` for tools that read package exports. It describes how to install from npm, add blocks, customize themes, and verify registry-driven changes.

## License

MIT

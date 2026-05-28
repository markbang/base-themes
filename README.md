# base-themes

Themeable React components built on [Base UI](https://base-ui.com/), with ready-to-use Bento, shadcn, and neo brutalism visual styles.

`base-themes` gives you typed component wrappers, shared CSS tokens, shadcn/ui-style component docs, installable registry metadata, and block examples.

## Preview

### Bento

![Bento theme preview](./public/previews/base-themes-bento.png)

### shadcn

![shadcn theme preview](./public/previews/base-themes-shadcn.png)

### Neo Brutalism

![Neo brutalism theme preview](./public/previews/base-themes-neo-brutalism.png)

## Install

```bash
npm install base-themes @base-ui/react react react-dom
```

Import the component CSS once:

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

Set `data-theme` for color mode:

- `light`
- `dark`

You can also use the included hook in React apps:

```tsx
import { useTheme } from 'base-themes'

function ThemeToggle() {
  const { style, setStyle, resolved, setTheme } = useTheme()
  return (
    <button onClick={() => setStyle(style === 'bento' ? 'shadcn' : 'bento')}>
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

To publish from GitHub:

1. Add an npm automation token as the `NPM_TOKEN` repository secret.
2. Create a GitHub release for the package version.
3. The publish workflow runs `npm publish --access public --provenance`.

Manual local dry run:

```bash
npm pack --dry-run
```

## Agent Skill

An agent skill is included at [skills/base-themes/SKILL.md](./skills/base-themes/SKILL.md). It describes how to install components, add blocks, customize themes, and verify the registry.

## License

MIT

# Theme Token Contract

Base Themes uses this document and `src/styles/tokenContract.json` as the public theme token contract for the 0.x line.

## Version

- Contract version: `0.1.0`
- Stable public prefix: `--bt-`
- Required theme attributes: `data-style` and `data-theme`
- Supported style variants are listed in `registry/registry.json` and mirrored in the standard registry artifacts under `registry/shadcn-registry.json` and `registry/items/theme-*.json`.

The package still keeps legacy variables such as `--bg`, `--surface`, `--accent`, and `--theme-focus` for compatibility. New docs, examples, registry metadata, and agent workflows should prefer the `--bt-*` tokens below.

## Public Tokens

Semantic tokens:

- `--bt-bg`: page background.
- `--bt-fg`: primary foreground text.
- `--bt-text`: default body text.
- `--bt-muted-fg`: secondary text and labels.
- `--bt-surface`: default panel or control surface.
- `--bt-surface-muted`: subtle grouped surface.
- `--bt-surface-strong`: high-contrast surface used for inverse controls.
- `--bt-border`: default border color.
- `--bt-border-strong`: higher emphasis border color.
- `--bt-primary`: primary action color.
- `--bt-primary-hover`: primary action hover or pressed color.
- `--bt-primary-fg`: text/icon color on primary actions.
- `--bt-secondary`: secondary action color.
- `--bt-secondary-fg`: text/icon color on secondary actions.
- `--bt-info`: informational accent color.
- `--bt-success`: success accent color.
- `--bt-danger`: danger/error accent color.
- `--bt-danger-fg`: text/icon color on danger actions.
- `--bt-ring`: focus ring color.

Shape and typography tokens:

- `--bt-radius`: default large radius.
- `--bt-radius-sm`: compact control radius.
- `--bt-font-sans`: sans-serif font stack.
- `--bt-font-mono`: monospace font stack.
- `--bt-shadow`: default elevated shadow.
- `--bt-shadow-strong`: high emphasis shadow.

Component alias tokens:

- `--bt-button-bg`: default button background.
- `--bt-button-fg`: default button foreground.
- `--bt-button-border`: button border color.
- `--bt-input-bg`: input background.
- `--bt-input-fg`: input foreground.
- `--bt-input-border`: input border color.
- `--bt-select-popup-bg`: select/menu popup background.
- `--bt-select-popup-fg`: select/menu popup foreground.
- `--bt-tabs-active-bg`: active tab background.
- `--bt-tabs-active-fg`: active tab foreground.

Motion and density tokens:

- `--bt-border-width`: default control border width.
- `--bt-font-weight`: default control font weight.
- `--bt-duration`: default interaction transition duration.
- `--bt-letter-spacing`: default control letter spacing.
- `--bt-control-height`: default control height for dense customization.

## Public Boundary

Treat the tokens above, `data-style`, and `data-theme` as the stable public surface. Theme-specific implementation variables without the `--bt-` prefix are compatibility aliases in the 0.x line and may be normalized before a future stable release.

Docs-only tokens such as `--topbar-bg`, `--card-bg`, and `--hero-text` belong to the documentation site shell. They are not a package component API and should not be required by consumer apps.

## Customization

Override tokens on a themed root or in app CSS after importing `base-themes/styles.css`:

```css
.brand-shell {
  --bt-primary: #2563eb;
  --bt-primary-hover: #1d4ed8;
  --bt-radius: 10px;
  --bt-radius-sm: 8px;
  --bt-font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --bt-control-height: 36px;
}

.brand-shell[data-theme='dark'] {
  --bt-bg: #0b1120;
  --bt-surface: #111827;
  --bt-fg: #f8fafc;
  --bt-primary: #60a5fa;
}
```

For current 0.x builds, the shipped CSS maps each `--bt-*` token to the matching legacy implementation token. If a component still reads a legacy token directly, override both names during migration:

```css
.brand-shell {
  --bt-primary: #2563eb;
  --accent: var(--bt-primary);
}
```

## Validation

Run the token contract check after editing theme variables, theme metadata, registry style variants, or token docs:

```bash
npm run tokens:check
```

The check verifies that every public `--bt-*` token exists in `src/styles/tokens.css`, maps to a legacy compatibility token, every registry style has token coverage plus a light or dark mode override where needed, and this documentation covers the public names.

# Base Themes Theme Customization Example

This Vite example shows how to customize Base Themes from the public package surface. It imports the package CSS once, then overrides semantic CSS tokens for brand color, radius, font, and density.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5178`.

## Verify

```bash
npm run build
```

The example intentionally imports only documented package paths:

- `base-themes`
- `base-themes/styles.css`
- `base-themes/registry.json`

Use it when validating token changes, custom brand overrides, or docs that explain `data-style`, `data-theme`, and CSS variable customization.

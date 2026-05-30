# Base Themes Vite Example

This example verifies the package install path in a fresh Vite React app with React 18.

## Run

From this directory:

```bash
npm install
npm run dev
```

When testing local package changes from the repository root, build and pack first:

```bash
npm run build
npm pack --dry-run
```

Then install the generated tarball in this example:

```bash
npm install ../../base-themes-0.1.2.tgz
npm run build
```

The app intentionally imports from the public package surface only:

- `base-themes`
- `base-themes/styles.css`
- `base-themes/registry.json`

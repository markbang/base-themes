# Base Themes Next.js Example

This example verifies that Base Themes works in a Next.js app with SSR.

## Run

From this directory:

```bash
npm install
npm run build
npm run dev
```

From the repository root, run the same build gate used by CI:

```bash
npm run example:next:build
```

The example imports only public package surfaces:

- `base-themes`
- `base-themes/styles.css`
- `base-themes/registry.json`

Theme attributes are set on `<html>` in `app/layout.tsx` so CSS variables are available before the page renders.

Next.js App Router treats files as Server Components by default. Base Themes components use client-side React hooks through Base UI primitives, so component imports live behind the `'use client'` boundary in `app/base-themes-demo.tsx`.

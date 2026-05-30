# Registry Copy Example

This example demonstrates how tools and agents can consume `base-themes/registry.json` to inspect the package registry, plan a source-copy install, preview copied files, and diagnose a consumer app.

The script mirrors the published `base-themes` CLI and resolves component names, `block:<name>` requests, and `theme:<style>` requests. It prints:

- package dependencies
- global and token CSS files
- block source files and shared block CSS
- component source files
- requested and available theme variants
- registry item imports and hosted item URLs for agent workflows

## Run

From the repository root:

```bash
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json
npm run example:registry-copy -- add button select block:dashboard-shell theme:enterprise --target . --dry-run --json
npm run example:registry-copy -- doctor examples/vite --json
```

Or run the script directly:

```bash
node examples/registry-copy/plan-copy.mjs button select block:dashboard-shell theme:enterprise
node examples/registry-copy/plan-copy.mjs list --json
node examples/registry-copy/plan-copy.mjs plan button select block:dashboard-shell theme:enterprise --json
node examples/registry-copy/plan-copy.mjs add button select block:dashboard-shell theme:enterprise --target . --dry-run
node examples/registry-copy/plan-copy.mjs doctor examples/vite
```

The published package also exposes the same planner through the `base-themes` CLI:

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

`add` runs the conservative copy path for users who want source files in their app. It copies only registry-listed files, skips existing files by default, and requires `--force` before overwriting.

`doctor` is meant for a consumer app root. It reports missing dependencies, the CSS import, and theme attributes, then prints the next fix and bug-report link for failed checks.

Example output:

```text
Base Themes registry copy plan
Components: button, select, progress, meter
Blocks: dashboard-shell
Themes: enterprise
Dependencies: @base-ui/react, clsx, lucide-react
Style files: src/index.css, src/styles/tokens.css, src/styles/themes.css, ...
Block files:
- src/blocks/DashboardShell.tsx
- src/blocks/Blocks.css
Component files:
- src/components/ui/Button.tsx
- src/components/ui/Button.css
...
Registry item imports:
- button: base-themes/registry/items/button.json
- theme:enterprise: base-themes/registry/items/theme-enterprise.json
```

`plan` is intentionally a planner. `add` is intentionally conservative: source-copy tools should still decide lockfile behavior and app-specific formatting explicitly.

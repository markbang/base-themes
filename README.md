# base-themes

[![CI](https://github.com/markbang/base-themes/actions/workflows/ci.yml/badge.svg)](https://github.com/markbang/base-themes/actions/workflows/ci.yml)
[![npm provenance](https://img.shields.io/badge/npm-provenance-0a7)](https://docs.npmjs.com/generating-provenance-statements)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Themeable React components built on [Base UI](https://base-ui.com/), with ready-to-use Bento, shadcn, neo brutalism, and broader product UI visual styles.

`base-themes` gives you typed component wrappers, shared CSS tokens, shadcn/ui-style component docs, installable registry metadata, and block examples.

React support: React 18.2+ and React 19 are supported through peer dependencies. The Vite, dashboard, and theme-customization examples build against React 18, and the Next.js example builds against React 19.

## Why Base Themes

- **Base UI-first:** accessible behavior, focus management, keyboard interaction, and overlay primitives come from `@base-ui/react`.
- **CSS-token themes:** switch visual systems through `data-style` and `data-theme` without a heavy JavaScript theme runtime.
- **20 curated styles:** Bento, shadcn, enterprise, terminal, glass, data-dense, luxury, mono, and more.
- **Registry-ready:** components, blocks, pages, files, dependencies, and theme variants are discoverable through `base-themes/registry.json`.
- **Agent-friendly:** the package includes `base-themes/skill` so coding agents can install, inspect, customize, and verify changes consistently.

Project links:

- Repository: <https://github.com/markbang/base-themes>
- Issues: <https://github.com/markbang/base-themes/issues>
- Upstream primitives: <https://base-ui.com/>

## Quick Start

```bash
npm install base-themes @base-ui/react react react-dom
```

```tsx
import 'base-themes/styles.css'
import { Button } from 'base-themes'

export function App() {
  return (
    <main data-style="bento" data-theme="light">
      <Button>Ship it</Button>
    </main>
  )
}
```

After trying it in a real app, leave the smallest useful public signal:

- Star the repo: <https://github.com/markbang/base-themes>
- Fork and try a theme, block, or docs change: <https://github.com/markbang/base-themes/fork>
- Share what worked or what was missing: <https://github.com/markbang/base-themes/discussions/new?category=show-and-tell>
- Request the component, block, or theme that would make it usable: <https://github.com/markbang/base-themes/issues/new?template=feature_request.yml>
- Submit a real screenshot or repository for the future gallery: <https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml>

## Fork-To-First-Change

If you want to test whether Base Themes fits your product, fork the repo and make one visible change before opening an issue or PR:

```bash
git clone https://github.com/<your-user>/base-themes.git
cd base-themes
npm install
npm run example:theme-customization:build
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json
npm run package:smoke
```

Good first fork experiments:

- Change a few brand tokens in `examples/theme-customization/src/App.tsx`, then submit a gallery issue with the result if it maps to a real app.
- Adapt one block in `src/blocks` or `examples/dashboard/src/App.tsx`, then open a Show and tell Discussion with what was missing.
- Run `npm run community:issues` and comment on one good-first issue before opening a focused PR.

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

Strict TypeScript projects may need a CSS side-effect declaration:

```ts
declare module 'base-themes/styles.css'
```

Use components:

```tsx
import { Button, Select } from 'base-themes'

export function Example() {
  return (
    <main data-style="shadcn" data-theme="light">
      <Button>Save changes</Button>
      <Select
        id="density"
        label="Density"
        defaultValue="comfortable"
        items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
      />
    </main>
  )
}
```

Portaled components such as `Select`, `Combobox`, `Dialog`, `Popover`, and `Tooltip` render outside nested wrappers. Apply `data-style` and `data-theme` on `html`, `body`, your app shell, or the portal container so overlays inherit the same theme.

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
import shadcnRegistry from 'base-themes/shadcn-registry.json'
import buttonItem from 'base-themes/registry/items/button.json'
import blockMeta from 'base-themes/block-meta.json'
import componentMeta from 'base-themes/component-meta.json'
import staticPageMeta from 'base-themes/static-page-meta.json'
import themeMeta from 'base-themes/theme-meta.json'
```

The internal source-copy registry is [registry/registry.json](./registry/registry.json). It lists components, required files, blocks, pages, dependencies, and theme variants. The generated [registry/shadcn-registry.json](./registry/shadcn-registry.json) catalog and [registry/items](./registry/items) item files expose shadcn-compatible `registry:ui`, `registry:block`, and `registry:theme` entries with `meta.agent` guidance for tools that prefer item-level metadata. Package consumers can import item JSON through `base-themes/registry/items/<name>.json`, such as `base-themes/registry/items/button.json` or `base-themes/registry/items/block-dashboard-shell.json`.

When the docs site is deployed, the same machine-readable artifacts are available at stable HTTPS URLs for tools and agents that prefer remote metadata:

```text
https://base-themes.bangwu.me/registry/registry.json
https://base-themes.bangwu.me/registry/shadcn-registry.json
https://base-themes.bangwu.me/registry/items/button.json
https://base-themes.bangwu.me/registry/block-meta.json
https://base-themes.bangwu.me/registry/component-meta.json
https://base-themes.bangwu.me/registry/theme-meta.json
```

The docs deployment also publishes agent-oriented discovery files at `https://base-themes.bangwu.me/llms.txt` and `https://base-themes.bangwu.me/llms-full.txt` with install, registry, CLI, component, theme, block, token, and verification entry points.

Block docs metadata is available at [src/docs/blockMeta.json](./src/docs/blockMeta.json) and through the `base-themes/block-meta.json` export. Component SEO/docs metadata is available at [src/docs/componentMeta.json](./src/docs/componentMeta.json) and through the `base-themes/component-meta.json` export. Static docs route metadata is available at [src/docs/staticPageMeta.json](./src/docs/staticPageMeta.json) and through `base-themes/static-page-meta.json`. The docs app, SEO generator, and registry validation use this shared metadata so routes do not depend on parsing JSX.

Theme SEO/docs metadata is available at [src/docs/themeMeta.json](./src/docs/themeMeta.json) and through the `base-themes/theme-meta.json` export. The docs app publishes shareable theme routes such as `/themes/bento`, `/themes/enterprise`, and `/themes/terminal` from that metadata.

The public theme token contract is available at [src/styles/tokenContract.json](./src/styles/tokenContract.json), documented in [docs/theme-token-contract.md](./docs/theme-token-contract.md), and exported as `base-themes/token-contract.json`. Prefer the stable `--bt-*` tokens for new theme customization while keeping legacy variables compatible during the 0.x line.

Standalone docs pages cover install, positioning, comparison, token architecture, accessibility, migration, design handoff, security and release trust, theming, theme customization, registry/source-copy, CLI usage, agent usage, runnable examples, and contribution workflows at `/docs/installation`, `/docs/why-base-themes`, `/docs/base-ui-vs-shadcn`, `/docs/token-system`, `/docs/accessibility`, `/docs/migration-guide`, `/docs/design-handoff`, `/docs/security`, `/docs/theming`, `/docs/theme-customization`, `/docs/registry`, `/docs/cli`, `/docs/agent-usage`, `/docs/examples`, and `/docs/contributing`.

Validate it locally:

```bash
npm run registry:check
npm run tokens:check
```

Inspect the package registry or generate a source-copy plan from npm:

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

`plan` resolves source files plus item-level registry guidance: package JSON import paths such as `base-themes/registry/items/button.json`, hosted item URLs such as `/registry/items/block-dashboard-shell.json` and `/registry/items/theme-enterprise.json`, block `meta.agent.registryItems`, theme `data-style` steps, and the generated `meta.agent.packageInstall` / `meta.agent.sourceCopy` steps. Use `--json` when an agent or internal tool needs structured output instead of terminal text.

`add` executes the conservative source-copy path from the same plan. It copies registry-listed style, block, and component files into `--target`, leaves existing files untouched by default, supports `--dry-run`, and requires `--force` before overwriting local files.

`doctor` checks dependencies, the CSS side-effect import, and `data-style` / `data-theme` wiring. Failed checks include a concrete fix and a bug-report link so first-time integration issues can become actionable feedback.

Registry consumers should treat component files, CSS token files, dependencies, pages, blocks, and theme variants as one contract. When adding public components, blocks, or styles, update the registry in the same change.

## Blocks

The docs app includes block examples at `/blocks` and shareable block detail routes such as `/blocks/dashboard-shell`, `/blocks/auth-card`, and `/blocks/data-table`. The package ships source-copyable block files under [src/blocks](./src/blocks):

- Dashboard Shell
- Settings Form
- Auth Card
- Pricing Panel
- Data Table
- Command Palette
- Team Activity Feed
- Theme Showcase Card

Blocks are listed in `registry/registry.json` with categories, descriptions, SEO routes, source files, shared CSS, and component dependencies. They are also exported from `base-themes` for package consumers:

```tsx
import { DashboardShell, SettingsForm } from 'base-themes'
```

## Examples

Runnable examples provide fresh-install confidence and registry workflow proof:

- [examples/vite](./examples/vite): Vite React 18 app importing `base-themes`, `base-themes/styles.css`, and `base-themes/registry.json` from the public package surface.
- [examples/next](./examples/next): Next.js App Router / React 19 example that imports Base Themes CSS in `app/layout.tsx` and renders package components on a server-rendered page.
- [examples/dashboard](./examples/dashboard): Vite React 18 product dashboard example composed from shipped blocks, controls, registry metadata, and theme switching.
- [examples/theme-customization](./examples/theme-customization): Vite React 18 theme customization example for CSS token overrides, brand color, radius, font, density, and copyable variables.
- [examples/registry-copy](./examples/registry-copy): CLI-aligned registry workflow that lists items, plans source-copy installs, previews copied files, and runs install diagnostics for copy-based tools.

Verify them locally:

```bash
npm run example:vite:build
npm run example:next:build
npm run example:dashboard:build
npm run example:theme-customization:build
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json
```

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
http://localhost:5175/themes/enterprise
http://localhost:5175/docs/installation
http://localhost:5175/docs/why-base-themes
http://localhost:5175/docs/base-ui-vs-shadcn
http://localhost:5175/docs/token-system
http://localhost:5175/docs/accessibility
http://localhost:5175/docs/migration-guide
http://localhost:5175/docs/design-handoff
http://localhost:5175/docs/security
http://localhost:5175/docs/theming
http://localhost:5175/docs/theme-customization
http://localhost:5175/docs/registry
http://localhost:5175/docs/cli
http://localhost:5175/docs/agent-usage
http://localhost:5175/docs/examples
http://localhost:5175/docs/contributing
```

Verify:

```bash
npm run registry:check
npm run tokens:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run bundle:report
npm run bundle:report -- --json
npm run package:smoke
npm run example:vite:build
npm run example:next:build
npm run example:dashboard:build
npm run example:theme-customization:build
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run previews:check
npm run previews:generate
```

`npm run test` covers core Button rendering, Select option selection, Dialog open/close behavior, `useTheme` persistence, and axe accessibility regressions for common controls, dialogs, and tabs. `npm run bundle:report -- --json` emits machine-readable app JS, largest JS, total JS, gzip sizes, and budget checks so website performance can be tracked as a growth-health signal. `npm run themes:e2e` and `npm run previews:check` are available for release-level theme, interaction, contrast, and screenshot-diff checks. They require `agent-browser`.

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

See [RELEASE.md](./RELEASE.md) for the full release checklist.
Use [docs/release-announcement-kit.md](./docs/release-announcement-kit.md) after publish to turn each release into a measurable adoption push with announcement copy, channel checklist, calls to action, and follow-up telemetry.
Use `npm run release:announce` before sharing a release so social, forum, directory, GitHub release, command, and call-to-action copy reflects current registry counts.
Use [docs/search-console-setup.md](./docs/search-console-setup.md) after the docs deploy to submit the sitemap, inspect high-intent routes, and track search queries for theme, component, registry, and Base UI comparison pages.

## Contributing

Contributions are welcome when they keep source, docs, registry metadata, and theme behavior aligned.

Start with [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup and checklists for components, themes, blocks, and docs. Use the GitHub issue templates for bug reports, feature requests, and component/theme/block proposals.

Maintainers can use [docs/contributor-issue-seeds.md](./docs/contributor-issue-seeds.md) to publish a small set of good-first issues before release announcements. The seeds focus on adoption-funnel work: installation clarity, accessibility examples, theme customization, registry planning, block variants, and community gallery guidance.

The GitHub label vocabulary lives in [.github/labels.json](./.github/labels.json). Run `npm run community:check` after changing issue templates, contributor seed issues, or gallery submission wording so public contribution paths stay consistent. Maintainers can run `npm run community:issues` before announcements to render prefilled good-first issue URLs or GitHub CLI commands from the seed backlog.

The community gallery plan lives in [docs/community-gallery-proposal.md](./docs/community-gallery-proposal.md). It defines the discussion-first feedback path, issue-based submission model, and launch criteria for featuring external Base Themes usage. Real projects can start in the `Show and tell` Discussion template, then move to the Community gallery issue template when the submitter grants permission to feature the work.

## Built with Base Themes

The project accepts real usage examples through GitHub Discussions and the Community gallery issue template. A useful discussion or submission includes a product screenshot, public URL or repository when available, the Base Themes version, the selected `data-style`, and the components or blocks used.

The gallery is intentionally issue-first until there is enough external usage to publish a curated docs page. Accepted examples may be featured in README, docs, or a future `/showcase` route after permission is confirmed in the issue.

Good first contribution areas:

- Add focused component examples and accessibility notes.
- Improve registry metadata and docs parity.
- Add real blocks built from existing components.
- Improve theme token coverage and preview quality.
- Add fresh Vite or Next.js examples.

## Security and Release Trust

- Security reports follow [SECURITY.md](./SECURITY.md).
- The docs site publishes the same trust posture at `/docs/security`.
- Releases are published from GitHub Actions with npm provenance.
- CI runs registry validation, lint, and build on pull requests and pushes to `main`.
- Dependabot is configured for npm and GitHub Actions updates.
- Runtime dependencies are intentionally small: `clsx` and `lucide-react`, with React and Base UI as peer dependencies.

## Semver Policy

Base Themes follows semver for package consumers and registry consumers.

- Patch releases fix bugs, docs, metadata, examples, tests, and theme contrast issues without changing public APIs.
- Minor releases may add components, blocks, theme styles, props, registry entries, docs routes, and non-breaking token aliases.
- Major releases are required for removing exports, changing required peer dependency ranges, renaming public CSS classes or tokens, changing component prop meaning, deleting registry fields, or changing the `data-style` / `data-theme` contract.

Visual refinements inside an existing theme can ship as patch or minor changes when the public token names and component contracts stay compatible. Release notes should call out any visible theme changes so users can decide whether to update screenshots or visual baselines.

## Telemetry

Adoption should be measured with repeatable public signals instead of guesses:

```bash
npm run telemetry:collect
npm run telemetry:check
npm run telemetry:check -- --live
npm run telemetry:fixtures
npm run launch:status
npm run launch:status -- --live
npm run launch:actions
npm run launch:actions -- --live
npm run launch:campaign
```

The script writes `research/telemetry-YYYY-MM-DD.md` and `research/telemetry-YYYY-MM-DD.json` with public GitHub and npm metrics. `telemetry:check` validates the latest saved machine-readable adoption gate: four public signals, a three-signal completion threshold, `externallyValidated` derived from the score, and no telemetry collection errors; use `telemetry:check -- --live` to validate a fresh no-write GitHub/npm collection. `telemetry:fixtures` imports sample Search Console, website analytics, registry access, community proof, and bundle performance exports from `research/telemetry-fixtures` so provider-export parsing stays mechanically tested. `launch:status` reads the latest telemetry JSON and summarizes the current public score, previous-report signal trend, missing signals, recommended good-first issue URLs, telemetry collection errors, and next launch actions; use `launch:status -- --live` before external promotion to pull current GitHub/npm signals without writing a report. `launch:actions` turns the missing signals into a concrete star, fork, external issue/PR, or download action list with links, commands, recommended good-first issue URLs, share assets, previous-report signal trend, a promotion wave, and a campaign checklist. `launch:campaign` writes the live campaign JSON and Markdown action pack to `research/` for external posting and T+1/T+7/T+30 follow-up. When `GITHUB_TOKEN` has repository traffic permission, telemetry also collects GitHub views, clones, top referrers, and popular paths. The report keeps explicit gaps for website analytics, Search Console, registry usage, and bundle performance that need provider or build output access. Search Console setup and route inspection are covered in [docs/search-console-setup.md](./docs/search-console-setup.md).

For automation, read the JSON output directly:

```bash
node scripts/collect-telemetry.mjs --json
```

Search Console exports can be included without Google API credentials:

```bash
SEARCH_CONSOLE_EXPORT=path/to/search-console-export.csv npm run telemetry:collect
```

Sanitized website analytics exports can be included the same way:

```bash
ANALYTICS_EXPORT=path/to/analytics-events.jsonl npm run telemetry:collect
```

Registry and agent access logs can be summarized when CDN/server exports are available:

```bash
REGISTRY_ACCESS_EXPORT=path/to/registry-access.jsonl npm run telemetry:collect
```

See [docs/registry-access-telemetry.md](./docs/registry-access-telemetry.md) for the tracked registry, `llms.txt`, `llms-full.txt`, CLI, and agent workflow routes.

Community proof exports can be included after users open Show and tell Discussions, gallery submissions, external repos, or public project URLs:

```bash
COMMUNITY_PROOF_EXPORT=path/to/community-proof.csv npm run telemetry:collect
```

See [docs/community-proof-telemetry.md](./docs/community-proof-telemetry.md) for the supported CSV/JSON fields and interpretation rules.

Bundle performance can be included after a docs build:

```bash
npm run build
npm run bundle:report -- --json > path/to/bundle-report.json
BUNDLE_REPORT_EXPORT=path/to/bundle-report.json npm run telemetry:collect
```

The adoption completion gate is tracked in [docs/adoption-dashboard.md](./docs/adoption-dashboard.md) and summarized in [docs/release-announcement-kit.md](./docs/release-announcement-kit.md): treat the strategy as externally validated only when at least three public signals pass across npm downloads, GitHub stars, external issues or PRs, and forks. Local checks prove release readiness, not user willingness.

The docs site can also emit privacy-light product-funnel events when `VITE_ANALYTICS_ENDPOINT` is configured at build time. No events are sent by default. Event payloads contain only event name, path, timestamp, and small non-identifying properties.

See [docs/analytics-setup.md](./docs/analytics-setup.md) for the optional Cloudflare Worker receiver, deployment model, privacy boundary, and local verification command:

```bash
npm run analytics:check
```

Tracked event names:

- `route_view`
- `internal_navigation`
- `install_command_copy`
- `github_outbound_click`
- `theme_style_cycle`
- `theme_style_select`
- `theme_snippet_copy`
- `color_theme_toggle`
- `block_share_copy`

## Agent Skill

An agent skill is included in the npm package and in this repo at [skills/base-themes/SKILL.md](./skills/base-themes/SKILL.md). After installing the package, the same markdown is available at:

```text
node_modules/base-themes/skills/base-themes/SKILL.md
```

The package also exposes it as `base-themes/skill` for tools that read package exports. It describes how to install from npm, add blocks, customize themes, and verify registry-driven changes.

## License

MIT

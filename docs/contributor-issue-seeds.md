# Contributor Issue Seeds

Use these issue seeds to create a small public backlog for first-time contributors. They are intentionally scoped to adoption-funnel work: each issue should help a new user install, understand, customize, verify, or share Base Themes.

Apply labels from the project vocabulary where possible:

- `type: docs`, `type: feature`, `type: component`, `type: theme`, `type: block`, `type: registry`, `type: accessibility`
- `area: docs`, `area: website`, `area: components`, `area: tokens`, `area: examples`, `area: ci`
- `type: good first issue`, `type: help wanted`
- `priority: low`, `priority: medium`

The label vocabulary is versioned in [.github/labels.json](../.github/labels.json). Run `npm run community:check` after changing this file, issue templates, or the label manifest so seed issues stay publishable without label drift.

Render prefilled issue URLs before a release announcement:

```bash
npm run community:issues
npm run community:issues -- --json
npm run community:issues -- --gh
```

`community:issues` does not publish anything by itself. It turns the seed issues below into prefilled GitHub URLs, JSON for release tooling, or `gh issue create` commands for maintainers with GitHub CLI access.

## Seed 1: Add a Focused Button Accessibility Example

Title:

```text
[Docs]: Add a Button accessibility example for loading and disabled states
```

Labels:

```text
type: docs, type: accessibility, area: components, type: good first issue
```

Body:

```md
## Problem

New users can render `Button`, but the docs should show how to handle common accessible states such as `disabled`, pending actions, and icon-only labels.

## Scope

- Add one concise Button example to the component docs.
- Include disabled and loading/pending usage.
- Include an icon-only button with an accessible label if the existing Button API supports it.
- Keep the example copy-pasteable.

## Acceptance Criteria

- The docs route still builds.
- The example uses public `base-themes` exports only.
- `npm run lint` and `npm run build` pass.
```

## Seed 2: Add a Theme Token Customization Recipe

Title:

```text
[Docs]: Add a copy-paste theme token customization recipe
```

Labels:

```text
type: docs, type: theme, area: tokens, type: good first issue
```

Body:

```md
## Problem

Users can switch `data-style`, but they need a short recipe for overriding a few CSS variables without forking the whole theme.

## Scope

- Add a docs example that customizes primary color, radius, and surface tokens.
- Explain where the CSS should live in a Vite or Next app.
- Link the recipe from the theming or theme customization docs route.

## Acceptance Criteria

- The recipe is copy-pasteable.
- It preserves the `data-style` / `data-theme` contract.
- `npm run lint`, `npm run build`, and `npm run seo:check` pass.
```

## Seed 3: Add a Vite Install Troubleshooting Note

Title:

```text
[Docs]: Add Vite troubleshooting for CSS imports and peer dependencies
```

Labels:

```text
type: docs, area: examples, type: good first issue
```

Body:

```md
## Problem

Fresh Vite users may miss the required `base-themes/styles.css` side-effect import or install mismatched React/Base UI peer dependencies.

## Scope

- Add a short troubleshooting section to the Vite example README or installation docs.
- Cover missing styles, TypeScript CSS module declarations, and peer dependency versions.
- Keep commands current with the package README.

## Acceptance Criteria

- `examples/vite` still builds.
- The docs do not duplicate large README sections.
- `npm run example:vite:build` passes.
```

## Seed 4: Add a Registry Plan Example for a Real Screen

Title:

```text
[Registry]: Document a source-copy plan for a dashboard screen
```

Labels:

```text
type: registry, area: docs, type: good first issue
```

Body:

```md
## Problem

The CLI can generate a registry plan, but users need a concrete example that maps a product screen to components, blocks, files, and dependencies.

## Scope

- Add one docs snippet that runs `npx base-themes plan button select tabs block:dashboard-shell theme:enterprise --json`.
- Explain what the plan output means for copy-based workflows.
- Link to the dashboard block route and CLI docs.

## Acceptance Criteria

- The command works against the current registry.
- `npm run example:registry-copy -- plan button select tabs block:dashboard-shell theme:enterprise --json` passes.
- `npm run registry:check` passes.
```

## Seed 5: Add a Small Block Variant

Title:

```text
[Block]: Add a compact metrics strip block
```

Labels:

```text
type: block, area: components, type: help wanted, priority: medium
```

Body:

```md
## Problem

Dashboards often need a compact metrics strip. A small block variant gives users another realistic starting point without adding a full template.

## Scope

- Build a responsive metrics strip from existing Base Themes components and CSS tokens.
- Add the block source under `src/blocks`.
- Add a registry entry with files and dependencies.
- Add a docs preview or include it in the blocks route.

## Acceptance Criteria

- The block works in light and dark mode.
- The block is keyboard-safe and does not depend on private docs-only APIs.
- `npm run registry:check`, `npm run lint`, and `npm run build` pass.
```

## Seed 6: Improve Community Gallery Submission Guidance

Title:

```text
[Docs]: Add a minimal community gallery submission example
```

Labels:

```text
type: docs, area: website, type: good first issue
```

Body:

```md
## Problem

The gallery issue template exists, but users may not know what a useful submission looks like.

## Scope

- Add one example submission to `docs/community-gallery-proposal.md`.
- Show title, screenshot expectations, version, `data-style`, components, blocks, and permission language.
- Keep it generic and do not invent a real user/project.

## Acceptance Criteria

- The example helps users submit real projects without adding fake gallery entries.
- The docs continue to state that the gallery should launch only after enough external usage exists.
```

## Publishing Notes

Create two or three of these issues before a release announcement. Do not flood the tracker. The goal is to give interested users a clear next action after they star, fork, or try the package.

After publishing seed issues, link the best ones from announcement replies, GitHub Discussions, or the release notes when someone asks how to help.

Suggested release sequence:

1. Run `npm run community:issues` and open two or three prefilled URLs.
2. Add `type: good first issue` or `type: help wanted` labels exactly as rendered.
3. Link the published issues from the GitHub release and launch posts.
4. Keep the remaining seeds unpublished until there is real contributor interest or repeated user feedback.

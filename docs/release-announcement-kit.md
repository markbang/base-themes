# Release Announcement Kit

Base Themes needs public adoption evidence, not just local release readiness. Use this kit after a verified release to turn the package, docs, blocks, CLI, and registry work into measurable external signals.

## Goal

Drive real users from discovery to installation, feedback, stars, forks, issues, pull requests, and gallery submissions.

The current completion gate for the strategy is external evidence that enough users are willing to use the project. Local checks can prove readiness, but they cannot prove adoption.

## Shareable Positioning

Short version:

> Accessible Base UI components. 22 themes. Registry-ready. Agent-friendly.

Long version:

> Base Themes is a type-safe React component system built on Base UI. It ships accessible component wrappers, CSS-token themes, 22 curated visual styles, source-copyable registry metadata, blocks, examples, and an agent-friendly workflow for customizing product UI.

Use these points consistently:

- Built on `@base-ui/react` accessible primitives.
- Supports React 18.2+ and React 19.
- Includes 22 visual styles through `data-style` and `data-theme`.
- Ships 40 components, 8 blocks, 18 pages, and registry metadata.
- Includes `npx base-themes list`, `plan`, `add`, and `doctor`.
- Provides Vite, dashboard, theme-customization, Next.js, and registry-copy examples.
- Published from GitHub Actions with npm provenance.

## Release Checklist Extension

Run the normal [release checklist](../RELEASE.md) first. After publish and docs deploy, complete these adoption steps:

1. Confirm the new package version is visible on npm.
2. Confirm the docs site deploy includes current SEO routes, theme pages, block pages, and CLI docs.
3. Submit and inspect search entry points with [search-console-setup.md](./search-console-setup.md) so SEO routes can produce measurable discovery signals.
4. If website funnel measurement is enabled, validate the receiver with `npm run analytics:check` and build the docs site with `VITE_ANALYTICS_ENDPOINT` from [analytics-setup.md](./analytics-setup.md).
5. If CDN or server access logs are available, prepare registry and agent-route exports with [registry-access-telemetry.md](./registry-access-telemetry.md).
6. Run `npm run build` and `npm run bundle:report -- --json > path/to/bundle-report.json` if you want the telemetry report to compare campaign conversion with bundle budgets.
7. Run `npm run telemetry:collect` or `BUNDLE_REPORT_EXPORT=path/to/bundle-report.json npm run telemetry:collect` and save the report.
8. Run `npm run launch:status -- --live` to confirm whether the public adoption gate is still unmet or externally validated against current GitHub/npm data before writing announcement copy.
9. Run `npm run launch:actions -- --live` when the gate is still unmet, or `npm run launch:campaign` when you want to write the live campaign JSON and Markdown pack to `research/`, then use the generated star, fork, and external issue/PR actions to choose the next announcement wave.
10. Run `npm run community:issues` and publish two or three seed issues from [contributor-issue-seeds.md](./contributor-issue-seeds.md), so external users have an immediate good-first action after starring or forking.
11. Enable or verify GitHub Discussions with a `Show and tell` category that uses [.github/DISCUSSION_TEMPLATE/show-and-tell.yml](../.github/DISCUSSION_TEMPLATE/show-and-tell.yml), so lightweight usage posts do not need to become permissioned gallery issues immediately.
12. Run `npm run release:announce` to render current-count release, social, forum, directory, command, and call-to-action copy from `package.json` and `registry/registry.json`.
13. Run `npm run launch:check` to verify release copy, contributor seed issue URLs, community links, telemetry docs, and the public adoption gate before sharing externally.
14. Create a GitHub release with the announcement copy below or the generated copy, then link one or two published seed issues.
15. Pin or feature one screenshot that shows a real block, not only swatches.
16. Share the release in at least three external channels.
17. Ask for one concrete action in each post: star the repo after trying it, fork it and run the Fork-to-first-change workflow, try `npx base-themes add button select --target . --dry-run`, run `npx base-themes doctor .`, open a Show and tell Discussion, submit a gallery issue, or comment on a good-first issue.
18. Re-run `npm run telemetry:collect` and `npm run launch:status` after 24 hours, 7 days, and 30 days.
19. Record which channels produced stars, forks, issues, PRs, discussions, gallery submissions, npm download slope, search impressions, registry/agent requests, docs traffic, or bundle-performance-related conversion changes.

The generated channel checklist and channel copy include `utm_campaign`, `utm_source`, `utm_medium`, and `utm_content` on each `primaryLink`. Use the attributed links from the copy instead of replacing them with bare repo or docs URLs when website analytics is enabled, so `npm run telemetry:collect` can summarize top campaigns, sources, mediums, and campaign/source conversion funnels from route views, install command copies, and GitHub outbound clicks.

The generated announcement and launch-action JSON also include `shareAssets`: attributed block, theme, comparison, and CLI routes paired with preview image URLs and usage guidance for social posts, forums, and devtool directories. Each generated channel checklist entry includes `shareAssetIds` so the launch-action output maps every promotion channel to the exact screenshots or routes to use. `launch:status` and `launch:actions` include `signalTrends` from the previous telemetry report when one exists, including older Markdown-only reports, so each wave can compare public signal slope instead of only one snapshot. `launch:actions` also emits a `promotionWave` that binds each channel to its ready-to-post copy, target adoption signals, attributed primary link, share assets, action, and measurement plan, plus a `campaignChecklist` for pre-promotion checks, channel execution, and T+1/T+7/T+30 telemetry follow-up. Each checklist item includes record fields for post URLs, publish timestamps, telemetry report paths, status scores, and decision notes.

`launch:campaign` writes dated files under `research/`. If a campaign Markdown file already contains filled record fields such as `Post URL:` or `Telemetry report path:`, the command refuses to overwrite it. Move filled evidence to a separate ledger or rerun with `--force` only when replacing the filled evidence is intentional.

The write path also refuses to save a campaign pack when telemetry is incomplete. Rerun after GitHub/npm telemetry succeeds, or pass `--allow-incomplete` only when intentionally saving a diagnostic pack that must not be used as complete adoption evidence.

## Announcement Assets

Recommended screenshots or routes to share:

- `/themes/bento` for the default visual system.
- `/themes/enterprise` for operational product UI.
- `/themes/terminal` for a distinctive developer-tool style.
- `/blocks/dashboard-shell` for a product-screen proof point.
- `/blocks/data-table` for dense workflow credibility.
- `examples/dashboard` for a runnable product-screen package integration.
- `examples/theme-customization` for token override, brand color, radius, font, and density customization.
- `/docs/cli` for registry and source-copy workflow proof.

Recommended commands to include:

```bash
npm install base-themes @base-ui/react react react-dom
npx base-themes list
npx base-themes list --json
npx base-themes plan button select block:dashboard-shell theme:enterprise
npx base-themes plan button select block:dashboard-shell theme:enterprise --json
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json
npx base-themes doctor .
npx base-themes doctor . --json
npm run example:theme-customization:build
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json
```

Render current release copy from source data:

```bash
npm run release:announce
npm run release:announce -- --json
npm run launch:check
npm run telemetry:check -- --live
npm run launch:status
npm run launch:status -- --live
npm run launch:actions
npm run launch:actions -- --live
npm run launch:actions -- --live --write
npm run launch:campaign
```

## GitHub Release Draft

```md
Base Themes now ships as a Base UI-first React theme component system with:

- 40 typed React components built on `@base-ui/react`
- 22 CSS-token visual styles with light and dark modes
- 8 source-copyable product blocks
- shadcn-style registry metadata for components, blocks, pages, and themes
- CLI helpers: `list`, `plan`, `add`, and `doctor`
- Vite, dashboard, theme-customization, Next.js, and registry-copy examples
- axe, package smoke, SEO, registry, and theme preview checks

Try it:

```bash
npm install base-themes @base-ui/react react react-dom
npx base-themes doctor .
```

Useful links:

- Docs: https://base-themes.bangwu.me
- Registry: https://base-themes.bangwu.me/registry/registry.json
- Agent discovery: https://base-themes.bangwu.me/llms.txt
- Full agent context: https://base-themes.bangwu.me/llms-full.txt
- Blocks: https://base-themes.bangwu.me/blocks
- CLI: https://base-themes.bangwu.me/docs/cli

If you try it, please star or fork the repo, open an issue for missing components or rough edges, start a Show and tell Discussion, or submit a real usage example through the community gallery issue template.
```

## Social Drafts

### X / Bluesky

```text
I shipped a stronger Base Themes release:

- Base UI-first React components
- 22 CSS-token visual styles
- 8 product blocks
- shadcn-style registry metadata
- CLI: list, plan, add, doctor, and JSON output for agents
- React 18 + 19 support

Try:
npx base-themes doctor .

https://github.com/markbang/base-themes
```

### Hacker News / Reddit

```text
Show HN: Base Themes - accessible Base UI React components with 22 themes

Base Themes is an open-source React component system built on @base-ui/react. It provides typed wrappers, CSS-variable themes, 22 curated visual styles, source-copyable registry metadata, product blocks, and CLI helpers for checking integration.

The project is package-first rather than template-first: install from npm, import one CSS file, set data-style/data-theme, and use the components or blocks. It also ships registry metadata for tools that prefer source-copy workflows.

The part I am most interested in getting feedback on: does the Base UI-first + registry + agent-friendly workflow solve a real gap for teams that like shadcn-style ownership but want a packaged multi-theme system?

Repo: https://github.com/markbang/base-themes
Docs: https://base-themes.bangwu.me
```

### Product Hunt / Directory Submission

```text
Base Themes is a React component system built on Base UI. It ships accessible typed components, 22 CSS-token visual styles, source-copyable registry metadata, product blocks, and CLI checks for integrating the package into Vite or Next.js apps.
```

## Calls To Action

Rotate calls to action instead of asking for everything at once:

- Star the repo if the Base UI-first direction is useful.
- In social, forum, and directory posts, phrase the star ask as evidence after trying the package, not as generic promotion.
- Run `npx base-themes add button select --target . --dry-run` or `npx base-themes doctor .` in a Vite or Next.js app and report rough edges.
- Pick one published good-first issue from `npm run community:issues` output and comment before opening a PR.
- Open an issue for the component, block, or theme that would make the package usable in a real project.
- Open a Show and tell Discussion with what worked, what was missing, and which `data-style` you used.
- Submit a screenshot or repo through the community gallery template after using Base Themes.
- Fork the repo if you want to add a theme, block, or docs example, then run the Fork-to-first-change workflow with `npm run example:theme-customization:build` or `npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json` before sharing the result.

## Adoption Completion Gate

Treat the strategy as externally validated only when at least three of these four public signals pass in a telemetry report:

| Signal | Threshold | Source |
| --- | --- | --- |
| npm weekly downloads | `>= 100` and stable or growing | `npm run telemetry:collect` |
| GitHub stars | `>= 10` | `npm run telemetry:collect` |
| External issues or PRs | At least one non-maintainer issue or PR beyond release automation | `npm run telemetry:collect` plus issue review |
| Forks | `>= 1` | `npm run telemetry:collect` |

Use private analytics as supporting evidence when available:

- Cloudflare unique visitors and route views.
- GitHub outbound clicks from docs, grouped by `repo-star`, `repo-fork`, `show-and-tell`, `feature-request`, `bug-report`, and `gallery-submission` targets.
- Install command copies.
- Theme, block, and CLI page depth.
- Registry artifact requests, `/llms.txt` requests, and `/llms-full.txt` requests.
- Search Console impressions and queries.
- Community gallery submissions.

## Follow-Up Telemetry Schedule

Collect and compare telemetry at:

- T+0: immediately after publish and docs deploy.
- T+1 day: early social response.
- T+7 days: npm weekly download slope and GitHub activity.
- T+30 days: sustained interest, search indexing, and community submissions.

Each pass should answer:

- Which channel produced measurable activity?
- Which route or screenshot earned the most interest?
- What blocked installation or first use?
- What component, block, or theme did users ask for repeatedly?
- Should the next iteration improve package reliability, blocks, docs SEO, or agent-native registry workflow?

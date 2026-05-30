# Search Console Setup

Use this checklist after the docs site is deployed. It turns the SEO route work into measurable search evidence for the adoption dashboard.

## Goal

Prove that Base Themes can be discovered from search, not only from direct links or npm.

Search evidence is supporting evidence for adoption. It does not replace the public completion gate in [adoption-dashboard.md](./adoption-dashboard.md), but it helps explain why npm downloads, stars, forks, and issues are moving or stalled.

## Property Setup

1. Add `https://base-themes.bangwu.me` as a URL-prefix property in Google Search Console.
2. Verify ownership with the Cloudflare-recommended method available to the maintainer account.
3. Submit the sitemap:

```text
https://base-themes.bangwu.me/sitemap.xml
```

4. Confirm the generated robots file is reachable:

```text
https://base-themes.bangwu.me/robots.txt
```

5. Confirm the agent discovery file is reachable:

```text
https://base-themes.bangwu.me/llms.txt
```

## URL Inspection Queue

Request indexing for the routes most likely to convert searchers into users:

| Route | Why It Matters |
| --- | --- |
| `/` | Primary package positioning and install path. |
| `/docs/installation` | Highest-intent install query target. |
| `/docs/base-ui-vs-shadcn` | Comparison query target for Base UI and shadcn users. |
| `/docs/registry` | Registry/source-copy workflow target. |
| `/docs/cli` | CLI and integration-check workflow target. |
| `/docs/agent-usage` | Agent-native workflow target. |
| `/docs/examples` | Fresh-install examples and framework integration target. |
| `/themes` | Theme discovery hub. |
| `/themes/bento` | Default visual system and social preview route. |
| `/themes/enterprise` | Operational SaaS/product UI query target. |
| `/themes/terminal` | Distinctive developer-tool style query target. |
| `/blocks` | Blocks discovery hub. |
| `/blocks/dashboard-shell` | Product-screen proof point. |
| `/blocks/data-table` | Dense workflow proof point. |
| `/components/button` | Common component query target. |
| `/components/select` | Accessibility and form-control query target. |
| `/components/dialog` | Overlay/focus-management query target. |

## Query Categories

Track queries by intent instead of only watching total impressions:

| Category | Example Queries | Useful When |
| --- | --- | --- |
| Brand | `base themes`, `base-themes`, `markbang base themes` | Confirms announcements create branded demand. |
| Base UI | `base ui themes`, `base ui react components`, `base ui component library` | Confirms the primary positioning is discoverable. |
| shadcn comparison | `base ui vs shadcn`, `shadcn base ui`, `shadcn registry themes` | Confirms comparison content reaches high-intent users. |
| Registry | `react component registry`, `shadcn style registry`, `llms.txt ui library` | Confirms source-copy and agent metadata work as acquisition hooks. |
| Theme styles | `react terminal theme`, `enterprise react ui theme`, `data dense dashboard ui` | Confirms visual styles create long-tail discovery. |
| Components | `base ui button theme`, `accessible react select`, `react dialog base ui` | Confirms component docs are discoverable. |

## Metrics To Record

Record these values beside each telemetry pass in `research/telemetry-YYYY-MM-DD.md` or in the release notes:

| Metric | Healthy Early Signal |
| --- | --- |
| Indexed pages | Sitemap routes start appearing as indexed instead of discovered-only. |
| Total impressions | Growing week over week after announcements and indexing. |
| Clicks | Any non-zero clicks for install, comparison, registry, CLI, theme, or block pages. |
| CTR | Pages with impressions but low CTR need title and description adjustments. |
| Average position | Long-tail pages moving into top 30 are candidates for deeper examples. |
| Top queries | Queries should map to Base UI, shadcn comparison, registry, theme, or component intent. |
| Top pages | Clicks should not land only on the homepage; docs, themes, blocks, and components should earn depth. |

To include exported Search Console rows in the telemetry report, export a query or page performance CSV/JSON from Search Console and run:

```bash
SEARCH_CONSOLE_EXPORT=path/to/search-console-export.csv npm run telemetry:collect
```

The importer accepts common columns such as `Query`, `Page`, `Clicks`, `Impressions`, `CTR`, and `Position`, plus Search Console API-style JSON rows with `keys`, `clicks`, `impressions`, `ctr`, and `position`.

## Launch-Day Checklist

After each release announcement:

1. Run `npm run build && npm run seo:check` before deploy.
2. Deploy the docs site.
3. Open `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/registry/registry.json`, and one theme page from production.
4. Submit the sitemap in Search Console.
5. Request indexing for the URL inspection queue above.
6. Share the routes listed in [release-announcement-kit.md](./release-announcement-kit.md) so Search Console can correlate announcement demand with landing pages.
7. Check Search Console again at T+1 day, T+7 days, and T+30 days.
8. Record whether search produced clicks, impressions, or new queries that should become docs pages.

## Decision Rules

- If pages are not indexed after a week, inspect canonical URLs, sitemap entries, robots rules, response status, and duplicate titles.
- If impressions grow but clicks stay flat, rewrite titles/descriptions for the affected route group and rerun `npm run seo:check`.
- If query demand clusters around a missing comparison, component, block, or framework workflow, create a focused docs page instead of broad homepage copy.
- If search clicks appear but npm downloads, stars, issues, or forks do not move, improve install snippets, examples, and page-level CTAs on those landing routes.
- If Search Console shows only branded queries, keep external sharing active and add deeper non-brand content around Base UI, registry, themes, and migration workflows.

# Registry Access Telemetry

Use this checklist after the docs site is deployed to measure whether registry metadata, `llms.txt`, `llms-full.txt`, CLI docs, and agent workflow pages are actually being consumed.

Registry access is supporting evidence for adoption. It does not replace the public completion gate in [adoption-dashboard.md](./adoption-dashboard.md), but it shows whether the agent-native and source-copy parts of the strategy are getting real traffic.

## Routes To Track

Track these production paths in CDN, Cloudflare, or server access logs:

| Route | Signal |
| --- | --- |
| `/registry/registry.json` | Tools or users are fetching the full source-copy registry. |
| `/registry/shadcn-registry.json` | Tools or users are fetching the shadcn-compatible catalog. |
| `/registry/items/*.json` | Tools or users are fetching item-level component, block, theme, or `meta.agent` metadata. |
| `/registry/block-meta.json` | Tools or docs consumers are reading block route, title, category, description, and export metadata. |
| `/registry/component-meta.json` | Tools or docs consumers are reading component metadata. |
| `/registry/theme-meta.json` | Tools or docs consumers are reading theme metadata. |
| `/llms.txt` | AI agents, search tools, or humans are discovering agent-readable entry points. |
| `/llms-full.txt` | AI agents or search tools are fetching the full component, theme, block, registry, and verification context. |
| `/docs/registry` | Users are evaluating source-copy registry usage. |
| `/docs/cli` | Users are evaluating CLI workflows such as `list`, `plan`, and `doctor`. |
| `/docs/agent-usage` | Users are evaluating the agent-native workflow. |

## Export Format

Export sanitized access rows as JSON, JSONL, or CSV. Useful fields are:

| Field | Accepted Names |
| --- | --- |
| Path or URL | `path`, `Path`, `uri`, `URI`, `url`, `URL`, `requestUrl` |
| Status | `status`, `Status` |
| Referrer | `referer`, `referrer`, `Referer`, `Referrer` |
| User agent | `userAgent`, `user_agent`, `User-Agent` |
| Timestamp | `timestamp`, `datetime`, `date` |

Keep exports sanitized. Do not include IP addresses, cookies, request headers, emails, or full query strings. The telemetry importer only needs the path-level signal.

Example JSONL:

```jsonl
{"path":"/registry/registry.json","status":200,"referer":"https://base-themes.bangwu.me/docs/registry","userAgent":"curl/8"}
{"path":"/registry/shadcn-registry.json","status":200,"referer":"https://base-themes.bangwu.me/llms.txt","userAgent":"agent-discovery"}
{"path":"/registry/items/button.json","status":200,"referer":"https://base-themes.bangwu.me/llms.txt","userAgent":"agent-discovery"}
{"path":"/registry/items/block-dashboard-shell.json","status":200,"referer":"https://base-themes.bangwu.me/docs/agent-usage","userAgent":"agent-discovery"}
{"path":"/registry/block-meta.json","status":200,"referer":"https://base-themes.bangwu.me/docs/registry","userAgent":"agent-discovery"}
{"path":"/registry/items/theme-enterprise.json","status":200,"referer":"https://base-themes.bangwu.me/themes/enterprise","userAgent":"agent-discovery"}
{"url":"https://base-themes.bangwu.me/llms.txt","status":200,"userAgent":"agent-discovery"}
{"url":"https://base-themes.bangwu.me/llms-full.txt","status":200,"userAgent":"agent-discovery"}
```

## Import Command

Run telemetry with the access export:

```bash
REGISTRY_ACCESS_EXPORT=path/to/registry-access.jsonl npm run telemetry:collect
```

You can combine it with other provider exports:

```bash
REGISTRY_ACCESS_EXPORT=path/to/registry-access.jsonl ANALYTICS_EXPORT=path/to/analytics-events.jsonl SEARCH_CONSOLE_EXPORT=path/to/search-console-export.csv npm run telemetry:collect
```

The report summarizes total matched registry/agent requests, requests for each registry artifact, standard registry item requests, component/block/theme item request breakdowns, block/component/theme metadata requests, `/llms.txt`, `/llms-full.txt`, registry docs, CLI docs, agent docs, top paths, top item paths, top referrers, and top user agents.

Before trusting a new export shape, run the bundled fixture check:

```bash
npm run telemetry:fixtures
```

The checked registry fixture lives at `research/telemetry-fixtures/registry-access.jsonl` and covers full registry, shadcn registry, component item, block item, theme item, metadata, `llms.txt`, `llms-full.txt`, and CLI-doc access rows.

## Decision Rules

- If `/registry/registry.json` has traffic but npm downloads do not move, improve registry install examples and source-copy docs.
- If `/registry/shadcn-registry.json` or `/registry/items/*.json` has traffic, prioritize deterministic item metadata, `meta.agent` quality, and stable shadcn-compatible paths before adding more decorative docs.
- If theme item requests lead block or component item requests, improve theme-to-component install examples and route users toward `examples/theme-customization`.
- If block item requests lead component item requests, improve block copy plans, block screenshots, and product-screen examples.
- If `/registry/block-meta.json` has traffic but block item requests do not, make registry block item URLs and `npx base-themes plan block:<name>` examples more visible from block routes.
- If `/llms.txt` has traffic but `/docs/agent-usage` does not, make the agent workflow route easier to discover from the discovery file and README.
- If `/llms-full.txt` has traffic but item JSON does not, move registry item examples higher in the full agent context.
- If `/docs/cli` has traffic but few install command copies or GitHub clicks, improve `npx base-themes doctor .` placement and troubleshooting examples.
- If registry artifacts have no traffic after announcements, include direct registry and `llms.txt` links in release posts and docs CTAs.
- If user agents show known coding agents or package tools, prioritize deterministic metadata, stable URLs, and source-copy planning over decorative docs changes.

# Adoption Dashboard

This dashboard tracks whether Base Themes has enough public evidence that users are willing to use it. It is intentionally separate from release readiness: passing builds, tests, package smoke checks, and SEO checks means the project is ready to ship, not that the market has adopted it.

## Current Status

Latest saved telemetry, campaign, and external-action evidence reports are generated under `research/` when maintainers run the live commands. Those generated execution records are intentionally not required for CI or release-readiness checks.

Current public adoption score: **1/4**

| Signal | Current | Status |
| --- | --- | --- |
| npm weekly downloads `>= 100` | `374` | Pass |
| GitHub stars `>= 10` | `0` | Not yet |
| External human issue or PR present | `0` | Not yet |
| At least one fork | `0` | Not yet |

Conclusion: the project has package download activity, but does not yet have enough public GitHub or community signal to claim the strategy has succeeded.

`npm run launch:actions` can generate a live promotion wave, channel-specific post copy, share assets, and record fields for external post URLs plus T+1, T+7, and T+30 telemetry evidence when maintainers need an execution pack.

## Completion Gate

Treat the future-development strategy as externally validated only when at least three of the four public signals pass in a telemetry report:

- npm weekly downloads are at least `100` and stable or growing.
- GitHub stars are at least `10`.
- At least one non-maintainer, non-bot issue or PR exists.
- At least one fork exists.

Supporting private signals can strengthen confidence but should not replace public evidence:

- Cloudflare unique visitors and route views.
- GitHub traffic views, clones, referrers, and popular paths.
- Install command copies and GitHub outbound clicks.
- Theme, block, registry, and CLI page depth.
- Google Search Console impressions, indexed pages, queries, and CTR.
- Community gallery submissions with permission to feature.
- Show and tell Discussions, external repos, public project URLs, and permissioned community proof from [community-proof-telemetry.md](./community-proof-telemetry.md).

## Measurement Commands

Run public telemetry:

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

Run with GitHub traffic when a token has repository traffic permission:

```bash
GITHUB_TOKEN=... npm run telemetry:collect
```

Run with local website/search exports when provider dashboards have data:

```bash
ANALYTICS_EXPORT=path/to/analytics-events.jsonl SEARCH_CONSOLE_EXPORT=path/to/search-console-export.csv npm run telemetry:collect
```

Verify import parsing with bundled sanitized fixtures before relying on provider exports:

```bash
npm run telemetry:fixtures
```

Run with registry/agent access logs when CDN or server logs are available:

```bash
REGISTRY_ACCESS_EXPORT=path/to/registry-access.jsonl npm run telemetry:collect
```

Run with manually exported community proof when Discussions, gallery submissions, external repos, or project URLs exist:

```bash
COMMUNITY_PROOF_EXPORT=path/to/community-proof.csv npm run telemetry:collect
```

Run with bundle performance budgets after building the docs site:

```bash
npm run build
npm run bundle:report -- --json > path/to/bundle-report.json
BUNDLE_REPORT_EXPORT=path/to/bundle-report.json npm run telemetry:collect
```

Check release readiness separately:

```bash
npm run registry:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run bundle:report
npm run analytics:check
npm run community:check
npm run telemetry:check
npm run telemetry:check -- --live
npm run telemetry:fixtures
npm run launch:check
npm run launch:status
npm run launch:status -- --live
npm run launch:actions
npm run launch:actions -- --live
npm run launch:campaign
npm run package:smoke
npm pack --dry-run
```

## Evidence Gaps

| Gap | Needed Access | Why It Matters |
| --- | --- | --- |
| GitHub traffic | `GITHUB_TOKEN` with repository traffic access | Shows views, clones, referrers, and popular content after launch. |
| Website analytics | Cloudflare or privacy-friendly analytics endpoint from [analytics-setup.md](./analytics-setup.md), optionally imported with `ANALYTICS_EXPORT` | Shows whether SEO/docs/block routes convert to install or GitHub clicks. |
| Search analytics | Google Search Console and [search-console-setup.md](./search-console-setup.md) | Shows whether theme, component, and Base UI comparison pages are indexed and queried. |
| Registry usage | CDN/server logs from [registry-access-telemetry.md](./registry-access-telemetry.md), or issue-based reports | Shows whether registry metadata and agent workflows are actually consumed. |
| Community proof | GitHub gallery issues, Show and tell Discussions, external repos, or [community-proof-telemetry.md](./community-proof-telemetry.md) exports | Shows real usage outside maintainer demos. |

## Operating Loop

1. Ship only after release-readiness checks pass.
2. Use [release-announcement-kit.md](./release-announcement-kit.md) to share the release and ask for one concrete action.
3. Use [search-console-setup.md](./search-console-setup.md) to submit the sitemap, inspect high-intent routes, and monitor search queries after deploy.
4. Use [registry-access-telemetry.md](./registry-access-telemetry.md) to import registry, `llms.txt`, `llms-full.txt`, CLI, and agent-route access logs when available.
5. Use [community-proof-telemetry.md](./community-proof-telemetry.md) to import accepted Discussions, gallery submissions, external repos, and public project URLs when available.
6. Run telemetry at T+0, T+1 day, T+7 days, and T+30 days.
7. Run `npm run launch:status` after each telemetry pass to summarize the current public score, previous-report signal trend, missing signals, recommended good-first issue URLs, telemetry collection errors, and next action without manually diffing JSON; use `npm run launch:status -- --live` before an external announcement when you want current GitHub/npm data without writing a new report.
8. Run `npm run launch:actions` while the gate is unmet to get a focused action list, previous-report signal trend, and share assets for the missing star, fork, external issue/PR, or download signals; use `npm run launch:actions -- --live` before promotion to derive that list from current public data, or `npm run launch:campaign` to write the live campaign JSON and Markdown pack to `research/`.
9. Compare slope instead of only one snapshot.
10. Prioritize the next product iteration from observed blockers:
   - Low installs: improve README, npm metadata, examples, and install snippets.
   - Low stars/forks: improve positioning, screenshots, and shareable routes.
   - Low issues/PRs: add contribution prompts, good-first issues, and clearer component/theme request templates.
   - Low docs conversion: improve route CTAs, package examples, and CLI doctor guidance.
   - Repeated integration failures: fix package exports, CSS import docs, peer dependencies, or framework examples.

## Decision Rule

Do not mark the strategy complete while the adoption score is below `3/4`. Continue local adoption-funnel work until all realistic in-repo improvements are exhausted, then publish, promote, measure, and iterate from real user behavior.

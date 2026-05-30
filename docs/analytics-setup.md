# Analytics Setup

Base Themes uses optional, privacy-light product-funnel events to understand whether the docs site turns visitors into package installs, GitHub visits, theme exploration, block sharing, and registry usage.

No analytics request is sent unless `VITE_ANALYTICS_ENDPOINT` is configured at docs build time.

## Event Contract

The frontend sends this JSON shape:

```json
{
  "name": "install_command_copy",
  "path": "/docs/installation",
  "timestamp": "2026-05-29T00:00:00.000Z",
  "properties": {
    "source": "landing"
  }
}
```

Allowed event names:

- `route_view`
- `internal_navigation`
- `install_command_copy`
- `github_outbound_click`
- `theme_style_cycle`
- `theme_style_select`
- `theme_snippet_copy`
- `color_theme_toggle`
- `block_share_copy`

Allowed properties:

- `block`
- `campaign`
- `component`
- `content`
- `detail`
- `from`
- `label`
- `medium`
- `path`
- `source`
- `target`
- `themeStyle`
- `to`

Do not add personal identifiers, user IDs, emails, IP-derived identifiers, full user agents, or free-form text fields to analytics payloads.

## Receiver

The optional receiver lives at [workers/analytics-receiver.mjs](../workers/analytics-receiver.mjs). It:

- accepts only `POST` JSON requests and CORS preflight `OPTIONS` requests;
- accepts only configured origins through `ALLOWED_ORIGINS`;
- rejects unknown event names;
- keeps only whitelisted primitive properties;
- logs one sanitized JSON event per accepted request;
- optionally writes to a Cloudflare Queue binding named `ANALYTICS_QUEUE`;
- optionally writes a basic Cloudflare Analytics Engine data point through `BASE_THEMES_ANALYTICS`.

Validate the receiver locally:

```bash
npm run analytics:check
```

## Cloudflare Deployment Model

The receiver can be deployed as a separate Worker from the docs site. Keeping it separate avoids changing the static assets deployment path and lets analytics be disabled without affecting docs availability.

Worker config lives at [wrangler.analytics.jsonc](../wrangler.analytics.jsonc):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "base-themes-analytics",
  "main": "workers/analytics-receiver.mjs",
  "compatibility_date": "2026-05-29",
  "observability": {
    "enabled": true
  },
  "vars": {
    "ALLOWED_ORIGINS": "https://base-themes.bangwu.me,http://localhost:5175,http://localhost:5176"
  }
}
```

Update `ALLOWED_ORIGINS` before deploying preview environments or a custom docs domain. Use a comma-separated list of exact origins.

Deploy the receiver:

```bash
npx wrangler deploy --config wrangler.analytics.jsonc
```

Build the docs site with the endpoint:

```bash
VITE_ANALYTICS_ENDPOINT=https://base-themes-analytics.<account>.workers.dev npm run build:docs
```

Then deploy the docs site normally:

```bash
npm run deploy
```

## Launch Metrics

After a release announcement, compare these event counts with public telemetry:

| Event | Funnel Question |
| --- | --- |
| `route_view` | Which docs, theme, block, and CLI routes did visitors actually open? |
| `install_command_copy` | Did visitors reach install intent? |
| `github_outbound_click` | Did visitors move from docs to GitHub stars, forks, Show and tell Discussions, feature issues, bug reports, or gallery submissions? Check `source` and `target` values such as `repo-star`, `repo-fork`, `show-and-tell`, `feature-request`, and `gallery-submission`. |
| `theme_style_select` | Which visual systems attracted exploration? |
| `theme_snippet_copy` | Which theme package or CSS snippets were useful enough to copy? Check `detail`, `label`, and `themeStyle` when present. |
| `block_share_copy` | Which blocks were compelling enough to share? |
| `internal_navigation` | Did visitors move from landing pages into docs, themes, blocks, or registry pages? |

Use these results alongside `npm run telemetry:collect`. Website events are supporting evidence; public adoption still requires npm/GitHub/community signals.

To include exported Worker logs or sanitized event rows in the telemetry report, write one JSON event per line or export a CSV/JSON file with `name`, `path`, `timestamp`, and optional `properties`, then run:

```bash
ANALYTICS_EXPORT=path/to/analytics-events.jsonl npm run telemetry:collect
```

The bundled fixture at `research/telemetry-fixtures/analytics-events.jsonl` is checked by:

```bash
npm run telemetry:fixtures
```

The telemetry importer summarizes total events, route views, install command copies, GitHub outbound clicks, block shares, theme snippet copies, theme selections, top routes, top GitHub click targets, and top launch attribution values. Keep exports sanitized: do not include IP addresses, user agents, cookies, emails, request headers, or free-form user text.

Launch attribution uses the standard `utm_campaign`, `utm_source`, `utm_medium`, and `utm_content` query parameters. The docs app attaches those values to every funnel event as `campaign`, `source`, `medium`, and `content`; `npm run telemetry:collect` summarizes top campaigns, sources, mediums, GitHub-click sources, install-copy sources, and campaign/source conversion funnels when `ANALYTICS_EXPORT` is provided.

## Privacy Notes

The receiver intentionally does not set cookies, does not assign visitor IDs, and does not store request headers. Cloudflare platform logs may still include operational metadata depending on account settings, so keep published privacy language conservative and accurate.

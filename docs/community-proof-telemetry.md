# Community Proof Telemetry

Community proof is supporting evidence for adoption. It does not replace the public completion gate in [adoption-dashboard.md](./adoption-dashboard.md), but it helps explain whether users are moving from docs into Show and tell Discussions, gallery submissions, forks, issues, PRs, and real project usage.

## Export Format

Create a CSV, JSON array, or JSONL file with one row per accepted signal. Supported fields:

| Field | Description |
| --- | --- |
| `type` | `discussion`, `gallery`, `repo`, `url`, `issue`, or `pr`. Aliases such as `show-and-tell`, `gallery-submission`, `repository`, and `pull-request` are normalized. |
| `title` | Project, discussion, issue, PR, or submission title. |
| `url` | Public GitHub Discussion, issue, PR, repository, project, or screenshot URL. |
| `author` | GitHub login or public author name when available. |
| `style` | Base Themes `data-style`, such as `enterprise`, `bento`, or `terminal`. |
| `permissionToFeature` | `true` / `false`; only permissioned submissions should become README or docs gallery entries. |
| `timestamp` | Optional ISO date or export date. |

Example CSV:

```csv
type,title,url,author,style,permissionToFeature,timestamp
discussion,Enterprise dashboard feedback,https://github.com/markbang/base-themes/discussions/12,octo-user,enterprise,false,2026-06-01
gallery,Internal tools screenshot,https://github.com/markbang/base-themes/issues/18,acme-dev,data-dense,true,2026-06-02
repo,Base Themes starter,https://github.com/example/base-themes-starter,example,bento,false,2026-06-03
```

Run:

```bash
COMMUNITY_PROOF_EXPORT=path/to/community-proof.csv npm run telemetry:collect
```

Validate the importer with the bundled sanitized fixture:

```bash
npm run telemetry:fixtures
```

The checked fixture lives at `research/telemetry-fixtures/community-proof.csv` and covers a Discussion, gallery submission, external repo, and external project URL.

## Interpretation

- Discussions are early qualitative feedback; use them to prioritize docs, missing components, and source-copy friction.
- Permissioned gallery submissions are stronger proof than generic screenshots because they can become public README/docs evidence.
- External repos and project URLs help identify real integration patterns even when users do not open issues.
- Community proof can support confidence, but the strategy is externally validated only when the public gate reaches at least `3/4`.

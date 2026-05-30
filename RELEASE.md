# Release Checklist

Use this checklist for every public npm release.

## Before Cutting a Release

- Confirm `package.json` version is correct.
- Review changes for breaking API, token, CSS class, registry schema, or peer dependency changes.
- Apply the semver policy from README: patches for compatible fixes, minors for additive components/themes/registry entries, majors for removed exports, peer range changes, renamed tokens/classes, or changed `data-style` / `data-theme` behavior.
- Update release notes or changelog content.
- Confirm README install examples still match the package API.
- Confirm `registry/registry.json` includes all public components, blocks, pages, files, dependencies, and theme variants.

## Required Local Checks

```bash
npm ci
npm run registry:check
npm run tokens:check
npm run lint
npm run build
npm run seo:check
npm run bundle:report
npm run bundle:report -- --json
npm run release:announce -- --json
npm run community:check
npm run community:issues -- --json
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
npm run example:vite:build
npm run example:dashboard:build
npm run example:theme-customization:build
npm run example:next:build
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm pack --dry-run
```

## Visual and Theme Checks

Run when component styles, theme tokens, previews, or docs demos changed:

```bash
npm run themes:e2e
npm run previews:check
npm run previews:generate
```

`previews:check` compares fresh screenshots against `public/previews` baselines. Commit regenerated preview assets when visual changes are intentional.

## Publish Flow

Publishing is handled by `.github/workflows/publish.yml` through GitHub Actions and npm provenance.

1. Create a GitHub release for the package version, or run the publish workflow manually.
2. Confirm the workflow used the `npm` environment and GitHub OIDC.
3. Confirm the package was not already published.
4. Confirm `npm publish --access public --provenance` completed successfully.

## After Publish

- Install the published package in a fresh app.
- Import `base-themes/styles.css` and render at least `Button` and `Select`.
- Build the Vite, dashboard, theme-customization, and Next examples when package exports, CSS, registry metadata, theme tokens, blocks, or peer dependencies changed.
- Verify `base-themes/registry.json` and `base-themes/skill` resolve from the package.
- Check the docs site deployment if the release includes docs or preview changes.
- Check `.github/labels.json`, issue templates, and contributor seed issues with `npm run community:check`, then run `npm run community:issues` and publish two or three good-first issues before asking for stars, forks, issues, PRs, or gallery submissions.
- Link the release notes from any relevant issue or discussion.
- Use `npm run release:announce` and [docs/release-announcement-kit.md](./docs/release-announcement-kit.md) to publish current-count announcement copy, share screenshots/routes, ask for one concrete community action, and schedule T+1 day, T+7 day, and T+30 day telemetry checks.
- Run `npm run launch:check` before the first announcement wave to verify release copy, contributor seed issue URLs, community links, telemetry docs, and the public adoption gate are still aligned.
- Run `npm run telemetry:collect` after the release and after each announcement wave. Do not treat a release as adoption-validated until the public adoption gate in the announcement kit passes.
- Run `npm run launch:status` after each telemetry pass to summarize missing public signals and the next concrete adoption action; use `npm run launch:status -- --live` before an announcement when the latest report may be stale.
- Run `npm run launch:actions` after `launch:status` when the gate is still unmet, or `npm run launch:actions -- --live` before promotion, then execute the generated star, fork, and external issue/PR actions before the next telemetry pass. Use `npm run launch:campaign` to write the live campaign JSON and Markdown pack to `research/` before posting externally.

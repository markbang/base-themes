# Changelog

All notable changes to `base-themes` should be documented here.

This project follows semantic versioning before `1.0.0` with extra care: minor versions may still include breaking changes, but every breaking API, token, CSS class, registry schema, or peer dependency change must be called out in release notes.

## Unreleased

- Added release announcement and adoption-measurement kit with GitHub release copy, social drafts, shareable routes, calls to action, telemetry schedule, and external validation thresholds.
- Added adoption dashboard that separates release readiness from public user-willingness evidence and records the current adoption gate.
- Added contributor issue seeds for publishing adoption-focused good-first issues around docs, accessibility, theme customization, registry planning, blocks, and gallery submissions.
- Added optional privacy-light analytics receiver and setup guide for measuring docs funnel events after release announcements.
- Added landing page community calls to action for GitHub stars, feature requests, and gallery submissions with outbound analytics source/target properties.
- Added hosted registry artifacts under `/registry/registry.json`, `/registry/component-meta.json`, and `/registry/theme-meta.json` for HTTPS-based tool and agent consumption.
- Added generated `/llms.txt` discovery file for AI and agent tools to find install, registry, CLI, component, theme, and block entry points.
- Added CLI package surface with `base-themes list`, `base-themes plan`, and `base-themes doctor` for registry discovery, source-copy planning, and integration checks.
- Expanded registry-backed docs and SEO coverage across installation, positioning, comparison, tokens, accessibility, migration, design handoff, theming, theme customization, registry, CLI, agent usage, contribution, component, theme, and block routes.
- Added package-source blocks, block detail routes, and block registry entries for dashboard, settings, auth, pricing, data table, command palette, activity feed, and theme showcase workflows.
- Added Vite, Next.js, and registry-copy examples that exercise the public package surface.
- Added package smoke, SEO coverage, axe accessibility, theme e2e, and preview screenshot-diff checks for release confidence.
- Added telemetry collection for public GitHub and npm adoption signals, with explicit gaps for GitHub traffic, website analytics, Search Console, and registry usage.
- Added open-source readiness documentation: contributing guide, security policy, code of conduct, release checklist, issue templates, PR template, and Dependabot configuration.
- Updated project GitHub CTAs to point at `markbang/base-themes` while keeping Base UI as the upstream documentation reference.

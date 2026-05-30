# Community Gallery Proposal

Base Themes should treat a community gallery as a discovery and trust surface, not as a paid marketplace until adoption data supports that move.

## Goals

- Show real applications, copied blocks, and theme customizations built with `base-themes`.
- Give contributors a lightweight path to share themes, block variants, and integration examples.
- Create public evidence that the package is useful outside the maintainer's own docs site.

## Initial Submission Model

Start with GitHub issues instead of a custom backend. Add a `gallery-submission` label and ask contributors for:

- Project or screenshot title.
- Public URL or repository link.
- Base Themes version.
- Theme style and custom CSS variables used.
- Components or blocks used.
- One 1280x720 screenshot.
- Permission to feature the submission in the docs site and README.

Use GitHub Discussions for lighter-weight show-and-tell before a submission is ready for gallery consideration. The versioned template at [.github/DISCUSSION_TEMPLATE/show-and-tell.yml](../.github/DISCUSSION_TEMPLATE/show-and-tell.yml) asks for the project name, URL or repository, selected theme style, components or blocks used, what worked, and what was missing. A discussion can become a gallery issue only when the user explicitly grants permission through the gallery submission template.

## Acceptance Criteria

- The screenshot must show an actual UI built with Base Themes components, blocks, or theme tokens.
- The submission must include enough implementation detail for another user to reproduce the setup.
- The UI must not imply official endorsement of a third-party product.
- The project must be suitable for an open-source documentation site.

## Gallery Data Shape

When there are at least five accepted submissions, move accepted entries into `src/docs/communityGallery.json`:

```json
[
  {
    "title": "Ops Dashboard Theme",
    "url": "https://example.com",
    "repo": "https://github.com/example/base-themes-dashboard",
    "screenshot": "/community/ops-dashboard.png",
    "style": "enterprise",
    "components": ["button", "select", "tabs"],
    "blocks": ["dashboard-shell", "data-table"]
  }
]
```

## Rollout

1. Add the `type: gallery` and `community` labels from [.github/labels.json](../.github/labels.json), then link this proposal from README contribution notes.
2. Enable GitHub Discussions with a `Show and tell` category, then use the discussion template for early feedback and screenshots that are not yet permissioned gallery entries.
3. Collect submissions manually through issues until there is enough volume to justify a docs route.
4. Add `/community` only after accepted entries exist, so the page launches with real proof instead of placeholders.
5. Track outbound project clicks, discussion clicks, and gallery submission clicks through the existing optional analytics hook.

Run `npm run community:check` after editing the gallery issue template, show-and-tell discussion template, label manifest, or this proposal. The check verifies that gallery labels exist, that the submission template keeps explicit permission-to-feature language, and that the discussion template asks for adoption feedback instead of generic promotion.

## Success Signals

- At least five valid external submissions.
- Gallery entries drive docs sessions to install, registry, or GitHub outbound clicks.
- Submissions reveal repeated requests for a block, theme style, or integration guide.

# Security Policy

Base Themes is a public npm package for React applications. Security reports are handled through GitHub so fixes can be coordinated before public disclosure.

## Supported Versions

Security fixes target the latest published minor version of `base-themes`. Older versions may receive guidance, but patches are not guaranteed until the project has a stable major release policy.

## Reporting a Vulnerability

Use GitHub private vulnerability reporting if it is enabled for the repository. If it is not available, open a minimal public issue that says you need a private security contact, without including exploit details.

Do not include secrets, tokens, private keys, customer data, or production credentials in a report.

Please include:

- Affected package version.
- Affected component, script, workflow, or registry entry.
- Reproduction steps or proof of concept.
- Impact and likely attack scenario.
- Any known mitigation.

## Response Expectations

- Initial triage target: 3 business days.
- Fix or mitigation target: depends on severity and reproducibility.
- Public disclosure: after a patched release or clear mitigation is available.

## Supply Chain Posture

- Releases are published by GitHub Actions using npm provenance.
- CI runs registry validation, lint, and build before publish.
- Runtime dependencies are intentionally small.
- Dependency updates are managed through Dependabot once configured.

## Scope

In scope:

- Package source and bundled output.
- Registry metadata that could cause unsafe installs or copied files.
- GitHub Actions workflows and release pipeline.
- Documentation examples that create unsafe defaults.

Out of scope:

- Vulnerabilities in user applications after local modifications.
- Issues requiring access to private user environments.
- Social engineering or spam reports.

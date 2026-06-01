# Bauhaus theme production-readiness audit

Date: 2026-06-01

## Verdict

**Not production-ready without small fixes.** The Bauhaus theme matches the intended direction in its core palette and docs — geometric composition, primary colors, hard contrast, squared controls, and offset block shadows are present. However, there are usability gaps in component states: range/progress tracks can disappear in the light theme, disabled states are only styled for menu items, and several Bauhaus-specific shape/border treatments stop short of all interactive components/overlays.

## Correct

- **Theme identity matches the target.** `src/styles/tokens.css:1569-1609` defines the light Bauhaus palette with warm paper (`--bg: #f4ead7`), black linework (`--line: #111111`), red/yellow/blue/teal accents (`--accent`, `--surface-muted`, `--blue`, `--teal`), hard shadows, and zero radii. Dark mode is also defined at `src/styles/tokens.css:1612-1638` with inverse surfaces, light borders, red/blue/green accents, and hard shadows.
- **Foreground tokens are intentionally high-contrast for primary-color fills.** `src/styles/themes.css:34-38` sets Bauhaus primary/teal foregrounds to black, which works with the saturated red/teal fills in both modes.
- **Core Bauhaus component styling is scoped correctly.** The custom rules are under `[data-style='bauhaus']` in `src/styles/themes.css:617-662`, so they do not leak into other styles.
- **Key controls get geometric treatment.** Bauhaus uppercases buttons and squares their corners (`src/styles/themes.css:619-623`), raises form/select/combobox borders to 2px (`src/styles/themes.css:626-631`), squares key popups (`src/styles/themes.css:634-640`), and gives highlighted menu/select/combobox items a strong Bauhaus highlight (`src/styles/themes.css:643-648`).
- **Token contract and registry checks pass.** Verified with:
  - `npm run tokens:check` → `Token contract valid: 40 public tokens, 20 styles, version 0.1.0`
  - `npm run registry:check` → registry valid with 20 theme metadata entries
- **Unit tests pass.** `npm test` passed: 5 files, 7 tests.
- **Docs/previews are aligned.** `src/docs/themeMeta.json:20` and `README.md:164` use the target description, README includes the Bauhaus preview at `README.md:95`, and `public/previews/base-themes-bauhaus.png` exists. The built CSS also contains `[data-style=bauhaus]`.

## Blockers

1. **Light-mode range/progress/meter tracks can become invisible on Bauhaus surfaces.**
   - Evidence: Bauhaus light tokens set `--surface: #fffaf0` at `src/styles/tokens.css:1571` and `--track-bg: #fffaf0` at `src/styles/tokens.css:1594`, so the track background is identical to the surrounding surface.
   - Components affected:
     - Slider track uses only `background: var(--track-bg)` with no border at `src/components/ui/Slider.css:12-17`.
     - Progress track uses only `background: var(--track-bg)` with no border at `src/components/ui/Progress.css:5-11`.
     - Meter track uses only `background: var(--track-bg)` with no border at `src/components/ui/Meter.css:5-11`.
   - Impact: users cannot reliably see the empty/unfilled track state in light Bauhaus, which undermines progress, meter, and slider usability.

2. **Disabled states are not consistently styled across controls.**
   - Evidence: a search for disabled styling in `src/components/ui/*.css` found only menu item handling at `src/components/ui/Menu.css:44-48`.
   - Core controls define base/hover/focus/checked styling but no disabled styling, for example:
     - Button states in `src/components/ui/Button.css:1-75` include base, hover, focus-visible, and variants, but no disabled selector.
     - Input/textarea states in `src/components/ui/Input.css:1-18` include base/focus, but no disabled selector.
     - Checkbox checked/focus states in `src/components/ui/Checkbox.css:1-21` have no disabled selector.
     - Switch checked/focus states in `src/components/ui/Switch.css:1-35` have no disabled selector.
   - Impact: Bauhaus exposes strong hover/focus/checked affordances, but disabled controls can still look interactive. This is a production usability/accessibility gap across components/states.

## Polish / follow-up issues

- **Bauhaus border weight is inconsistent outside selected controls.** The theme sets `--theme-border-width: 2px` for Bauhaus at `src/styles/tokens.css:1743-1745`, and buttons consume `--bt-border-width` at `src/components/ui/Button.css:8`. But many components still hard-code `1px`, including checkbox (`src/components/ui/Checkbox.css:6`), switch (`src/components/ui/Switch.css:8`), blocks (`src/blocks/Blocks.css:5`, `src/blocks/Blocks.css:49`), popover (`src/components/ui/Popover.css:4`), tooltip (`src/components/ui/Tooltip.css:3`), toast (`src/components/ui/Toast.css:18`), and drawer (`src/components/ui/Drawer.css:15`). This weakens the strong graphic-contrast target.
- **Some components remain rounded despite Bauhaus geometry.** Bauhaus squares the slider thumb (`src/styles/themes.css:651-652`) and switch thumb (`src/styles/themes.css:655-656`), but the slider track/indicator remain pill-shaped at `src/components/ui/Slider.css:12-24`, progress/meter tracks remain pill-shaped at `src/components/ui/Progress.css:5-17` and `src/components/ui/Meter.css:5-17`, and the radio inner indicator remains circular at `src/components/ui/RadioGroup.css:23-27` even though the outer radio is squared by `src/styles/themes.css:659-661`.
- **Overlay coverage is partial.** Bauhaus explicitly thickens/squares menu, select, combobox, dialog, and alert popups at `src/styles/themes.css:634-640`, but popover, tooltip, toast, and drawer depend only on global radius tokens and keep 1px borders (`src/components/ui/Popover.css:1-7`, `src/components/ui/Tooltip.css:1-7`, `src/components/ui/Toast.css:11-20`, `src/components/ui/Drawer.css:9-16`).
- **Block surfaces are readable but very yellow-forward in light mode.** `src/blocks/Blocks.css:45-51` uses `--bt-surface-muted` for stats/panels/list items; in Bauhaus light this is the saturated yellow token (`src/styles/tokens.css:1573`). Text remains readable, but repeated block panels may become visually loud.
- **Registry theme preview only declares light preview.** `registry/items/theme-bauhaus.json:59-68` declares a light preview while also saying the theme supports dark mode. This is not a functional blocker, but a dark preview would better validate the dark palette.

## Smallest fixes

1. **Make tracks visible in Bauhaus light/dark.** Minimal token-only fix:
   - In `src/styles/tokens.css` Bauhaus light, change `--track-bg` from `#fffaf0` to a visible high-contrast value such as `#111111` or a bordered/yellow treatment.
   - In Bauhaus dark, consider increasing `--track-bg` contrast from `#2b2b2b` against `#1d1d1d`.
   - If token-only is too strong visually, add Bauhaus-specific borders for `.bento-slider-track`, `.bento-progress-track`, and `.bento-meter-track`.
2. **Add shared disabled styles for Base UI controls.** Add selectors for `[data-disabled]`, `:disabled`, and `[aria-disabled='true']` on buttons, inputs, select triggers/items, checkbox, radio, switch, toggle/toolbar/tabs as applicable. Use muted foreground, reduced opacity, no hover shadow, and `cursor: not-allowed`.
3. **Consume `--bt-border-width` in more components.** Replace component hard-coded `1px` borders with `var(--bt-border-width, 1px)` where visually appropriate, especially checkbox, radio, switch, popover, tooltip, toast, drawer, and blocks.
4. **Complete Bauhaus shape overrides.** Add small scoped rules for Bauhaus tracks/indicators/radio indicators and popover/tooltip/toast/drawer borders so the theme feels consistently geometric rather than half-square/half-pill.
5. **Optionally add a dark Bauhaus preview.** This would align registry metadata with `supportsModes: ["light", "dark"]`.

## Validation commands run

```bash
cd /home/bangwu/code/bento-base
npm run tokens:check
npm run registry:check
npm test
```

## Additional validation recommended after fixes

```bash
cd /home/bangwu/code/bento-base
npm run lint
npm run themes:e2e
npm run previews:check
npm run build
```

Note: `/home/bangwu/code/bento-base/plan.md` and `/home/bangwu/code/bento-base/progress.md` were requested as inputs but were not present in the checkout during this audit.

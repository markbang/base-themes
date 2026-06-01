# Theme audit: `glass`

Date: 2026-06-01
Scope: review-only audit of `src/styles/tokens.css`, `src/styles/themes.css`, `src/styles/glass.css`, relevant component/block CSS, theme metadata/docs, previews, and built CSS. `plan.md` and `progress.md` were requested inputs but were not present in the repo at audit time.

## Verdict

**Not fully production-ready for the stated target yet.** The core palette and the main overlay/form/button paths clearly support “translucent surfaces, blur, and luminous focus states,” but the implementation is uneven across the component set and blocks. Primary/readability tokens look sane in both light and dark, docs and previews are aligned, and the token contract validates. The main readiness gap is coverage: several surfaces and form controls keep translucent colors but do not get frosted blur/inner-highlight treatment or luminous focus states.

## Correct

- **Theme identity is registered and documented consistently.**
  - `src/docs/themeMeta.json:8` describes `glass` as “Translucent surfaces, blur, and luminous focus states.”
  - `README.md:83` lists the Glass preview image and `README.md:152` repeats the same theme description.
  - `public/previews/base-themes-glass.png` and `dist/previews/base-themes-glass.png` both exist.

- **CSS is scoped to the theme and imported.**
  - `src/index.css:1-8` imports tokens, shared theme behavior, and `glass.css`.
  - `src/styles/glass.css` rules are consistently scoped under `[data-style='glass']`, so no obvious cross-theme leakage was found.

- **Light/dark token palette supports the glass target.**
  - Light mode uses translucent white surfaces (`--surface`, `--surface-muted`, `--group-bg`, `--card-bg`) with blue accent and soft blue shadows: `src/styles/tokens.css:558-598`.
  - Dark mode uses translucent slate surfaces and cyan accents: `src/styles/tokens.css:601-637`.
  - Radius is intentionally larger for glass (`18px` / `12px`) in `src/styles/tokens.css:575-576`.

- **Primary controls and overlays have the expected glass treatment.**
  - `src/styles/glass.css:4-17` defines blur, stronger blur, glass border, highlights, and hover tint variables.
  - `src/styles/glass.css:20-26` adds a luminous focus outline/glow for button/link/trigger/item focus-visible states.
  - `src/styles/glass.css:29-50` gives inputs/select triggers translucent backgrounds, blur, glass border, inner highlight, and focus glow.
  - `src/styles/glass.css:53-80` gives buttons blur, inner highlight, glow, and hover lift.
  - `src/styles/glass.css:82-98` gives menus, selects, comboboxes, nav menu popups, popovers, preview cards, tooltips, toasts, dialogs, alerts, and drawers frosted backgrounds, strong blur, border, and shadow.
  - `src/styles/themes.css:73-99` also applies backdrop blur to the topbar/sidebar and major popups for glass/fluent.

- **Shared state rules cover many common states.**
  - Disabled state opacity/cursor and disabled form surfaces are centralized in `src/styles/themes.css:317-340`.
  - Checked checkbox/radio/switch states use the accent color in `src/styles/themes.css:343-347`, and glass adds glow in `src/styles/glass.css:142-147`.
  - Selected/highlighted menu/select/combobox/nav items are covered by shared rules in `src/styles/themes.css:390-428` and glass-specific highlight blur in `src/styles/glass.css:100-107`.

- **Token contract validation passed.**
  - Ran `npm run tokens:check`: `Token contract valid: 40 public tokens, 20 styles, version 0.1.0`.

## Blockers

1. **Luminous focus is incomplete for form controls; NumberField input has no visible focus styling, and OTP inputs do not get the glass glow.**
   - `src/components/ui/NumberField.css:19-28` sets `.bento-number-field-input` to `outline: 0` but defines no `:focus` / `:focus-visible` / group `:focus-within` style.
   - `src/styles/glass.css:40-50` only adds the glass focus glow to `.bento-input`, `.bento-textarea`, `.bento-combobox-input`, and `.bento-select-trigger`.
   - `src/components/ui/OtpField.css:25-28` has its own non-glass focus ring (`0 0 0 3px ...`) and `src/styles/glass.css` has no `.bento-otp-input` selector.
   - Impact: the theme does not consistently deliver the promised “luminous focus states” across forms, and NumberField input focus is a usability/accessibility risk.

2. **Glass surface treatment is not applied across several shipped components and blocks.**
   - `src/styles/glass.css` covers inputs, buttons, popups, demo cards, tabs list/indicator, toolbar, number-field group, fieldset, and selected checkbox/radio/switch, but it has no selectors for accordion/collapsible items, tabs panels, toggle groups, menubar surfaces, scroll areas, context-menu trigger, OTP inputs, or registry block surfaces.
   - Examples of uncovered surfaces:
     - Accordion items use a translucent token but no blur/highlight: `src/components/ui/Accordion.css:6-10`.
     - Tabs panels use `background: var(--group-bg)` without glass blur/highlight: `src/components/ui/Tabs.css:53-59`; `glass.css` only styles `.bento-tabs-list` and selected indicator at `src/styles/glass.css:124-140`.
     - Registry blocks use translucent `--bt-surface` / `--bt-surface-muted` but no `backdrop-filter` or glass highlight: `src/blocks/Blocks.css:1-10` and `src/blocks/Blocks.css:45-52`.
   - Impact: the theme looks like glass in the main control/overlay paths but reverts to “transparent flat panels” in other components/blocks, so it is not yet consistently usable across the library surface area.

## Polish / follow-up

- **Topbar/sidebar get blur but not the richer inner highlight/border from `glass.css`.** Shared blur is applied in `src/styles/themes.css:73-99`, while `glass.css` only adds brand-mark styling at `src/styles/glass.css:190-193`. Consider applying `--glass-border` and `--glass-highlight` to `.topbar` and `.sidebar` too for a more coherent shell.

- **Active/pressed motion could be tightened.** Primary buttons get hover lift at `src/styles/glass.css:60-63`, but there is no `:active` transform reset. Adding a small pressed state would make mouse/touch feedback feel more complete.

- **Arrows for popover/preview/tooltip still rely on `--theme-popup-bg`.** Shared arrow fill is `var(--theme-popup-bg)` in `src/styles/themes.css:374-378`, while glass popups set `background: var(--surface)` in `src/styles/glass.css:82-98`. This is currently equivalent through tokens, but if popup surface diverges later, arrow fill can drift. A small glass override for `.bento-popover-arrow`, `.bento-preview-card-arrow`, `.bento-tooltip-arrow` would make the contract explicit.

- **Docs are aligned but only high-level.** README and metadata state the target accurately, but there is no component/state checklist for glass coverage. This audit suggests adding at least a visual regression checklist for focus, disabled, checked, selected/highlighted, open popup, and block-card states.

## Smallest fixes

1. **Add missing focus coverage in `src/styles/glass.css`:**
   - Style `.bento-otp-input:focus-visible` with the same `--glass-highlight-strong` + accent glow used by inputs.
   - Add `.bento-number-field-group:focus-within` or `.bento-number-field-input:focus-visible` styling so NumberField has a visible luminous focus state.

2. **Broaden glass surface selectors minimally:**
   - Add glass background/blur/border/highlight to: `.bento-accordion-item`, `.bento-collapsible`, `.bento-tabs-panel`, `.bento-toggle-group`, `.bento-menubar`, `.bento-scroll-area`, `.bento-context-menu-trigger`, `.bento-otp-input`, `.base-block`, `.base-block-stat`, `.base-block-panel`, `.base-block-list-item`, `.base-block-table`, and `.base-block-pill`.
   - Keep inner block surfaces slightly muted with `var(--surface-muted)` so hierarchy remains readable.

3. **Add shell polish:**
   - Apply `border-color: var(--glass-border)` and `box-shadow: var(--glass-highlight)` to `[data-style='glass'] .topbar` and `.sidebar`.

4. **Add active button feedback:**
   - For glass primary buttons, set `:active { transform: translateY(0); box-shadow: var(--glass-highlight), 0 2px 10px ... }` so hover lift does not feel sticky.

## Validation commands

Already run:

```bash
npm run tokens:check
```

Result: passed.

Attempted:

```bash
npm run previews:check
```

Result: failed because the preview checker could not connect to `http://127.0.0.1:5175/...` (`net::ERR_CONNECTION_REFUSED`). Start the docs server first, then rerun.

Recommended before approving the theme:

```bash
npm run lint
npm run test
npm run build
npm run tokens:check
npm run dev -- --host 127.0.0.1 --port 5175
# in another shell after the server is ready:
npm run previews:check
npm run themes:e2e
```

# Theme audit: bento

## Review
- Correct: `bento` is the registry default style, so the base `:root` / `[data-theme='dark']` tokens are effectively the Bento token set (`registry/registry.json:10-24`). The docs/metadata target is explicit and aligned: “Warm modular product cards with soft depth and teal controls” (`src/docs/themeMeta.json:2`), and README includes a Bento preview entry (`README.md:75-77`).
- Correct: The card foundation mostly supports “modular product cards with soft depth”: base tokens define translucent card backgrounds and soft shadows (`src/styles/tokens.css:16-18`, `src/styles/tokens.css:66-75`, `src/styles/tokens.css:113-124`), `BentoCard` uses `--card-bg` plus `--shadow-strong` (`src/components/layout/BentoCard.css:1-10`), and shipped blocks use radius + shadow through public `--bt-*` tokens (`src/blocks/Blocks.css:1-10`).
- Correct: Core readability tokens look coherent in both modes: light text/background/surface are separated (`src/styles/tokens.css:2-10`), dark mode sets appropriate dark surfaces and light text (`src/styles/tokens.css:98-110`), overlays/popups use themed popup/background variables and shadow (`src/styles/themes.css:369-395`), and disabled states are covered across buttons, inputs, popups, checked controls, sliders, and toolbar buttons (`src/styles/themes.css:317-340`).
- Correct: Public token contract and registry validation passed locally:
  - `npm run tokens:check` → `Token contract valid: 40 public tokens, 20 styles, version 0.1.0`
  - `npm run registry:check` → `Registry valid: 40 components, 8 blocks, 18 pages, 40 component metadata entries, 8 block metadata entries, 20 theme metadata entries, 68 standard registry items`

## Verdict
**Not production-ready for the stated Bento target yet.** The theme is generally usable and readable, but the “teal controls” part is inconsistent across dark mode and several important control states. Light-mode primary buttons are teal, but checked/selected/focus/progress states still use orange `--accent`, and dark-mode primary controls fall back to orange entirely.

## Blockers
- **Bento controls are not consistently teal, especially in dark mode.** Evidence:
  - Base Bento tokens define orange `--accent` and teal `--teal` in light mode (`src/styles/tokens.css:11-13`) and orange `--accent` plus teal `--teal` in dark mode (`src/styles/tokens.css:108-110`).
  - The only Bento-specific theme override switches **light mode only** primary buttons to teal (`src/styles/themes.css:41-44`). There is no corresponding `[data-style='bento'][data-theme='dark']` override.
  - Default buttons read from `--theme-primary` / `--theme-primary-hover` (`src/styles/themes.css:266-274`), so dark Bento default buttons use the global dark `--theme-primary: var(--accent)` from `src/styles/themes.css:1-3`, i.e. orange rather than teal.
  - Common control states are hard-wired to `--accent`, not `--theme-primary`/`--teal`: focused inputs use `--accent` (`src/styles/themes.css:259-263`), checked checkbox/radio/switch states use `--accent` (`src/styles/themes.css:343-347`), slider/meter/progress indicators use `--accent` (`src/styles/themes.css:356-362`), and selected select/combobox items use `--accent` (`src/styles/themes.css:413-416`). This makes the visible state language orange even when the target says teal controls.

## Polish / non-blocking observations
- Bento is implemented as the default/root token set rather than an explicit `[data-style='bento']` token block. This is valid per registry/default behavior (`registry/registry.json:24`) and token checks pass, but it makes Bento less self-documenting than the named styles.
- Component demo cards are flatter than Bento product cards: `.demo-card` and `.block-preview` use `background: var(--surface)` without a shadow in the docs app (`src/App.css:674-680`, `src/App.css:1241-1248`). Product/block components have softer depth, but docs previews may under-represent the target feel unless the preview relies on `BentoCard`/blocks.
- The state coverage is broad: focus, hover, disabled, checked, selected, open, popups, errors, overlays, forms, and block tokens are all present. The issue is mainly color-token alignment, not missing selectors.

## Smallest fixes
1. Add a Bento dark-mode primary override mirroring light mode:
   - `[data-style='bento'][data-theme='dark'] { --theme-primary: var(--teal); --theme-primary-hover: /* darker/lower-luminance teal suitable for dark */; }`
2. For Bento only, align state colors with teal without changing other themes. Smallest scoped rule set:
   - `[data-style='bento'] { --theme-primary: var(--teal); --theme-primary-hover: ...; --theme-focus: color-mix(in srgb, var(--teal), transparent 62%); }`
   - `[data-style='bento'] .bento-checkbox[data-checked], [data-style='bento'] .bento-radio[data-checked], [data-style='bento'] .bento-switch[data-checked], [data-style='bento'] .bento-radio-indicator, [data-style='bento'] .bento-slider-indicator, [data-style='bento'] .bento-slider-thumb, [data-style='bento'] .bento-meter-indicator, [data-style='bento'] .bento-meter-mid, [data-style='bento'] .bento-progress-indicator { border-color: var(--teal); background: var(--teal); }`
   - `[data-style='bento'] .bento-select-item[data-selected], [data-style='bento'] .bento-combobox-item[data-selected] { color: var(--teal); }`
3. Optional preview polish: add a small Bento-scoped shadow to `.demo-card` / `.block-preview` if the public preview should visually match “warm modular product cards with soft depth.”

## Validation commands
Run after fixes:
```bash
npm run tokens:check
npm run registry:check
npm run lint
npm run test
npm run build
THEME_E2E_SCOPE=smoke THEME_E2E_STYLES=bento npm run themes:e2e
npm run previews:generate
npm run previews:check
```

Note: `plan.md` and `progress.md` were requested as inputs but were not present at `/home/bangwu/code/bento-base/plan.md` or `/home/bangwu/code/bento-base/progress.md` during this audit.

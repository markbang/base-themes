# Theme audit: mono

## Verdict

**Conditionally production-ready, with one state-usability blocker before calling the theme fully complete.** The core `mono` palette matches the stated target: it is black/white/gray in both light and dark modes, maps semantic accent tokens to ink instead of decorative hues, removes shadow depth, and uses zero-radius theme tokens. The theme is present in docs/registry metadata and the package CSS build includes it.

However, several semantic component states collapse to the exact same visual treatment in `mono`. Most notably, `Meter` high/mid/low bands become indistinguishable because the theme maps success, primary, and danger to the same ink value and there is no non-color fallback pattern. That makes the theme not yet fully usable across all states without adding non-color affordances.

Plan/progress note: `/home/bangwu/code/bento-base/plan.md` and `/home/bangwu/code/bento-base/progress.md` were requested but are not present in this checkout, so this audit is based on direct file inspection.

## Correct

- **Target palette is monochrome.** Light mode sets background/surface/text/borders plus `--accent`, `--teal`, `--blue`, and `--green` to white/black/grays only (`src/styles/tokens.css:1655-1696`). Dark mode does the same with inverted ink values (`src/styles/tokens.css:1698-1739`).
- **Primary/secondary foreground contrast is coherent.** `mono` sets `--theme-primary-foreground: var(--bg)` and active state text to `var(--bg)`, so black controls in light mode use white text and white controls in dark mode use black text (`src/styles/themes.css:66-70`).
- **Decorative color dependency is mostly removed at the token layer.** Public semantic aliases derive from the mono token values: `--bt-primary` from `--accent`, `--bt-secondary` from `--teal`, `--bt-info` from `--blue`, `--bt-success` from `--green`, and `--bt-danger` from `--theme-danger` (`src/styles/tokens.css:33-41`). In mono, those all resolve to ink values, not hue-coded colors (`src/styles/tokens.css:1665-1669`, `src/styles/tokens.css:1708-1712`; `src/styles/themes.css:66-70`).
- **Common interactive states are covered.** Disabled controls use opacity and disabled surface tokens (`src/styles/themes.css:317-341`); checked checkbox/radio/switch states use accent ink (`src/styles/themes.css:344-347`); popups/overlays inherit popup background/text/border/shadow tokens (`src/styles/themes.css:369-395`); selected/open/toggled states use active text/background tokens (`src/styles/themes.css:398-443`); mono-specific hover and active nav/style-switcher rules keep hover subtle and active inverse (`src/styles/themes.css:487-506`).
- **Overlay surfaces remain in-token and monochrome.** Dialog/menu/select/combobox/nav/popover/preview/tooltip/toast/alert/drawer popups use `--theme-popup-bg`, `--theme-popup-text`, `--line`, and `--shadow`; for mono, shadows are `none`, leaving border/surface separation (`src/styles/themes.css:369-383`, `src/styles/tokens.css:1670-1683`, `src/styles/tokens.css:1713-1726`).
- **Docs/metadata alignment exists.** Theme metadata describes `mono` as “Black-and-white ink system with no decorative color dependency” (`src/docs/themeMeta.json:20`), README lists the same description (`README.md:165`) and includes a Mono preview (`README.md:96`), and registry item metadata is present (`registry/items/theme-mono.json:3-6`, `registry/items/theme-mono.json:63-72`).
- **Token contract and registry validation pass.** `npm run tokens:check` reports “Token contract valid: 40 public tokens, 20 styles,” and `npm run registry:check` reports valid registry metadata including 20 theme metadata entries.

## Blockers

1. **Meter status bands lose all semantic distinction in mono.**
   - Evidence: `Meter` assigns three classes based on percentage: `bento-meter-high`, `bento-meter-low`, and `bento-meter-mid` (`src/components/ui/Meter.tsx:12-17`). CSS maps these to success, danger, and primary respectively (`src/components/ui/Meter.css:21-30`). The global themed rules also map meter mid/indicator/progress to `--accent` and low to `--theme-danger` (`src/styles/themes.css:355-363`, `src/styles/themes.css:446-453`). In mono light mode `--green`, `--accent`, and `--theme-danger` all resolve to black (`src/styles/tokens.css:1665-1669`, `src/styles/themes.css:66-67`); in dark mode they resolve to white (`src/styles/tokens.css:1708-1712`, `src/styles/themes.css:66-67`).
   - Impact: high/mid/low meter states are visually identical unless the consumer adds external labels. This fails the “usable across components/states” goal for a status component and also lacks a non-color cue, which is especially important for a no-decorative-color theme.
   - Smallest fix: add mono-specific non-color status treatments, e.g. solid fill for mid, stripe/hatch for high, outline/segmented pattern for low, and keep labels available. Example scope should be limited to `[data-style='mono'] .bento-meter-high`, `.bento-meter-mid`, and `.bento-meter-low`.

## Polish / follow-up

- **Selected menu/select/combobox items are technically distinguishable but subtle.** Selected items use `color: var(--accent)` plus heavier weight (`src/styles/themes.css:413-416`), but in mono that color equals normal foreground ink in many contexts. Highlighted selected items become inverse via `--theme-control-active` (`src/styles/themes.css:419-422`), but non-highlighted selected rows mostly rely on weight or any Base UI item indicator. Consider a mono-specific underline, side rule, or explicit indicator styling for `.bento-select-item[data-selected]` and `.bento-combobox-item[data-selected]`.
- **Radius intent is not consistently reflected by component CSS.** Mono sets `--radius` and `--radius-sm` to `0px` (`src/styles/tokens.css:1670-1673`, `src/styles/tokens.css:1713-1716`), so tokenized cards/buttons/popups square off. Some component internals remain hard-rounded: checkbox uses `border-radius: 5px` (`src/components/ui/Checkbox.css:1-20`), switch uses `999px` track/thumb (`src/components/ui/Switch.css:1-30`), and progress/slider/meter tracks are pill-shaped (`src/components/ui/Progress.css:8-18`, `src/components/ui/Slider.css:14-33`, `src/components/ui/Meter.css:7-17`). This is not a color blocker, but if `mono` is intended as a strict rectilinear ink system, add scoped radius overrides.
- **Error states are monochrome but could use a stronger non-color affordance.** `mono` intentionally sets `--theme-danger: var(--text-strong)` (`src/styles/themes.css:66-67`), and error text/meter-low consume danger (`src/styles/themes.css:446-453`; `src/components/ui/Field.css:17-19`; `src/components/ui/Input.css:39-42`). This matches the no-red requirement, but error text may look like ordinary strong text. Consider mono-specific underline, left rule, icon slot, or border change for `.bento-field-error` and invalid inputs if invalid states are shown in forms.
- **Progress uses a gradient declaration even though mono resolves both ends to the same ink.** `Progress.css` uses `linear-gradient(90deg, var(--bt-secondary), var(--bt-primary))` (`src/components/ui/Progress.css:14-18`). In mono this becomes a flat black/white fill, so it is not a decorative-color dependency. A mono-specific `background: var(--accent)` override would reduce unnecessary gradient semantics but is optional.
- **README and theme metadata are aligned, but previews were not regenerated in this audit.** The preview file is referenced by README and registry metadata (`README.md:96`, `registry/items/theme-mono.json:59-60`). Run the preview checks/generation before release if visual output changed.

## Smallest fixes

1. Add `[data-style='mono']` non-color status variants for `Meter` high/mid/low.
2. Add `[data-style='mono']` selected-item affordances for select/combobox/menu rows, such as underline or a side border, so selected state does not rely mostly on weight.
3. Add mono-specific error affordances if form invalid states need to stand out without red, e.g. bold + underline/left border for `.bento-field-error` and `aria-invalid` inputs.
4. Optionally square mono-only hard-rounded controls where compatible with usability: checkbox, progress/meter/slider tracks, and possibly switch if the design target is strict print/ink geometry.

## Validation commands

Commands run:

```bash
npm run tokens:check
npm run registry:check
npm run build:lib
```

Recommended before release:

```bash
npm run lint
npm run test
npm run build
npm run themes:e2e
npm run previews:check
npm run previews:generate   # only if preview assets need updating
npm run package:smoke
```

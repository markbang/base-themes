# Playful theme production-readiness audit

## Verdict

**Not production-ready until one component-state regression is fixed.** The Playful token palette and most shared state styling match the target (“Rounded, bright, friendly components for creative and education tools”), with readable light/dark foregrounds and consistent scoped token usage. However, the theme currently changes radio controls from circular radios into rounded squares, which makes the radio state visually conflict with checkbox semantics.

## Review

### Correct

- **Theme identity and docs are aligned.** `src/docs/themeMeta.json:17` describes Playful as “Rounded, bright, friendly components for creative and education tools,” and `registry/items/theme-playful.json:5-6` repeats the same public description.
- **README preview is present and aligned.** `README.md:92` lists the Playful preview, and `public/previews/base-themes-playful.png` exists.
- **Light and dark tokens are complete and scoped.** `src/styles/tokens.css:1315-1356` defines Playful light tokens, and `src/styles/tokens.css:1358-1397` defines Playful dark tokens under `[data-style='playful'][data-theme='dark']`.
- **Readability is generally good.** Key pairs are high contrast by computed inspection: light primary `#ffffff` on `#7c3aed` is ~5.70:1; dark primary foreground `#211331` on `#f0abfc` is ~9.93:1; dark text `#eadcff` on `#211331` is ~13.46:1.
- **Core states use the shared state contract.** Focus, disabled, checked, highlighted, selected, pressed/open, popup, and error styling are handled in `src/styles/themes.css:250-453`. In particular:
  - focus outlines and input rings: `src/styles/themes.css:250-263`
  - disabled opacity/cursor and disabled input backgrounds: `src/styles/themes.css:317-340`
  - checked checkbox/radio/switch styling: `src/styles/themes.css:343-363`
  - popup surfaces/arrows: `src/styles/themes.css:369-395`
  - highlighted/selected/open/pressed states: `src/styles/themes.css:398-443`
  - error/danger states: `src/styles/themes.css:446-453`
- **Rounded/friendly styling is applied to primary components.** Playful-specific selectors round buttons, inputs, select/combobox/menu/dialog/tooltip popups, tabs, and checkbox/radio controls in `src/styles/themes.css:572-615`.
- **Token contract and registry checks pass.** `npm run tokens:check` reported `Token contract valid: 40 public tokens, 20 styles, version 0.1.0`; `npm run registry:check` reported valid registry metadata including 20 theme metadata entries.

### Blocker

1. **Radio controls are styled as rounded squares in Playful.**
   - Evidence: the base radio component is intentionally circular with `border-radius: 999px` in `src/components/ui/RadioGroup.css:7-13`, and its indicator is circular in `src/components/ui/RadioGroup.css:23-27`.
   - Regression: Playful overrides both `.bento-checkbox` and `.bento-radio` to `border-radius: 6px` in `src/styles/themes.css:612-615`.
   - Impact: radio buttons become checkbox-like rounded squares while retaining a circular indicator, which weakens form semantics and makes checked/unchecked radio states less recognizable across forms.
   - Smallest fix: keep checkbox at `6px`, but restore Playful radios to `999px` (or remove `.bento-radio` from the Playful override):
     - `[data-style='playful'] .bento-checkbox { border-radius: 6px; }`
     - `[data-style='playful'] .bento-radio { border-radius: 999px; }`

### Polish / follow-up

- **Disabled primary buttons can still receive the Playful hover transform.** `src/styles/themes.css:578-580` scales primary Playful buttons on `:hover`, while disabled handling at `src/styles/themes.css:317-331` only changes cursor/opacity. Consider excluding `:disabled` and `[data-disabled]` from the Playful hover selector so disabled controls do not animate.
- **Some overlay families rely only on base radius tokens, not Playful-specific selectors.** Playful explicitly rounds menu/select/combobox/dialog/tooltip popups (`src/styles/themes.css:596-601`), while popover, preview card, toast, alert dialog, nav menu popup, and drawer rely on `--radius: 18px` from `src/styles/tokens.css:1332`. This is usable, but adding them to the Playful popup selector would make the intent clearer and reduce drift.
- **Preview verification is smoke-scoped and does not include Playful.** `npm run previews:check` passed, but it only verified five styles (`bento`, `shadcn`, `enterprise`, `terminal`, `cyberpunk`) in the current script output. The README preview file exists, but a targeted Playful screenshot check would provide stronger coverage.

## Smallest fixes

1. Restore radio shape for Playful:
   - Change the Playful checkbox/radio block at `src/styles/themes.css:612-615` so only checkbox gets `6px`, and radio remains `999px`.
2. Guard Playful hover animation against disabled controls:
   - Add `:not(:disabled):not([data-disabled])` to the Playful primary hover selector at `src/styles/themes.css:578`.
3. Optional clarity-only polish:
   - Extend the Playful popup radius selector at `src/styles/themes.css:596-601` to include `.bento-nav-menu-popup`, `.bento-popover-popup`, `.bento-preview-card`, `.bento-toast`, and `.bento-alert-popup`.

## Validation commands

Commands run during audit:

```bash
npm run tokens:check
npm run registry:check
npm run previews:check
```

Recommended after fixes:

```bash
npm run tokens:check
npm run registry:check
npm run test
npm run themes:e2e
npm run previews:generate
npm run previews:check
```

Note: `/home/bangwu/code/bento-base/plan.md` and `/home/bangwu/code/bento-base/progress.md` were not present when inspected, so this audit is based on the repository files listed above.

# Soft UI theme production-readiness audit

## Verdict

**Conditional pass / no release-blocking usability defects found.** The `soft-ui` theme is present in the token system, docs metadata, README, preview assets, and built CSS, and it generally matches the stated direction: low-contrast neumorphic surfaces with raised and inset shadows. Text and action foreground colors have usable contrast in both modes based on the token values inspected.

The main readiness risk is **visual consistency**, not functional breakage: several controls that should read as recessed/pressed in a Soft UI system are still rendered as bright accent-filled controls or raised controls. I would ship only after a quick visual pass on the polish items below.

Context note: `/home/bangwu/code/bento-base/plan.md` and `/home/bangwu/code/bento-base/progress.md` were requested but are not present in this checkout, so this audit used direct source inspection.

## Correct

- **Theme identity is registered consistently.** `soft-ui` appears in the source style list (`src/styles/themeList.ts:19-22`), docs metadata (`src/docs/themeMeta.json:19`), README theme list (`README.md:163`), README preview table (`README.md:94`), and the preview asset exists at `public/previews/base-themes-soft-ui.png`.
- **Light and dark token sets are complete and scoped.** The theme defines light tokens under `[data-style='soft-ui']` and dark overrides under `[data-style='soft-ui'][data-theme='dark']` (`src/styles/tokens.css:1483-1544`). Scope is selector-based and does not leak outside `data-style='soft-ui'`.
- **Soft UI tactile primitives exist.** Light mode uses same-color page/surface controls (`--bg`, `--surface`, and `--card-bg` all `#e9eef5`) with raised and inset shadows (`src/styles/tokens.css:1483-1500`). Dark mode mirrors this with dark surfaces and dark raised/inset shadows (`src/styles/tokens.css:1527-1544`).
- **Radius/density are appropriate for Soft UI.** The theme uses large rounded corners (`--radius: 18px`, `--radius-sm: 12px`) and a lighter control font weight override (`src/styles/tokens.css:1501-1502`, `src/styles/tokens.css:1767-1772`).
- **Core contrast is usable.** From inspected token values: light default text `#536071` on `#e9eef5` is about 5.49:1, light strong text `#2f3a4a` on `#e9eef5` is about 9.87:1, dark default text `#c4cfdd` on `#151b24` is about 10.97:1, and dark strong text `#eef4ff` on `#151b24` is about 15.67:1 (`src/styles/tokens.css:1484-1490`, `src/styles/tokens.css:1528-1534`). Primary foregrounds are also acceptable: white on light blue `#2563eb` is about 5.17:1, and dark background text on dark accent `#8fb4ff` is about 8.35:1 (`src/styles/tokens.css:1493`, `src/styles/tokens.css:1537`; foreground inheritance from `src/styles/themes.css:4`, `src/styles/themes.css:17-19`).
- **State coverage exists for the important shared states.** Focus, hover, disabled, checked, selected/highlighted, open/pressed, popup, and error styling are covered by shared theme rules: focus and input focus (`src/styles/themes.css:250-264`), button hover (`src/styles/themes.css:266-314`), disabled (`src/styles/themes.css:317-340`), checked controls (`src/styles/themes.css:343-353`), popup surfaces (`src/styles/themes.css:369-395`), highlighted/selected items (`src/styles/themes.css:398-423`), pressed/open/tabs/style-switcher states (`src/styles/themes.css:425-443`), and error/danger states (`src/styles/themes.css:446-453`).
- **Overlays/popups align with the theme tokens.** Select/menu/combobox/popover/tooltip/toast/dialog/alert/drawer popups inherit themed popup colors and raised shadows through the shared popup rule (`src/styles/themes.css:369-383`). Component CSS also uses `var(--bt-shadow)` for popup elevation, e.g. Select popup (`src/components/ui/Select.css:33-39`), Dialog popup (`src/components/ui/Dialog.css:9-20`), Popover popup (`src/components/ui/Popover.css:1-7`), Toast (`src/components/ui/Toast.css:11-22`).
- **Token contract remains valid.** `npm run tokens:check` passed with `Token contract valid: 40 public tokens, 20 styles, version 0.1.0`.
- **Built CSS contains the theme.** `dist/base-themes.css` includes `data-style=soft-ui` / `soft-ui` entries, so the distributed CSS is not missing the theme.

## Blockers

- **None found in this review.** I did not find a contrast, scope, missing-registration, missing-dark-mode, or broken-token issue severe enough to block release.

## Polish / risks before calling it production-perfect

1. **Primary and checked controls are more bright-blue than low-contrast Soft UI.** Shared theme rules make all default buttons use `--theme-primary`/`--accent` (`src/styles/themes.css:266-274`), and checked checkbox/radio/switch states use the same accent fill (`src/styles/themes.css:343-347`). For Soft UI light mode that accent is `#2563eb` (`src/styles/tokens.css:1493`), so default buttons and checked controls are high-saturation blue rather than low-contrast tactile surfaces. This is usable, but it weakens the target aesthetic.

2. **Inputs/selects are raised by default instead of recessed.** The Soft UI override applies `box-shadow: var(--shadow)` to buttons, select triggers, combobox inputs, text inputs, textareas, number fields, checkbox/radio/switch, tabs list, toolbar, and docs cards (`src/styles/themes.css:460-476`). Since `--shadow` is the raised shadow (`src/styles/tokens.css:1499`, `src/styles/tokens.css:1543`), form controls such as `.bento-input` / `.bento-textarea` (`src/components/ui/Input.css:1-18`) and `.bento-select-trigger` (`src/components/ui/Select.css:1-15`) read as raised rather than inset until focus. That is a stylistic mismatch for common Soft UI form fields.

3. **Base blocks become inset panels because they use `--bt-shadow-strong`.** Blocks use `box-shadow: var(--bt-shadow-strong)` (`src/blocks/Blocks.css:1-10`), and `--bt-shadow-strong` maps to `--shadow-strong` in the token contract (`src/styles/tokens.css:47-48`). Soft UI defines `--shadow-strong` as an inset shadow in both light and dark mode (`src/styles/tokens.css:1500`, `src/styles/tokens.css:1544`), so full blocks can appear pressed/sunken rather than as raised content cards. This is probably acceptable for a showcase but can look odd in dashboard blocks.

4. **Active/inset states are not consistently applied to all selected/checked controls.** Soft UI explicitly switches only button `:active`, toggle pressed, tabs indicator, and style-switcher active to `--shadow-strong` (`src/styles/themes.css:479-484`). Checked checkbox/radio/switch controls get accent fills from the shared rule (`src/styles/themes.css:343-347`) and are also included in the raised-shadow group (`src/styles/themes.css:466-468`), so checked states are filled + raised rather than inset/pressed.

5. **Open state coverage is generic, not Soft UI-specific.** Menubar open states are styled by shared selected/open rules (`src/styles/themes.css:425-443`), but Select/Combobox trigger open states do not have a dedicated Soft UI inset/open treatment. Focus and popup display remain usable, but open select/combobox triggers do not visibly press in.

## Smallest fixes

1. **Split Soft UI raised vs inset control shadows.** Keep raised shadows for buttons/cards/popups, but apply inset shadows to form fields and pressed/checked/open controls. Minimal selector-only fix:
   - keep `var(--shadow)` on `.bento-button`, `.bento-tabs-list`, `.bento-toggle-group`, `.bento-toolbar`, `.demo-card`, `.block-preview`, `.theme-swatch`;
   - use `var(--shadow-strong)` for `.bento-input`, `.bento-textarea`, `.bento-combobox-input`, `.bento-select-trigger`, `.bento-number-field-group` and for checked/pressed/open states.

2. **Make checked controls feel pressed.** Add Soft UI-specific rules for `.bento-checkbox[data-checked]`, `.bento-radio[data-checked]`, `.bento-switch[data-checked]`, and optionally `.bento-select-trigger[data-open]` / combobox open equivalents to use `box-shadow: var(--shadow-strong)` and either a quieter surface/active background or a less saturated accent mix.

3. **Consider toning down default primary buttons.** If the target is strict low-contrast Soft UI, set the default Soft UI button to a surface/raised treatment and reserve blue for `.accent`. For example, override only `[data-style='soft-ui'] .bento-button:not(.accent):not(.teal):not(.outline):not(.ghost):not(.icon)` to use surface background + strong text + raised shadow, while leaving `.accent` as the explicit high-emphasis action.

4. **Make blocks raised, not inset.** Add a Soft UI-specific block override such as `[data-style='soft-ui'] .base-block { box-shadow: var(--shadow); }`, or change `src/blocks/Blocks.css:9` from `--bt-shadow-strong` to `--bt-shadow` if raised blocks are preferred across themes.

5. **Add a screenshot regression for selected/checked/open states.** Existing preview coverage verifies theme preview assets, but a Soft UI state board should include: default/hover/active/focus/disabled buttons, input focus/error/disabled, select open + highlighted + selected, checkbox/radio/switch checked + disabled, tabs selected, menu highlighted, dialog/popover/tooltip/toast, and at least one block.

## Validation commands

Ran:

```bash
npm run tokens:check
# Passed: Token contract valid: 40 public tokens, 20 styles, version 0.1.0

npm run previews:check
# Failed because the preview server was not running: Navigation failed: net::ERR_CONNECTION_REFUSED for http://127.0.0.1:5175/...
```

Recommended before merge/release:

```bash
npm run lint
npm run test
npm run registry:check
npm run tokens:check
npm run build
npm run themes:e2e
npm run previews:check   # start the expected local preview/dev server first, if the script requires one
```

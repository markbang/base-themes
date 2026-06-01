# Theme audit group A (bento, shadcn, neo-brutalism, minimal, enterprise)

Scope: `src/styles/tokens.css`, `src/styles/themes.css`, specialist CSS, `src/index.css`, core component CSS, `src/docs/themeMeta.json`, README preview/usage. No edits made.

## bento — ready

- **Target match:** Default tokens are a credible “warm modular product cards” base: soft blue-gray background/surfaces, rust accent, teal secondary, moderate radius/shadows (`src/styles/tokens.css:1-73`). `themes.css` intentionally remaps bento light primary to teal (`src/styles/themes.css:41-43`), matching docs “teal controls” (`src/docs/themeMeta.json:2`).
- **Component states:** Core components consume semantic tokens consistently: buttons have default/hover/outline/ghost/accent/teal states (`src/components/ui/Button.css:1-64`), inputs/select/menu expose focus/highlight/selected states (`Input.css:10-17`, `Select.css:18-64`, `Menu.css:31-39`), and switch/checkbox/radio checked/focus states are tokenized (`Switch.css:12-22`, `Checkbox.css:13-21`, `RadioGroup.css:14-34`).
- **Contrast/readability:** Light and dark bento text/surface variables are conservative (`tokens.css:1-120`); overlays/toasts/dialog/popover use `--bt-fg`, `--bt-muted-fg`, and `--bt-surface` (`Dialog.css:10-31`, `Popover.css:1-21`, `Toast.css:9-30`). No obvious low-contrast component state found.
- **Docs alignment:** README quick start uses `data-style="bento" data-theme="light"` (`README.md:33-41`), preview table includes Bento (`README.md:75-81`), and metadata label/description align (`themeMeta.json:2`).

## shadcn — ready

- **Target match:** Zinc/neutral palette and shadcn-like radius are explicitly defined for light/dark (`src/styles/tokens.css:141-220`), with specialist variables for primary/muted/accent/destructive/popover/ring (`src/styles/shadcn.css:1-29`). This matches `themeMeta.json:3` and README’s “shadcn/ui-style” positioning (`README.md:7-9`).
- **Component states:** Specialist CSS covers major requested states: primary/hover/outline/icon/ghost buttons (`shadcn.css:36-64`), checkbox/radio/switch checked (`shadcn.css:66-86`), input focus ring (`shadcn.css:100-105`), selected/highlighted select items (`shadcn.css:107-115`), tabs/toggle/menubar active states (`shadcn.css:117-131`), popups/toasts/dialog/drawer (`shadcn.css:133-163`), and highlighted menu/select/combobox items (`shadcn.css:169-178`).
- **Contrast/readability:** Popovers use `#ffffff/#09090b` and `#09090b/#fafafa` (`shadcn.css:12-29`, `133-163`); primary buttons invert correctly (`shadcn.css:36-51`). Destructive color is set (`shadcn.css:9-10`, `24-25`) and field errors use it (`shadcn.css:95-98`).
- **Docs alignment:** README preview table includes shadcn (`README.md:75-81`); metadata says “Neutral zinc interface styling modeled after shadcn/ui” (`themeMeta.json:3`), consistent with tokens and specialist CSS.

## neo-brutalism — ready-with-fixes

- **Target match:** Strong visual identity is present: yellow/off-white light background, black lines, hot accent, teal secondary, 2px borders and offset shadows (`src/styles/tokens.css:222-264`, `1743-1753`; `src/styles/neo-brutalism.css:1-5`, `14-38`, `96-107`). Metadata/README naming align (`themeMeta.json:4`, `README.md:77-81`).
- **Component states:** Specialist CSS broadly covers focus (`neo-brutalism.css:7-12`), button hover/active (`52-56`), checked checkbox/radio/switch (`62-79`), selected/highlighted menu/select/tabs/toggle/toolbar/menubar/nav triggers (`109-151`), popovers/toasts/dialogs (`96-107`), and arrows (`155-159`).
- **Contrast/readability:** Most states are high contrast, but one likely bug: `themes.css` sets `--theme-primary-foreground: #000000` for neo (`src/styles/themes.css:34-39`), while base `.bento-button.accent` uses `color: var(--bt-primary-fg); background: var(--bt-primary)` (`Button.css:48-55`). Neo specialist `.bento-button.accent` only sets background `var(--accent)` (`neo-brutalism.css:58-60`). On light neo, black on `#ff4d6d` is borderline/likely below normal-text AA; white would be better for accent, or accent button should use a different foreground.
- **Fix before “ready”:** Audit/adjust accent foreground for neo brutalism, especially `.bento-button.accent` and any other `--bt-primary-fg` uses. The teal checked states use black on `#00d1b2` and are acceptable (`neo-brutalism.css:62-67`).

## minimal — ready

- **Target match:** Minimal has quiet monochrome/slate tokens, no shadows, small radii, thin borders (`src/styles/tokens.css:302-386`) plus style rules removing button/active shadows (`src/styles/themes.css:523-535`, `681-687`). This matches `themeMeta.json:5` “Swiss-inspired whitespace, thin rules, and quiet monochrome controls.”
- **Component states:** It inherits the complete core state set (button hover/focus variants, input focus, select/menu highlight/selected, tabs active, switch/checkbox/radio checked), and adds minimal-specific popup border color (`themes.css:666-673`) and highlighted item background (`themes.css:675-679`).
- **Contrast/readability:** Light text `#334155/#0f172a` on `#f8fafc/#ffffff`, dark text `#cbd5e1/#f8fafc` on `#020617/#0f172a`, and selection foreground/background are readable (`tokens.css:302-386`). No obvious state contrast issue in the reviewed core CSS.
- **Docs alignment:** README preview table includes Minimal (`README.md:79-81`); metadata aligns (`themeMeta.json:5`).

## enterprise — ready-with-fixes

- **Target match:** The blue operational palette, explicit boundaries, smaller radii, and denser dimensions are present (`src/styles/tokens.css:388-472`; `src/styles/themes.css:134-199`, `1802-1807`). Metadata says “Dense operational UI with blue actions and explicit boundaries” (`themeMeta.json:6`), which matches.
- **Component states:** Core components provide full states, and enterprise adds compact sizing for buttons, topbar icon buttons, select/input/combobox (`themes.css:187-193`) and menu/select/combobox/tabs items (`195-200`). Buttons use blue accent/hover via `--accent/#1d4ed8` and `--accent-strong/#1e40af` in light (`tokens.css:388-407`) and light-blue in dark (`432-448`).
- **Contrast/readability:** Main text/surfaces are readable (`tokens.css:388-472`). Possible issue: dark-mode muted text `#8da0bb` on surface `#0d1b31` (`tokens.css:432-441`) is acceptable-looking but relatively subdued for dense operational UI; labels/errors in small text (`Input.css:24-35`, `Toast.css:24-30`) should be visually checked.
- **Docs alignment:** README preview table includes Enterprise (`README.md:80-81`) and registry-copy examples use `theme:enterprise` (`examples/registry-copy/README.md:19-21`), aligned.
- **Fix before “ready”:** Enterprise density is only partial: requested core components `Switch`, `Checkbox`, `Radio`, `Dialog`, `Popover`, `Toast` have no enterprise-specific density/boundary refinements, relying on defaults (`Switch.css:1-36`, `Checkbox.css:1-26`, `RadioGroup.css:1-34`, `Dialog.css:10-31`, `Popover.css:1-21`, `Toast.css:9-30`). For a “dense operational UI,” add/verify compact spacing for these controls or clarify that enterprise density only affects nav/menu/input/button/tabs.

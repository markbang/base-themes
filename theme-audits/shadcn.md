# Shadcn theme production-readiness audit

## Verdict

**Conditionally production ready for the core theme CSS.** The `shadcn` palette, light/dark semantic tokens, component overrides, and public token contract are coherent and match the target “neutral zinc interface styling modeled after shadcn/ui.” I found one production-readiness blocker around **documented scope + portaled overlays**, not the color palette itself: the README demonstrates nested `data-style="shadcn"` usage with a `Select`, but the `Select` popup is portaled to `document.body` and will not inherit the nested theme scope.

## Correct

- **Neutral zinc light/dark tokens are in place.** `src/styles/tokens.css:141-183` defines light shadcn values using white/zinc surfaces (`--bg`, `--surface`, `--surface-muted`, `--text*`, `--line*`, black primary), and `src/styles/tokens.css:185-215` defines the dark counterpart (`#09090b`, `#18181b`, zinc foregrounds, zinc borders). This matches the stated target.
- **Theme-specific shadcn variables are explicit.** `src/styles/shadcn.css:1-30` defines shadcn-style primary, secondary, muted, accent, destructive, ring, and popover variables for both modes.
- **Primary/readability is generally sound.** Primary buttons are overridden to use `--shadcn-primary`/`--shadcn-primary-foreground` in `src/styles/shadcn.css:44-55`, avoiding the default Bento accent/teal styling. Hover stays in the same neutral system.
- **Focus, hover, checked, selected, open, overlay, and error states are covered.** Evidence:
  - Focus visible and input focus: `src/styles/shadcn.css:33-36`, `src/styles/shadcn.css:115-120`.
  - Button hover/outline/ghost states: `src/styles/shadcn.css:51-70`.
  - Checkbox/radio/switch checked states: `src/styles/shadcn.css:73-91`.
  - Slider/meter/progress active fill: `src/styles/shadcn.css:94-107`, `src/styles/shadcn.css:200-201`.
  - Select/combobox selected/highlighted states: `src/styles/shadcn.css:122-129`, `src/styles/shadcn.css:185-193`.
  - Tabs/toggle/toolbar/menubar active/open states: `src/styles/shadcn.css:132-145`.
  - Popup/overlay surfaces: `src/styles/shadcn.css:148-182`.
  - Field errors: `src/styles/shadcn.css:110-112`.
- **Density/radius/shadow are consistent with shadcn-like restraint.** Radius is `8px`/`6px` in `src/styles/tokens.css:158-159`, shadcn uses lighter shadows (`src/styles/tokens.css:156-157`, `src/styles/shadcn.css:141-162`), and font weight is reduced to 650 in `src/styles/tokens.css:1755-1760`.
- **Token contract checks pass.** Ran `npm run tokens:check`: `Token contract valid: 40 public tokens, 20 styles, version 0.1.0`.
- **Registry/theme metadata checks pass.** Ran `npm run registry:check`: `Registry valid: 40 components, 8 blocks, 18 pages, 40 component metadata entries, 8 block metadata entries, 20 theme metadata entries, 68 standard registry items`.
- **Docs metadata aligns with the target description.** `src/docs/themeMeta.json:3` says `Neutral zinc interface styling modeled after shadcn/ui`; README lists the same style at `README.md:147` and includes a preview image at `README.md:78`. The preview asset exists at `public/previews/base-themes-shadcn.png`.

## Blockers

1. **Portaled overlays can lose the shadcn theme when users follow the README component example.**
   - Evidence: README’s component usage example wraps components in a nested `<div data-style="shadcn" data-theme="light">` at `README.md:121-129` and includes a `Select`.
   - Evidence: `Select` renders the popup through `BaseSelect.Portal` at `src/components/ui/Select.tsx:23-25`; `Combobox` similarly portals at `src/components/ui/Combobox.tsx:33-35`; dialogs portal at `src/components/ui/Dialog.tsx:19-21`.
   - Why it matters: if `data-style`/`data-theme` are only on the nested wrapper, the portaled popup is appended outside that scope, so shadcn popup variables and overrides scoped by `[data-style='shadcn']` do not apply. This directly affects overlays/popups and makes the README’s shadcn `Select` example unreliable.
   - Smallest fix: update README/docs to state that `data-style` and `data-theme` must be applied to `html`/`body` (or a portal container that also carries the attributes) for portaled components. Prefer changing the component example to avoid implying nested wrapper scoping is safe for `Select`, `Combobox`, `Dialog`, `Popover`, `Tooltip`, etc.

## Polish / follow-up

- **Selected combobox highlight uses generic active styling instead of the shadcn-specific selected-highlight rule.** `src/styles/shadcn.css:127-129` only specializes `.bento-select-item[data-selected][data-highlighted]`; `.bento-combobox-item[data-selected][data-highlighted]` falls back to the more specific generic rule in `src/styles/themes.css:426-429`. Add the combobox selector beside the select selector for exact shadcn accent consistency.
- **Invalid form controls only show error text; the control border/ring is not destructive.** `Field` sets `invalid={Boolean(error)}` at `src/components/ui/Field.tsx:15` and renders `.bento-field-error` at `src/components/ui/Field.tsx:19`; shadcn colors that error text in `src/styles/shadcn.css:110-112`. Inputs themselves keep normal/focus border styling (`src/components/ui/Input.css:1-18`, `src/styles/shadcn.css:115-120`). For a closer shadcn/ui match, add scoped invalid selectors such as `[data-style='shadcn'] .bento-field[data-invalid] .bento-input` / `.bento-textarea` with destructive border and focus ring.
- **Destructive foreground token should be checked before adding destructive buttons.** In dark mode `--shadcn-destructive: #ef4444` with `--shadcn-destructive-foreground: #fafafa` is defined at `src/styles/shadcn.css:26-27`; that foreground/background pair is only about 3.6:1 contrast. It is currently safe for error text on dark backgrounds, but not enough for normal-size text on a destructive red button.

## Smallest fixes

1. README/docs: add a short “Portal scope” note and change the shadcn `Select` example so it does not imply nested `data-style` works for portaled popups.
2. CSS: change `src/styles/shadcn.css:127` selector to include `.bento-combobox-item[data-selected][data-highlighted]` alongside select.
3. CSS: add invalid field control styling under `[data-style='shadcn']` for inputs/textareas/combobox inputs when their parent field is invalid.
4. Optional token tweak before destructive variants ship: use a darker destructive token in dark mode when paired with `#fafafa`, or change destructive foreground to a dark foreground if the red remains `#ef4444`.

## Validation commands

Already run:

```bash
npm run tokens:check
npm run registry:check
```

Recommended before release, with a docs preview server running at the expected URL:

```bash
npm run lint
npm run test
npm run build
THEME_E2E_STYLES=shadcn npm run themes:e2e
THEME_PREVIEW_STYLES=shadcn npm run previews:check
npm run package:smoke
```

Additional manual check: open a shadcn page with `data-style` only on a nested wrapper, open `Select`/`Combobox`/`Dialog`, and verify the popup loses the theme; then repeat with `data-style`/`data-theme` on `html` to confirm the documented fix.

## Scope note

`/home/bangwu/code/bento-base/plan.md` and `/home/bangwu/code/bento-base/progress.md` were requested as inputs but were not present in this checkout, so this audit is based on direct inspection of source, docs metadata, README snippets, dist presence checks, and the validation commands above.

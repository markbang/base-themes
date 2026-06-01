# Focused CSS theme audit — group D

Scope: `playful`, `luxury`, `soft-ui`, `bauhaus`, `mono`. Reviewed `src/styles/tokens.css`, `src/styles/themes.css`, `src/index.css`, core UI CSS for buttons/forms/menus/overlays/tabs/switches, `src/blocks/Blocks.css`, `src/docs/themeMeta.json`, and README preview/theme section. No edits made.

## Shared findings

- Component state coverage is broadly present. Base controls define hover/focus/disabled states in component CSS (`Button.css:18-76`, `Input.css:93-98`, `Menu.css:169-177`, `Select.css:212-272`, `Tabs.css:352-366`, `Switch.css:402-421`) and theme overrides remap those states through semantic tokens (`themes.css:266-353`, `themes.css:369-442`).
- Overlays use tokenized surface/text/border/shadow (`Menu.css:134-147`, `Dialog.css:283-293`, `Toast.css:13-21`, `Popover.css:1-7`), then `themes.css:369-393` normalizes popup color/background/arrow fill across styles.
- Blocks consume public `--bt-*` tokens only (`Blocks.css:1-18`, `Blocks.css:477-495`, `Blocks.css:532-555`), so all five themes inherit the same semantic contrast behavior.
- Bundled CSS imports the token and theme layers before component specialty files (`src/index.css:1-8`), so these five themes are available through `tokens.css`/`themes.css` even without separate per-theme CSS files.
- Docs alignment is good: all five are in `themeMeta.json:17-21` and README preview rows exist at `README.md:92-96`.

## Playful — verdict: ready

Evidence:
- Target match: tokens use warm cream, purple foregrounds, lavender borders, high radius, and bright purple accent (`tokens.css:1315-1356`); dark mode preserves a playful purple palette (`tokens.css:1358-1397`). `themeMeta.json:17` describes “Rounded, bright, friendly components,” matching implementation.
- Component states: theme-specific CSS makes buttons pill-shaped, adds friendly hover scale/shadow, rounds forms/popups/tabs/checks (`themes.css:570-613`). Shared active/highlight states remain tokenized (`themes.css:398-442`) and focus is covered (`themes.css:253-263`, `index.css:723-727`).
- Contrast/readability: primary button foreground remains white by default (`themes.css:4`, used by `themes.css:266-303`) over `#7c3aed/#6d28d9` in light (`tokens.css:1325-1326`) and dark-mode primary foreground is `var(--bg)` (`themes.css:18`) over `#f0abfc/#f5d0fe` (`tokens.css:1368-1369`), both readable. Text and muted text have distinct purple-on-cream or lavender-on-dark pairs (`tokens.css:1319-1322`, `tokens.css:1362-1365`).
- Docs: README row and theme metadata agree (`README.md:92`, `themeMeta.json:17`).

Notes: no blocking issues. The hover transform in `themes.css:578-581` is appropriate for the target, though consumers sensitive to motion may want a reduced-motion layer later.

## Luxury — verdict: ready-with-fixes

Evidence:
- Target match: default theme is dark premium with gold accents, serif headings, fine-line hierarchy (`tokens.css:1399-1440`, `themes.css:122-125`, `themes.css:711-729`). Light variant exists at `tokens.css:1442-1481`. `themeMeta.json:18` explicitly says “Dark premium surfaces, gold accents, and fine-line hierarchy.”
- Component states: dark luxury is explicitly included in the primary foreground override group (`themes.css:25-31`), and light luxury gets a foreground override (`themes.css:46-49`). Menu highlighted/selected-highlighted uses gold tint (`themes.css:719-724`); selected tabs switch to accent gold (`themes.css:726-729`).
- Contrast/readability: default dark surface/text choices are strong (`tokens.css:1399-1407`). The light primary button uses `--accent: #9f7a36` (`tokens.css:1452`) with `--theme-primary-foreground: #0d0b09` (`themes.css:46-49`), which is readable but low-margin for smaller button text compared with the other high-contrast themes. Teal foreground in light luxury is also `#0d0b09` (`themes.css:46-49`) on `#4fa79a` (`tokens.css:1454`), which is visually marginal for normal text.
- Docs: metadata and README preview are aligned (`themeMeta.json:18`, `README.md:93`).

Fixes before “ready”: increase light luxury button foreground contrast, e.g. use a darker accent/teal or keep dark foreground only where contrast is verified. Consider documenting that luxury’s default/no-`data-theme` variant is intentionally dark, since the metadata says “Dark premium” but README only provides a preview row.

## Soft UI — verdict: ready-with-fixes

Evidence:
- Target match: neumorphic/tactile palette and raised/inset shadows are defined (`tokens.css:1483-1525`, dark at `tokens.css:1527-1567`), and theme CSS applies the soft shadow/border treatment to buttons, fields, switches, tabs, toolbars, demo cards, block previews, and swatches (`themes.css:460-483`). `themeMeta.json:19` accurately says “Low-contrast tactile controls with inset and raised shadows.”
- Component states: focus, disabled, checked, highlighted, selected, tabs, and overlays all flow through shared state rules (`themes.css:253-353`, `themes.css:398-442`). Soft UI adds pressed/inset states for buttons/toggles/tabs/style switcher (`themes.css:479-483`).
- Contrast/readability: body text `#536071` on `#e9eef5` and strong text `#2f3a4a` are acceptable (`tokens.css:1483-1495`); dark mode text is clear (`tokens.css:1527-1539`). The target is intentionally low contrast, but several surfaces are identical to page background in light mode (`--bg`, `--surface`, `--card-bg`, `--chip-bg`, `--group-bg`, `--nav-bg` all `#e9eef5`, `tokens.css:1483-1512`), so component boundaries rely heavily on shadows. In high-contrast or shadow-reduced environments, forms/blocks may lose affordance despite `--soft-ui-control-border` (`tokens.css:1498`, `themes.css:475`).
- Docs: metadata and README preview are aligned (`themeMeta.json:19`, `README.md:94`).

Fixes before “ready”: strengthen non-shadow boundaries for light Soft UI (slightly different `--surface`/`--card-bg` or stronger `--line-strong`) so controls remain distinguishable when shadows are subtle or disabled.

## Bauhaus — verdict: ready

Evidence:
- Target match: primary red/yellow/blue palette, black lines, square geometry, hard offset shadows, and zero radius are defined in tokens (`tokens.css:1569-1610`, dark at `tokens.css:1612-1653`). Theme-specific CSS enforces uppercase geometric buttons, 2px square inputs/popups, square slider/switch/check/radio (`themes.css:617-660`). `themeMeta.json:20` matches this.
- Component states: global Bauhaus overrides increase border width (`tokens.css:1744-1745`) and set black primary foreground plus yellow active state (`themes.css:35-39`). Highlighted menu/select items use `--surface-muted`/yellow with strong text (`themes.css:643-648`), while checked controls/buttons/focus remain covered by shared state rules (`themes.css:253-353`).
- Contrast/readability: light mode has black text/lines on cream/yellow surfaces (`tokens.css:1569-1587`) and dark mode has cream text/lines on black surfaces (`tokens.css:1612-1630`). Button text is black on red by override (`themes.css:35-37` with `tokens.css:1579-1580`), a good graphic Bauhaus pairing. Blocks remain legible via `--bt-*` mapping (`Blocks.css:1-18`).
- Docs: metadata and README preview are aligned (`themeMeta.json:20`, `README.md:95`).

Notes: no blocking issues. The selected/highlighted yellow menu state is visually loud but matches the style target.

## Mono — verdict: ready

Evidence:
- Target match: all semantic colors collapse to black/white/gray with no shadows and zero radius (`tokens.css:1655-1696`, dark at `tokens.css:1698-1739`), plus `themeMeta.json:21` states “Black-and-white ink system with no decorative color dependency.”
- Component states: mono has dedicated active/highlight overrides: highlighted menus remain muted gray (`themes.css:487-496`), active nav/style switcher invert foreground/background (`themes.css:500-505`), dark cards invert cleanly (`themes.css:512-520`), and shadows are removed from buttons (`themes.css:523-535`). Shared focus/disabled/checked/select/tab/switch rules still apply (`themes.css:253-353`, `themes.css:398-442`).
- Contrast/readability: primary foreground is `var(--bg)` on `var(--accent)` (`themes.css:66-70`, `tokens.css:1665-1666`, `tokens.css:1708-1709`), producing black-on-white or white-on-black. Text, muted text, lines, code, selection, and backdrop are all monochrome and readable (`tokens.css:1655-1696`, `tokens.css:1698-1739`).
- Docs: metadata and README preview are aligned (`themeMeta.json:21`, `README.md:96`).

Notes: no blocking issues. Mono intentionally removes semantic color distinctions (`--teal`, `--blue`, `--green` equal primary at `tokens.css:1667-1669` and `tokens.css:1710-1712`), but this matches the documented target; state is conveyed by inversion, borders, weight, and layout rather than hue.

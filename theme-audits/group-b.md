# Focused CSS theme audit — group B

Scope read: `src/styles/tokens.css`, `src/styles/themes.css`, `src/styles/glass.css`, `src/styles/terminal.css`, `src/styles/material.css`, `src/index.css`, core UI CSS for buttons/forms/menus/overlays/tabs/switches, `src/docs/themeMeta.json`, and README theme section. No edits made.

Shared component baseline: component CSS exposes the needed states: buttons default/hover/focus/variants (`src/components/ui/Button.css:1-79`), inputs focus/error labels (`Input.css:1-50`), menu/select highlighted/disabled/selected (`Menu.css:40-47`, `Select.css:66-76`), tabs selected/indicator/panel (`Tabs.css:26-58`), switch checked/focus (`Switch.css:15-35`), and dialog overlay/popup (`Dialog.css:1-20`). Theme overrides are globally imported in order (`src/index.css:1-8`).

## linear — ready-with-fixes

**Evidence:** Tokens define a coherent Linear-like product palette: light/dark surfaces, violet primary, subtle borders/shadows (`src/styles/tokens.css:474-557`) and matching behavior weight/letter-spacing (`tokens.css:1756-1758`, `1803`). Component overrides cover buttons, inputs/selects, popups, and dark highlighted menu/select/combobox rows (`src/styles/themes.css:734-755`). Docs align: README and meta both call it “Developer-tool polish...” (`README.md:151`, `src/docs/themeMeta.json:7`).

**Component states:** Base states are good, but Linear-specific treatment is thin: no custom focus, selected tabs/switches/checkboxes beyond generic theme rules (`themes.css:250-335`), so it reads as generic rounded-violet rather than Linear across all components. Popups only target menu/select/dialog, not combobox/nav/popover/tooltip/toast/drawer (`themes.css:746-748`) even though shared overlay theming exists for all (`themes.css:337-359`).

**Contrast/readability:** Good in both modes: light text `#3f3f46/#18181b` on `#f7f8fb/#fff`; dark text `#d4d4dc/#fafafa` on `#09090d/#111116` (`tokens.css:474-557`). Primary foreground inherits white/light-bg rules and is OK for violet buttons (`themes.css:1-22`).

**Target match:** Close, but “subtle gradients” in docs are not implemented in tokens or overrides; shadows are present, not gradients. Fix docs or add subtle gradient accents/surfaces.

## glass — ready-with-fixes

**Evidence:** Strong translucent token set with rgba surfaces and luminous accents (`tokens.css:558-638`), explicit blur/backdrop for all major overlays plus Fluent (`themes.css:73-99`), and dedicated glass CSS for focus, inputs, buttons, popups, cards, tabs, controls, toolbar/fieldset (`glass.css:4-193`). README/meta align on translucent/blur/luminous focus (`README.md:152`, `themeMeta.json:8`).

**Component states:** Very complete. Focus rings (`glass.css:19-26`), input/select focus (`28-50`), button hover (`53-79`), popup styling (`82-98`), highlighted items (`100-107`), tabs/toggles (`124-140`), checked controls (`142-147`) all exist. Generic disabled opacity applies (`themes.css:309-335`).

**Contrast/readability:** Dark mode is solid (`tokens.css:601-638`). Light mode is the risk: text `#334155/#10233d` is readable against the page bg `#eaf4ff`, but many controls/popups use translucent `--surface: rgba(255,255,255,.68)` and `--surface-muted: rgba(255,255,255,.46)` (`tokens.css:558-583`), so contrast depends on backdrop content. Glass hover for outline/ghost uses only `rgba(255,255,255,.14)` (`glass.css:71-75`), which may be too subtle on light backgrounds.

**Target match:** Very good. Verdict has fixes only for ensuring readability under varied backdrops, e.g. stronger popup/surface opacity or scrim for text-bearing glass.

## terminal — ready-with-fixes

**Evidence:** Terminal is dark-by-default with monospace, phosphor green tokens (`tokens.css:640-725`), font-family override (`themes.css:102-116`), and dedicated terminal CSS for green focus, buttons, inputs, popups, highlighted items, tabs, checked controls, sliders, topbar/sidebar (`terminal.css:4-188`). Docs mostly align, but README says “phosphor and amber accents” (`README.md:153`) while theme meta says “phosphor green command surfaces” (`themeMeta.json:9`).

**Component states:** Excellent coverage. Default terminal button is transparent green outline and reverses on hover (`terminal.css:35-67`); select/combobox focus exists (`82-90`); popups and highlighted rows are phosphor (`93-120`); tabs/toggle active states are styled (`123-136`); checked forms and slider/progress are green (`139-163`).

**Contrast/readability:** Dark mode is highly readable (`#a7f3d0/#ecfdf5` on `#07130f/#0b1d17`, `tokens.css:640-683`). Light mode is also readable (`#14532d/#052e16` on `#edfdf5/#f8fffb`, `tokens.css:685-725`). One issue: highlighted menu/select rows are green text on a very light green transparent block in both modes (`terminal.css:109-116`), which is fine in dark but less distinct in light.

**Target match:** Strong CLI match. Fix docs inconsistency or add visible amber accent usage; current CSS uses amber only in code token `--code-keyword/#fbbf24` (`tokens.css:666`, `711`), not component chrome.

## material — ready

**Evidence:** Material tokens use Google-like grays, blue primary, elevation shadows, rounded radii (`tokens.css:727-807`). Dedicated CSS implements elevation scales, Material easing, blue focus, raised buttons, elevated popups/cards/dialogs, filled inputs, tabs, checked controls, sliders, FAB-like icon button (`material.css:4-232`). Docs/meta align (`README.md:154`, `themeMeta.json:10`).

**Component states:** Very complete: transitions (`material.css:25-35`), focus (`38-44`), button hover/active (`55-69`), accent hover (`72-79`), popup elevation (`100-115`), highlighted/pressed rows (`122-133`), tabs (`136-150`), toggles/menubar (`152-159`), input focus (`161-180`), switches/checkboxes/radios (`183-193`). Generic disabled state applies (`themes.css:309-335`).

**Contrast/readability:** Good. Light text/background and dark text/background tokens are readable (`tokens.css:727-807`). Primary button hardcodes white on Google blue (`material.css:55-58`), acceptable for light; dark-mode blue `#8ab4f8` with white text would be low if the default primary rule were used, but Material overrides default non-variant buttons to `var(--blue)` + white in all modes. In dark this is likely marginal (`#8ab4f8`/white), but generic dark foreground for accent variants is `var(--bg)` (`themes.css:17-22`), so variant buttons remain safe. Consider checking the non-variant dark Material button contrast visually, but not blocking.

**Target match:** Strong match: filled inputs, state layers, elevations, rounded buttons.

## fluent — ready-with-fixes

**Evidence:** Fluent tokens use acrylic rgba surfaces, Microsoft blues, soft borders, and dark mode (`tokens.css:809-891`). Shared theme rules apply blur to all major Fluent overlays/topbar/sidebar (`themes.css:86-99`) and component-specific Fluent overrides cover buttons, inputs/selects, and menu/select/dialog radius (`themes.css:760-774`). Docs/meta align with Microsoft acrylic/soft accents (`README.md:155`, `themeMeta.json:11`).

**Component states:** Baseline states work through generic theme rules: buttons/hover/focus (`themes.css:263-307`), popup coloring (`337-359`), highlighted/active rows (`366-388`), tabs/toggles (`390-407`), checked controls (`337? actually 337? see generic checked at `themes.css:337` area after disabled; base switch checked in `Switch.css:15-17`). Fluent-specific coverage is lighter than Glass/Material: no custom Fluent hover state layers, active outline, switch/thumb treatment, or selected item styling beyond generic rules.

**Contrast/readability:** Light mode is readable (`#323130/#201f1e` on `#f5f7fb` and rgba white surfaces, `tokens.css:809-850`). Dark mode mostly good (`#edebe9/#faf9f8` on `#11100f/#201f1e`, `tokens.css:853-891`). However, dark primary foreground is forced to `var(--bg)` for Fluent dark (`themes.css:25-31`), which is correct for cyan buttons. Light acrylic topbar/card surfaces are translucent (`tokens.css:809-834`), so readability can vary with backdrop, but less risky than Glass.

**Target match:** Good acrylic direction, but not enough Fluent-specific interaction nuance. Fix by adding state-layer hover/pressed styling for menu/select/tabs/switches and broader popup radius coverage (currently only menu/select/dialog at `themes.css:772-774`).

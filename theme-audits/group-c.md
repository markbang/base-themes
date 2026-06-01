# Focused CSS theme audit — group C

Scope: `retro`, `cyberpunk`, `editorial`, `calm`, `data-dense`. Reviewed tokens, theme overrides, cyberpunk add-on CSS, global CSS, core UI CSS for buttons/forms/menus/overlays/tabs/switches, blocks CSS, theme metadata, and README preview section. No edits made.

## retro — ready

**Verdict:** ready.

**Evidence**
- Target match is strong: tokens use muted beige/gray desktop surfaces and chunky shadows (`src/styles/tokens.css:895-936`), while component overrides explicitly set uppercase, high-weight, square-ish buttons and popups (`src/styles/themes.css:538-568`). This aligns with metadata: “Early desktop UI cues with chunky controls and saturated classic colors” (`src/docs/themeMeta.json:12`).
- Component states are covered through shared theme state rules: button hover/variants (`src/styles/themes.css:266-315`), disabled state opacity/cursor (`src/styles/themes.css:317-341`), checked switch/checkbox/radio state (`src/styles/themes.css:343-353`), popup/menu/select state (`src/styles/themes.css:369-422`), tabs/toggle active state (`src/styles/themes.css:425-443`). Retro adds a high-contrast highlighted menu/select rule: `color: var(--bg); background: var(--surface-strong)` (`src/styles/themes.css:562-568`).
- Contrast/readability look acceptable in both modes: light text `#28313b` on `#d7d0bd`/`#eee9d8`, dark text `#e7dfc8` on `#1f2933`/`#29323d`, and selected dark-mode primary foreground forced black (`src/styles/themes.css:56-58`) against amber accent (`src/styles/tokens.css:948-949`).
- Docs alignment is present: README preview includes Retro (`README.md:87`), and metadata has matching label/description (`src/docs/themeMeta.json:12`).

**Minor note:** The base switch component uses pill geometry (`src/components/ui/Switch.css:1-10`) and retro has no switch-specific square override, so switches remain modern rounded. This does not block readiness because retro’s documented promise is “chunky controls,” not full OS-accurate widgets.

## cyberpunk — ready-with-fixes

**Verdict:** ready-with-fixes.

**Evidence**
- Target match is excellent: dark-by-default neon tokens (`src/styles/tokens.css:977-1018`) and a dedicated `src/styles/cyberpunk.css` add-on for neon focus, hover, popups, tabs, sliders, checked controls, and topbar/sidebar accents (`src/styles/cyberpunk.css:18-158`). README and metadata align: “Dark high-energy neon controls” (`src/docs/themeMeta.json:13`) and README preview row (`README.md:88`).
- Component states are unusually complete: focus glow (`src/styles/cyberpunk.css:18-25`), input focus (`src/styles/cyberpunk.css:27-33`), button hover/active (`src/styles/cyberpunk.css:35-70`), popup glow (`src/styles/cyberpunk.css:72-86`), highlighted items (`src/styles/cyberpunk.css:88-95`), active tabs/toggles (`src/styles/cyberpunk.css:97-109`), and checked controls (`src/styles/cyberpunk.css:133-138`). Global imports include cyberpunk CSS after themes, so these overrides load (`src/index.css:1-5`).
- Contrast is generally good: dark mode foregrounds are bright (`#e9d5ff`, `#ffffff`) on deep purple (`src/styles/tokens.css:977-984`), and light mode uses dark magenta text on white/pale pink (`src/styles/tokens.css:1020-1027`). The global theme forces cyberpunk primary foreground to background (`src/styles/themes.css:25-31`), giving black/deep-purple text on neon accents.

**Fixes before calling it fully done**
- Theme-control highlight text can be marginal in dark mode: generic highlighted items use `--theme-control-active-text: var(--text-strong)` (`src/styles/themes.css:8-9`, `398-410`) with cyberpunk glow/background `color-mix(... transparent 82%)` (`src/styles/cyberpunk.css:88-95`). White text on a very translucent magenta over `#16002c` is readable but visually noisy; consider setting a cyberpunk-specific highlighted foreground or stronger background.
- Motion/glow intensity may violate “readability” expectations for dense dashboards: hover transforms and heavy glow (`src/styles/cyberpunk.css:42-49`, `64-69`, `120-126`) are on many controls. Prefer a reduced-motion guard or softer glow under `prefers-reduced-motion`.

## editorial — ready-with-fixes

**Verdict:** ready-with-fixes.

**Evidence**
- Target match is strong: ivory/ink palette (`src/styles/tokens.css:1061-1102`), dark sepia mode (`src/styles/tokens.css:1104-1142`), serif headings (`src/styles/themes.css:119-125`), and underlined transparent text inputs (`src/styles/themes.css:785-802`) match metadata: “Magazine-like typography, ivory surfaces, and ink-forward contrast” (`src/docs/themeMeta.json:14`). README preview includes Editorial (`README.md:89`).
- Core states are covered by shared rules: buttons (`src/styles/themes.css:266-315`), disabled/forms (`src/styles/themes.css:317-341`), overlays (`src/styles/themes.css:369-383`), menu/select highlight/selected (`src/styles/themes.css:398-422`), and tabs active (`src/styles/themes.css:425-443`). Editorial adds button/input/select/menu styling (`src/styles/themes.css:780-811`).
- Contrast is good for reading: light text `#4d4036`/strong `#211a14` on ivory surfaces (`src/styles/tokens.css:1061-1068`), dark text `#eadfd2`/strong `#fff7ed` on `#19130f`/`#231a15` (`src/styles/tokens.css:1104-1111`). Blocks inherit semantic tokens for headings/body/muted text (`src/blocks/Blocks.css:1-9`, `25-36`).

**Fixes before fully ready**
- Editorial removes top/left/right borders and sets inputs transparent (`src/styles/themes.css:785-793`), but disabled inputs still get generic muted surface background and borders (`src/styles/themes.css:334-341`). That can produce a stylistic mismatch between normal and disabled form controls.
- Select trigger keeps boxed border (`src/styles/themes.css:804-805`) while inputs become underline-only (`src/styles/themes.css:785-802`); acceptable, but inconsistent for a magazine/form language. Consider an editorial select underline variant.

## calm — ready

**Verdict:** ready.

**Evidence**
- Target match is clear: low-saturation greens, soft radius, and gentle shadows (`src/styles/tokens.css:1145-1186`), with relaxed transitions and subtle hover scale (`src/styles/themes.css:691-708`). Metadata promises “Low-saturation wellness palette with relaxed controls and readable contrast” (`src/docs/themeMeta.json:15`), and README includes Calm (`README.md:90`).
- Component states are solid via generic state layer: focus rings (`src/styles/themes.css:250-264`), button hover/variants (`src/styles/themes.css:266-315`), disabled state (`src/styles/themes.css:317-341`), checked state (`src/styles/themes.css:343-353`), overlays (`src/styles/themes.css:369-383`), highlighted menu/select (`src/styles/themes.css:398-422`), and tabs/toggles (`src/styles/themes.css:425-443`). Calm adds soft menu/select highlight (`src/styles/themes.css:705-708`).
- Contrast/readability is good: light `#40524d`/`#1f3a35` on white/pale green (`src/styles/tokens.css:1145-1155`), dark `#cfddd7`/`#eef8f3` on `#101b19`/`#172522` (`src/styles/tokens.css:1188-1199`). The calmer accent `#3d7063` supports white primary foreground under the shared button rule (`src/styles/themes.css:266-274`).
- Blocks remain readable because block CSS uses `--bt-text`, `--bt-fg`, `--bt-muted-fg`, `--bt-surface`, and `--bt-surface-muted` (`src/blocks/Blocks.css:1-9`, `25-36`, `45-65`).

## data-dense — ready

**Verdict:** ready.

**Evidence**
- Target match is strong: compact analytics palette and reduced radii (`src/styles/tokens.css:1229-1271`, dark `1273-1312`), monospace controls (`src/styles/themes.css:111-116`), smaller layout dimensions and control heights (`src/styles/themes.css:128-184`, `202-232`). Metadata says “Compact analytics styling for tables, filters, and repeated workflows” (`src/docs/themeMeta.json:16`), and README includes Data Dense (`README.md:91`).
- Component states are covered by the shared layer: buttons/variants (`src/styles/themes.css:266-315`), disabled (`src/styles/themes.css:317-341`), checked controls (`src/styles/themes.css:343-353`), overlays (`src/styles/themes.css:369-383`), item highlight/selected (`src/styles/themes.css:398-422`), tabs/toggles active (`src/styles/themes.css:425-443`). Data-dense additionally removes button hover shadows for a flatter operational feel (`src/styles/themes.css:523-535`).
- Contrast/readability is good in both modes: light text `#334155`/strong `#172033` on `#f4f6f9`/white (`src/styles/tokens.css:1229-1239`), dark text `#cbd7e8`/strong `#f5f9ff` on navy surfaces (`src/styles/tokens.css:1273-1284`).
- Compactness is implemented in real components: base buttons start at 40px (`src/components/ui/Button.css:1-15`), menu items at 36px (`src/components/ui/Menu.css:14-27`), tabs at 36px (`src/components/ui/Tabs.css:26-35`), and data-dense overrides them to 34px/30px/13px (`src/styles/themes.css:147-165`). Switch geometry is adjusted with matching thumb transform (`src/styles/themes.css:172-184`) over the base switch sizing (`src/components/ui/Switch.css:1-35`).

**Overall:** all five are usable; cyberpunk and editorial need small polish before being called fully ready, mostly around readability/noise consistency rather than broken states.

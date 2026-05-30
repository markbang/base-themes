# Theme 适配程度分析报告

> 分析范围：20 个视觉 style × ~40 个组件的 CSS token 覆盖、行为差异、硬编码检查
> 日期：2026-05-29

---

## 1. 架构总览

Theme 系统分 **3 层**：

```
tokens.css              → CSS 变量定义（颜色、阴影、圆角、字体等）
themes.css              → 派生 theme tokens + 全局 [data-style] 通用组件规则
neo-brutalism.css       → 特定 theme 的组件级 CSS 覆盖（仅 2/20 有）
shadcn.css
```

`useTheme()` hook 通过 `data-style` 和 `data-theme` 属性切换，所有组件通过 CSS 变量消费主题。

---

## 2. 各层适配详情

### 2.1 Token 变量覆盖 — 20/20 ✅

所有 20 个 theme 在 `tokens.css` 中都定义了完整的 light + dark token 覆盖。总计 **40 组 token 定义**。

每个 theme 覆盖的 token（共 ~40 个）：

```
基础色：    --bg, --surface, --surface-strong, --surface-muted
文字色：    --text, --text-strong, --text-muted
边框色：    --line, --line-strong
强调色：    --accent, --accent-strong, --teal, --blue, --green
阴影：      --shadow, --shadow-strong
圆角：      --radius, --radius-sm
字体：      --font-sans, --font-mono
布局组件：  --topbar-bg, --topbar-border, --card-bg, --chip-bg,
            --group-bg, --nav-bg, --track-bg, --switch-off-bg
文字特殊：  --hero-text, --backdrop
代码块：    --code-bg, --code-text, --code-keyword, --code-string,
            --code-component, --code-tag, --code-number, --code-comment
滚动条：    --scrollbar-track, --scrollbar-thumb, --scrollbar-thumb-hover
选区：      --selection-bg, --selection-text
```

**结论：Token 层是项目最扎实的部分，无缺口。**

### 2.2 `themes.css` 全局 `[data-style]` 规则 — 20/20 ✅

`themes.css` 用通用 `[data-style]` 选择器定义了所有 theme 共用的组件样式规则。覆盖范围：

| 规则类别 | 覆盖的组件/状态 |
|----------|----------------|
| focus-visible | 所有可交互元素（button, trigger, item, input, textarea, combobox） |
| 按钮（solid/outline/ghost/icon/accent/teal） | 全部变体 + hover + disabled |
| 表单控件（checkbox/radio/switch） | checked + disabled |
| 输入框（input/textarea/combobox） | focus + disabled |
| 弹出层（menu/select/combobox/popover/preview/tooltip/dialog/alert/drawer） | background, border, shadow, arrow |
| 列表项 | highlighted + selected + 组合状态 |
| Tabs / Toggle / Toolbar / Menubar | selected, pressed, active |
| Slider / Progress / Meter | indicator, thumb, track |
| 错误状态 | field-error, meter-low |

**结论：所有 20 个 theme 的交互行为和基础组件状态都适配了。**

### 2.3 Theme 专属 CSS 文件 — 仅 2/20 🔴

| Theme | 专属 CSS 文件 | 行数 | 覆盖内容 |
|-------|---------------|------|----------|
| neo-brutalism | `neo-brutalism.css` | 180 行 | 厚边框(2px)、硬阴影、offset hover 动画、uppercase |
| shadcn | `shadcn.css` | 203 行 | 独立品牌色系（shadcn-*）、扁平按钮、弹窗阴影、accent 全覆盖 |
| **其余 18 个** | **无** | — | **仅依赖 token 变量 + themes.css 通用规则** |

### 2.4 `themes.css` 中的 theme 特定行为覆盖 — 部分覆盖 🟡

`themes.css` 中有少量按具体 theme 的行为规则：

| 效果 | 涉及的 theme | 类型 |
|------|-------------|------|
| 磨砂玻璃 blur | glass, fluent | 材质 |
| 等宽字体控件 | terminal, data-dense | 字体 |
| 衬线字体标题 | editorial, luxury | 字体 |
| 布局密度压缩 | data-dense, enterprise | 间距 |
| 完全圆角元素 | playful, calm, glass, soft-ui | 圆角 |
| 小圆角元素 | bauhaus, retro, mono, terminal | 圆角 |
| neo-brutalism 阴影 | neo-brutalism | 阴影 |
| soft-ui 内阴影 | soft-ui | 阴影 |
| mono 反色逻辑 | mono | 颜色逻辑 |
| bento light 主色 = teal | bento | 颜色映射 |

### 2.5 无任何专属行为覆盖的 theme — 7/20 🔴

以下 theme 完全依赖 token 变量，没有任何组件行为/材质/字体/间距的专属 CSS：

- `minimal`
- `material`
- `retro`（仅 token）
- `cyberpunk`（仅 token）
- `calm`
- `playful`（仅圆角）
- `luxury`（仅 token + 衬线标题）

---

## 3. 硬编码颜色审计

在 ~40 个组件的 CSS 文件中，**仅 8 处** 硬编码颜色（全部属于阴影或次要效果）：

| 文件 | 行 | 硬编码值 | 用途 |
|------|----|-----------|------|
| `Button.css` | 36 | `rgba(15, 23, 42, 0.08)` | outline button hover shadow |
| `Button.css` | 45 | `rgba(15, 23, 42, 0.06)` | ghost button hover background |
| `Button.css` | 58 | `rgba(15, 23, 42, 0.08)` | icon button hover shadow |
| `Tabs.css` | 49 | `rgba(15, 23, 42, 0.1)` | tabs indicator shadow |
| `Toast.css` | 22 | `rgba(15, 23, 42, 0.16)` | toast popup shadow |
| `ToggleGroup.css` | 29 | `rgba(15, 23, 42, 0.1)` | toggle indicator shadow |
| `Switch.css` | 30 | `rgba(15, 23, 42, 0.24)` | switch thumb shadow |
| `Avatar.css` | 39 | `#fff` | avatar group border ring |

`themes.css` 和 `shadcn.css` 中的全局 `[data-style]` 规则**已覆盖了其中大部分**（重新定义弹出层阴影、按钮背景等）。在暗色 theme 下这些硬编码阴影可能不可见（黑色半透明叠加在暗背景上）。

---

## 4. 适配矩阵总结

```
                     Token    [data-style]   专属CSS   行为覆盖
                     (颜色)   (通用规则)     (文件)    (材质/字体/间距)
bento                ✅       ✅             ❌        🟡  teal主色
shadcn               ✅       ✅             ✅        ✅  完整品牌色系
neo-brutalism        ✅       ✅             ✅        ✅  厚边框/硬阴影
minimal              ✅       ✅             ❌        ❌  纯token
enterprise           ✅       ✅             ❌        🟡  密度
linear               ✅       ✅             ❌        ❌  纯token
glass                ✅       ✅             ❌        🟡  blur + 圆角
terminal             ✅       ✅             ❌        🟡  等宽字体
material             ✅       ✅             ❌        ❌  纯token
fluent               ✅       ✅             ❌        🟡  blur
retro                ✅       ✅             ❌        ❌  纯token
cyberpunk            ✅       ✅             ❌        ❌  纯token(注1)
editorial            ✅       ✅             ❌        🟡  衬线标题
calm                 ✅       ✅             ❌        ❌  纯token
data-dense           ✅       ✅             ❌        ✅  密度+等宽
playful              ✅       ✅             ❌        🟡  圆角
luxury               ✅       ✅             ❌        🟡  衬线标题
soft-ui              ✅       ✅             ❌        🟡  inset阴影+圆角
bauhaus              ✅       ✅             ❌        🟡  圆角
mono                 ✅       ✅             ❌        🟡  圆角+反色逻辑
```

> 注1：cyberpunk 有暗色 neon accent 和 glow shadow token，但缺专属 CSS 来放大这个效果。

---

## 5. 核心发现

### 做对了的

1. **Token 契约设计干净。** 40 个 CSS 变量覆盖了颜色、间距、阴影、字体、圆角等所有维度。新增 theme 只需定义一组 token + 可选专属 CSS 文件。
2. **`[data-style]` 通用规则很完整。** 组件的基础状态（hover/focus/active/disabled/selected）和弹出层样式都有全局覆盖，不依赖 theme 专属 CSS。
3. **硬编码极少。** 仅 8 处，且都是阴影类次要值，大部分已被 `[data-style]` 覆盖。
4. **dark/light 双模完整。** 每个 theme 都定义了 light 和 dark token，部分暗色优先的 theme（terminal, cyberpunk, luxury）还额外提供了 light 变体。

### 不足的

1. **18/20 theme 只有 "换色"，没有 "换形"。** 切换 theme 时颜色会变，但组件的形状、边框风格、阴影类型、动效基本不变。这削弱了 theme gallery 的视觉冲击力。
2. **cyberpunk 严重欠开发。** 这是最容易被截图分享的 theme（霓虹灯效果），但目前只有 token 颜色变化，没有 glow border、neon shadow、scanline 等效果。
3. **material 没有 elevation 系统。** Material Design 的核心是分层阴影和高程，但目前 material 主题只有扁平的 Google 配色，没有 elevation shadow 层次。
4. **glass 只有 backdrop-filter。** 缺少半透明边框光晕、内部高光等玻璃质感的细节。
5. **缺少 `--theme-border-width` 这样的行为 token。** 如果 neo-brutalism 的 2px 边框是通过 token 实现的（而不是硬编码在 CSS 中），18 个 theme 可以直接复用。

---

## 6. 明确 TODO

### 🔴 P0 — 消除硬编码，修复暗色 theme 可见性

| # | 任务 | 文件 | 预计工作量 |
|---|------|------|-----------|
| 1 | Button.css 硬编码 → `var(--shadow)` 或 `var(--shadow-strong)` | `Button.css:36,45,58` | 0.5h |
| 2 | Tabs.css 硬编码阴影 → token | `Tabs.css:49` | 0.25h |
| 3 | Toast.css 硬编码阴影 → token | `Toast.css:22` | 0.25h |
| 4 | ToggleGroup.css 硬编码阴影 → token | `ToggleGroup.css:29` | 0.25h |
| 5 | Switch.css 硬编码阴影 → token | `Switch.css:30` | 0.25h |
| 6 | Avatar.css `#fff` → `var(--surface)` | `Avatar.css:39` | 0.25h |

### 🟡 P1 — 为明星 theme 加专属 CSS

| # | 任务 | 目标效果 | 预计工作量 |
|---|------|----------|-----------|
| 7 | **cyberpunk.css** | 霓虹 glow border、`text-shadow` 发光文字、scanline overlay、neon hover transition。让按钮/卡片/输入框有 "霓虹灯管" 质感 | 2-3 天 |
| 8 | **terminal.css** | 终端绿边框、`::before` cursor blink、CRT scanline 效果（可选）、`box-shadow` 替换为终端绿 glow | 1-2 天 |
| 9 | **material.css** | elevation shadow 层次（1dp-8dp）、ripple effect（可选）、FAB 样式 | 1-2 天 |
| 10 | **glass.css** | 强化毛玻璃：渐变 border、内部高光 `inset box-shadow`、更明显的 blur 层次 | 1 天 |

### 🟢 P2 — 拓宽 token 维度，让更多 theme 通过 token 差异化

| # | 任务 | 目标效果 | 预计工作量 |
|---|------|----------|-----------|
| 11 | 新增 `--theme-border-width` token | neo-brutalism=2px, bauhaus=2px, 其余=1px。让边框粗细成为 token 可控维度 | 0.5 天 |
| 12 | 新增 `--theme-font-weight` token | data-dense=600, playful=700, minimal=500。让字体粗细差异化 | 0.5 天 |
| 13 | 新增 `--theme-transition-duration` token | terminal=0ms(instant), playful=200ms, calm=300ms | 0.5 天 |
| 14 | 新增 `--theme-letter-spacing` token | enterprise=-0.01em, terminal=0.05em, editorial=0.02em | 0.5 天 |

### ⚪ P3 — 流程和验证

| # | 任务 | 预计工作量 |
|---|------|-----------|
| 15 | 建立 theme contribution checklist：token 定义 → themes.css 行为（可选）→ 专属 CSS（可选）→ 截图验证 | 0.5 天 |
| 16 | Theme e2e script 加对比截图：每个 theme 的 Button/Select/Dialog/Card 截图，存入 `public/previews/` | 1 天 |
| 17 | 为剩余 14 个 theme 加基础行为覆盖（至少圆角+字体偏好） | 2-3 天 |

---

## 7. 效果预期

做完 P0+P1 之后：

| 当前状态 | 做完后 |
|----------|--------|
| 18 个 theme 换色不换形 | 6 个明星 theme（neo-brutalism, shadcn, cyberpunk, terminal, material, glass）有明显视觉差异 |
| cyberpunk 只是紫色配色 | cyberpunk 有霓虹 glow + scanline 效果，截图分享价值高 |
| material 只是 Google 配色 | material 有 elevation shadow 层次 |
| 硬编码阴影在暗色 theme 下不可见 | 全部改用 token，暗色 theme 下阴影正常 |
| 边框粗细写死 1px | neo-brutalism/bauhaus 可以声明 `--theme-border-width: 2px` |

---

## 8. 衡量标准

3 个月后验证：

| 指标 | 通过标准 | 验证方式 |
|------|----------|----------|
| 硬编码清除 | `grep` 搜索组件 CSS 中 0 处非 token 的颜色/阴影 | lint script |
| 明星 theme 差异化 | cyberpunk/terminal/material/glass 有专属 CSS 文件 | 文件存在 + 截图对比 |
| Token 维度 | 新增 ≥3 个跨 theme 的行为 token | `tokens.css` |
| 截图覆盖 | 每个 theme × 4 个代表组件的截图存在于 `public/previews/` | 文件存在 |

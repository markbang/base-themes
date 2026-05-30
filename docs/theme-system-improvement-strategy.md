# Base Themes 主题系统完善战略

> 生成日期：2026-05-29
> 范围：竞品 theme 架构、主题展示网站、当前本地主题实现审计、registry / agent-native 分发模式
> 目标：把 `base-themes` 从“多主题组件库”升级为“Base UI-first、shadcn-compatible、agent-native 的主题组件系统”。

## 1. 总结结论

当前最值得采用的方向是：

> **以 CSS variables 为运行时主题基底，以 shadcn-compatible semantic tokens 为公共契约，以 `data-style` / `data-theme` 为切换机制，以 registry + agent metadata 为分发和自动化入口。**

不要把主题系统做成复杂 JS runtime。也不要只做静态色板。未来应该形成四层能力：

1. **Theme contract**：清晰、稳定、可验证的 token 契约。
2. **Theme gallery**：每个主题可预览、可复制、可安装、可 SEO。
3. **Theme builder**：从小量高杠杆控制项生成完整 tokens。
4. **Registry / agent workflow**：主题、组件、blocks 都可被 shadcn CLI / v0 / MCP / AI agents 消费。

最优先的落地动作：

1. 建立 theme metadata 单一事实源。
2. 文档化 token taxonomy 和 public/internal token 边界。
3. 让 registry 兼容 shadcn item schema，而不是只做自定义 manifest。
4. 拆分 docs-only CSS 和 package component CSS。
5. 强化 theme validation：variants、tokens、previews、contrast、e2e。
6. 升级 `/themes` 页面：从 swatch list 变成真正的 theme gallery。

---

## 2. 竞品 theme 架构对比

### 2.1 总体趋势

多个类似项目已经收敛到同一个方向：

- **CSS custom properties 是 runtime theming substrate。**
- JS theme object 可以存在，但多数最终都会生成 CSS variables。
- 主题切换通常通过：
  - `class="dark"`
  - `data-theme="..."`
  - provider 设置根节点属性
- 主题文档不只是颜色，而是讲 semantic token contract。
- 高采用率项目会提供：
  - live preview
  - copy/install
  - blocks/templates
  - theme builder
  - registry/source-copy
  - AI-readable docs

### 2.2 关键项目对比

| 项目 | Theme 架构 | 值得学习 | 应避免 |
| --- | --- | --- | --- |
| shadcn/ui | Semantic CSS vars + Tailwind bridge + registry/source-copy | token naming、registry item、source ownership、AI 友好 | 只做 shadcn 皮肤、缺少自身差异化 |
| Radix Themes | React `<Theme>` + vanilla CSS vars + 12-step scales | accent/gray/radius/scaling 轴、系统化色阶、nested scopes | closed component override friction |
| Base UI | 完全 unstyled primitives | 稳定 part API、data-state、CSS vars styling | 假设 Base UI 自带 theme system |
| Chakra UI | JS system config + semantic tokens + recipes | primitive / semantic / component recipe 分层、type safety | 复杂 runtime config |
| Mantine | Provider + JS theme object + injected CSS vars | 成熟 provider、component defaults、CSS variable resolver | 过重 provider/runtime、10-shade authoring 成本 |
| HeroUI / NextUI | Tailwind v4 CSS vars + BEM class contracts + theme builder | base/theme/calculated token taxonomy、可视化 builder | 额外 class API 复杂度 |
| daisyUI | 35 themes + `data-theme` scoping + CSS vars | 多主题 gallery、嵌套 `data-theme`、紧凑 token set | token 太泛，不够 shadcn/Base UI 语义化 |
| Tremor | Tailwind config dashboard tokens | per-component token usage docs | Tailwind safelist/runtime class friction |
| ReUI | shadcn ecosystem gallery + copy-paste blocks | 真实 dashboard previews、大量 blocks | 只追数量导致 token discipline 弱 |

### 2.3 对 base-themes 的直接启发

#### A. 默认契约应该兼容 shadcn semantic tokens

建议支持或映射这些名字：

```text
background
foreground
card
card-foreground
popover
popover-foreground
primary
primary-foreground
secondary
secondary-foreground
muted
muted-foreground
accent
accent-foreground
destructive
destructive-foreground
border
input
ring
chart-1 ... chart-5
sidebar
sidebar-foreground
sidebar-primary
sidebar-primary-foreground
sidebar-accent
sidebar-accent-foreground
sidebar-border
sidebar-ring
radius
```

这能让主题更容易：

- 被 shadcn 用户理解
- 被 registry 安装
- 被 AI agent 迁移
- 被 Tailwind v4 `@theme inline` 映射

#### B. 主题系统要分层

建议分为四层：

```text
1. Primitive palette tokens
   --bt-palette-slate-1
   --bt-palette-slate-12
   --bt-palette-brand-1
   ...

2. Semantic app tokens
   --bt-bg
   --bt-fg
   --bt-surface
   --bt-border
   --bt-primary
   --bt-primary-fg

3. Component alias tokens
   --bt-button-bg
   --bt-button-fg
   --bt-input-border
   --bt-select-popup-bg

4. Docs/site tokens
   --bt-docs-topbar-bg
   --bt-docs-sidebar-width
   --bt-docs-card-bg
```

当前项目已经有类似层次，但混在 `tokens.css`、`themes.css`、adapter css、docs css 中。下一步应该明确哪些是 public token，哪些是 internal/docs token。

#### C. Gallery 要支持 scoped preview

daisyUI 的 `data-theme` scoping 很适合主题 gallery。每个 preview card 可以独立：

```html
<div data-style="enterprise" data-theme="dark">
  ...preview components...
</div>
```

这样用户可以同时比较多个主题，而不是全站只能切一个。

#### D. Builder 不应该一开始就是 token spreadsheet

Radix / daisyUI / HeroUI / Material Theme Builder 都说明：builder 应该先给少量高杠杆控制项。

推荐 MVP 控制项：

- appearance：light / dark / system
- accent color
- neutral gray
- radius
- density / scale
- font
- shadow depth
- border style
- motion level

高级模式再暴露完整 token 编辑。

---

## 3. 当前本地主题系统审计

### 3.1 当前架构

当前主题系统是 CSS-variable-first，通过 `<html>` 上的两个属性控制：

```html
<html data-style="bento" data-theme="light">
```

- `data-style`：视觉风格，如 `bento`、`shadcn`、`terminal`。
- `data-theme`：颜色模式，最终 DOM 上只有 `light` / `dark`，`system` 只存在于 JS 状态。

CSS import 顺序：

```css
@import './styles/tokens.css';
@import './styles/themes.css';
@import './styles/shadcn.css';
@import './styles/neo-brutalism.css';
```

有效 cascade：

1. `tokens.css`：基础 token 和 20 个 style palette。
2. `themes.css`：component bridge tokens 和大量 style-specific overrides。
3. `shadcn.css`：shadcn style adapter。
4. `neo-brutalism.css`：neo-brutalism style adapter。

当前优点：

- CSS variables + DOM attributes 很轻量。
- 没有重 provider runtime。
- 主题数量已经很多。
- 有真实浏览器 e2e 对 contrast / popup / select 做检查。
- registry 已经暴露 style variants。
- `useTheme()` API 简单。

### 3.2 当前主要问题

#### 问题 1：theme variants 列表重复

同一组 20 个 theme names 出现在多个地方：

- `src/styles/themeList.ts`
- `registry/registry.json`
- `scripts/generate-theme-previews.mjs`
- `scripts/verify-themes-e2e.mjs`
- `README.md`
- `skills/base-themes/SKILL.md`
- preview asset names

风险：新增 / 删除 / 重命名 theme 时，非常容易漏改。

建议建立单一事实源：

```ts
// src/styles/themeMeta.ts
export const themeMeta = [
  {
    id: 'bento',
    label: 'Bento',
    description: 'Soft, rounded SaaS product aesthetic.',
    family: ['saas', 'dashboard', 'warm'],
    defaultMode: 'light',
    supports: ['light', 'dark'],
    previewMode: 'light',
    density: 'comfortable',
    radius: 'lg',
    tags: ['cards', 'friendly', 'product'],
  },
]
```

然后生成或验证：

- registry variants
- preview script list
- e2e script list
- README table
- theme gallery
- skill docs

#### 问题 2：mode semantics 不一致

大部分 theme 是 base light + `[data-theme='dark']` override。

但有些 theme 是 dark-by-default + `[data-theme='light']` override，例如：

- `terminal`
- `cyberpunk`
- `luxury`

这在 CSS cascade 上可行，但维护者很难理解。

建议二选一：

方案 A：全部标准化为显式 light/dark：

```css
[data-style='terminal'][data-theme='light'] { ... }
[data-style='terminal'][data-theme='dark'] { ... }
```

`[data-style='terminal']` 只放共享 shape tokens。

方案 B：保留现状，但在 metadata 里明确：

```ts
{
  id: 'terminal',
  defaultMode: 'dark',
  previewMode: 'dark'
}
```

并让 validator 检查该规则。

推荐：**中期采用方案 A**，长期更清晰。

#### 问题 3：docs CSS 和 package CSS 混在一起

`src/styles/themes.css`、`shadcn.css`、`neo-brutalism.css` 不只影响组件，还 target 了 docs-only selectors，例如：

- `.topbar`
- `.sidebar`
- `.component-page`
- `.doc-section`
- `.demo-card`
- `.api-table-wrap`
- `.theme-swatch`
- `.style-switcher`

风险：

- package consumers import `base-themes/styles.css` 时会收到 docs site CSS。
- docs class 改动可能影响 package CSS。
- CSS bundle 不够干净。
- 主题系统 public contract 不清楚。

建议拆成：

```text
src/styles/
  tokens.css              # public tokens
  component-theme.css     # public component theme layer
  adapters/
    shadcn.css
    neo-brutalism.css
  docs-theme.css          # docs only，不进入 package CSS 或可单独 import
```

#### 问题 4：component CSS 和 global override 耦合过重

现在组件 CSS 先定义默认样式，然后 `themes.css` / adapter css 再通过 `.bento-*` class 大量 override。

例如：

- `Button.css` 定义 base button。
- `themes.css` override `[data-style] .bento-button`。
- `shadcn.css` 再 override `.bento-button`。
- `neo-brutalism.css` 再 override `.bento-button`。

风险：

- 加新 component 需要改很多地方。
- class rename 风险高。
- cascade 难预测。

推荐引入 component alias tokens：

```css
.bento-button {
  color: var(--bt-button-fg, var(--bt-primary-fg));
  background: var(--bt-button-bg, var(--bt-primary));
  border-color: var(--bt-button-border, transparent);
  box-shadow: var(--bt-button-shadow, none);
}
```

主题文件尽量设置 tokens，而不是重复写 selectors：

```css
[data-style='neo-brutalism'] {
  --bt-button-shadow: 4px 4px 0 var(--bt-border-strong);
  --bt-button-border: var(--bt-border-strong);
}
```

这样能降低 selector coupling。

#### 问题 5：`useTheme()` 多实例状态可能不同步

当前 `useTheme()` 每次调用都会创建自己的 state 和 listener。docs 里 Topbar 和 ThemesPage 都会调用。

如果一个页面调用 `setStyle()`：

- DOM attribute 会更新。
- localStorage 会更新。
- 当前 hook state 会更新。
- 其他 mounted hook instance 的 React state 不一定同步。

这可能造成 Topbar 显示和页面状态不一致。

建议改成 external store 或 provider：

```ts
useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot)
```

或者 `ThemeProvider` 管理单一 state。

同时增强：

- try/catch localStorage
- storage event cross-tab sync
- media query listener 单例化
- query param 变化处理
- early inline theme script，避免 flash

#### 问题 6：registry style metadata 太浅

当前 registry style 大致是：

```json
"style": {
  "tokens": "src/styles/tokens.css",
  "global": "src/index.css",
  "default": "bento",
  "variants": [...]
}
```

但 source-copy / agent / shadcn CLI 需要更具体的信息：

- 所有 style files
- 每个 theme item
- component dependencies
- file targets
- preview metadata
- docs links
- compatibility
- AI intent metadata

建议不要把当前 custom manifest 当作最终格式，而是：

- 保留一个 internal manifest。
- 生成 shadcn-compatible registry catalog 和 item JSON。

---

## 4. 推荐 Theme Architecture v2

### 4.1 文件结构建议

```text
src/styles/
  themeMeta.ts                  # TS source of truth
  tokens/
    base.css                    # primitive + semantic base
    modes.css                   # light/dark shared defaults
    styles/
      bento.css
      shadcn.css
      neo-brutalism.css
      enterprise.css
      ...
  component-theme.css           # public component alias tokens + shared state styles
  docs-theme.css                # docs only
  index.css                     # package CSS entry
```

如果暂时不想拆太细，至少建立：

```text
src/styles/themeMeta.ts
src/styles/component-theme.css
src/styles/docs-theme.css
```

### 4.2 Token taxonomy

建议公共 token 分层：

#### Primitive tokens

```css
--bt-color-white
--bt-color-black
--bt-palette-neutral-1
--bt-palette-neutral-12
--bt-palette-brand-1
--bt-palette-brand-12
```

不是所有主题都必须暴露完整 palette，但生成器和 builder 应该内部有这层。

#### Semantic tokens

```css
--bt-bg
--bt-fg
--bt-surface
--bt-surface-muted
--bt-surface-strong
--bt-border
--bt-border-strong
--bt-primary
--bt-primary-fg
--bt-secondary
--bt-secondary-fg
--bt-muted
--bt-muted-fg
--bt-accent
--bt-accent-fg
--bt-danger
--bt-danger-fg
--bt-success
--bt-success-fg
--bt-warning
--bt-warning-fg
--bt-ring
```

#### Component alias tokens

```css
--bt-button-bg
--bt-button-fg
--bt-button-border
--bt-button-shadow
--bt-input-bg
--bt-input-fg
--bt-input-border
--bt-select-popup-bg
--bt-select-popup-fg
--bt-tabs-active-bg
--bt-tabs-active-fg
```

这些 token 可以从 semantic tokens fallback：

```css
--bt-button-bg: var(--bt-primary);
--bt-button-fg: var(--bt-primary-fg);
```

#### Shape / density tokens

```css
--bt-radius-xs
--bt-radius-sm
--bt-radius-md
--bt-radius-lg
--bt-space-control-y
--bt-space-control-x
--bt-control-height
--bt-density
--bt-shadow-sm
--bt-shadow-md
--bt-shadow-lg
```

#### Motion tokens

```css
--bt-duration-fast
--bt-duration-normal
--bt-ease-standard
--bt-motion-scale
```

#### Docs-only tokens

```css
--bt-docs-topbar-bg
--bt-docs-sidebar-bg
--bt-docs-card-bg
```

这些不要作为 package component contract 的核心。

### 4.3 与现有 token 的迁移关系

当前已经有：

```css
--bg
--surface
--surface-strong
--surface-muted
--text
--text-strong
--text-muted
--line
--line-strong
--accent
--accent-strong
--teal
--blue
--green
--radius
--radius-sm
--shadow
--shadow-strong
--theme-primary
--theme-primary-hover
--theme-primary-foreground
--theme-control-bg
--theme-control-hover
--theme-popup-bg
--theme-popup-text
--theme-focus
--theme-danger
```

短期不要破坏兼容。可以先加 alias：

```css
:root {
  --bt-bg: var(--bg);
  --bt-fg: var(--text-strong);
  --bt-surface: var(--surface);
  --bt-border: var(--line);
  --bt-primary: var(--theme-primary);
  --bt-primary-fg: var(--theme-primary-foreground);
}
```

然后新 docs 推荐 `--bt-*`，旧 tokens 保留一段时间。

### 4.4 CSS cascade layers

建议引入 CSS cascade layers，让 override 顺序显式：

```css
@layer bt.tokens, bt.theme, bt.components, bt.adapters, bt.docs;

@layer bt.tokens {
  :root { ... }
}

@layer bt.components {
  .bento-button { ... }
}

@layer bt.adapters {
  [data-style='neo-brutalism'] { ... }
}
```

这比单纯依赖 import order 更可维护。

---

## 5. Theme Gallery / Website 改版方案

### 5.1 `/themes` 页面目标

当前 `/themes` 更像 style switcher + 少量 swatches。未来应该变成真正的 gallery：

> 用户一眼能判断：每个主题适合什么产品、light/dark 长什么样、可不可以复制、怎么安装、contrast 是否合格。

### 5.2 Theme card 设计

每个 theme card 建议包含：

- 主题名称
- 一句话 style narrative
- light/dark mini app preview
- accent + neutral color strip
- radius / density / mood badges
- contrast status badge
- recommended use cases
- `Copy CSS`
- `Install`
- `Open preview`
- `Open in v0`（未来）

示例 metadata：

```ts
{
  id: 'enterprise',
  label: 'Enterprise',
  narrative: 'Dense, restrained surfaces for internal tools and admin systems.',
  families: ['enterprise', 'dashboard', 'data-dense'],
  bestFor: ['admin panels', 'B2B SaaS', 'settings pages'],
  avoidFor: ['playful consumer apps'],
  density: 'compact',
  radius: 'sm',
  contrast: 'AA',
  previewModes: ['light', 'dark']
}
```

### 5.3 Theme family filters

建议 filters：

```text
SaaS
Devtool
Enterprise
Editorial
Ecommerce
Finance
Wellness
Creative
Luxury
Retro
Warm
Minimal
High Contrast
Dashboard
Dark Mode
Data Dense
```

这比平铺 20 个主题更有产品感。

### 5.4 Realistic previews

不要只展示色板。每个主题至少在这些 surfaces 上测试/展示：

- Dashboard card
- Settings form
- Auth card
- Data table
- Command menu
- Dialog
- Tabs
- Select popup
- Alert / destructive state
- Empty state

Blocks 就是 theme 的 proof layer。

### 5.5 SEO 页面

建议新增：

```text
/themes/bento
/themes/enterprise
/themes/terminal
/themes/glass
/themes/neo-brutalism

/themes/dark-dashboard
/themes/warm-neutral
/themes/high-contrast
/themes/react-saas
/themes/base-ui-themes
/themes/shadcn-compatible-themes
```

每页包含：

- style story
- preview screenshots
- token highlights
- use cases
- install snippet
- copy CSS
- related blocks
- related themes

### 5.6 Theme builder MVP

不要一开始做完整 token editor。先做 guided builder：

Controls：

- starting style
- accent color
- neutral scale
- appearance
- radius
- density
- font
- shadow depth
- border style
- motion level

Preview tabs：

- Components
- Dashboard
- Settings
- Auth
- Data table
- Dialog/menu states

Export：

- CSS variables
- shadcn `registry:theme`
- Tailwind v4 `@theme inline`
- JSON / DTCG
- share URL

---

## 6. Registry / Agent-native 分发战略

### 6.1 当前问题

当前 `registry/registry.json` 使用了 shadcn schema URL，但结构是自定义的：

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "base-themes",
  "homepage": "...",
  "dependencies": [...],
  "style": {...},
  "components": [...],
  "blocks": [...],
  "pages": [...]
}
```

这对项目内部有用，但不是标准 shadcn registry catalog。标准 shadcn registry 需要 `items`，每个 item 需要符合 `registry-item.json`。

结果：当前 registry 可能不能直接被：

- `npx shadcn add`
- shadcn namespace registry
- v0 Open in v0
- shadcn MCP
- AI registry browsing

消费。

### 6.2 推荐架构

保留 internal manifest，但生成标准 registry。

```text
registry/
  base-themes.manifest.json      # internal rich source
  registry.json                  # shadcn-compatible catalog
  items/
    button.json
    select.json
    theme-bento.json
    theme-enterprise.json
    block-dashboard-shell.json
```

标准 catalog：

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "base-themes",
  "homepage": "https://github.com/markbang/base-themes",
  "items": [
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "Themeable Base UI button primitive with base-themes token classes."
    },
    {
      "name": "theme-bento",
      "type": "registry:theme",
      "title": "Bento Theme",
      "description": "Soft rounded SaaS theme for dashboards and product UIs."
    }
  ]
}
```

### 6.3 Component item 示例

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "Themeable Base UI button primitive with tokenized variants and accessible focus states.",
  "dependencies": ["@base-ui/react", "clsx"],
  "files": [
    {
      "path": "src/components/ui/Button.tsx",
      "type": "registry:ui",
      "target": "@ui/button.tsx"
    },
    {
      "path": "src/components/ui/Button.css",
      "type": "registry:file",
      "target": "@ui/button.css"
    }
  ],
  "categories": ["form", "action", "base-ui"],
  "meta": {
    "baseThemes": {
      "primitive": "Button",
      "copyMode": "source",
      "supportsThemes": ["bento", "shadcn", "neo-brutalism"],
      "a11y": ["keyboard", "focus-visible"],
      "tokensUsed": ["--bt-button-bg", "--bt-button-fg", "--bt-ring"]
    },
    "agent": {
      "summary": "Use when the user needs actions, form submissions, toolbar buttons, or dialog actions.",
      "avoidWhen": ["navigation links that should be anchors"],
      "relatedItems": ["theme-bento", "theme-enterprise", "settings-form"]
    }
  }
}
```

### 6.4 Theme item 示例

```json
{
  "name": "theme-enterprise",
  "type": "registry:theme",
  "title": "Enterprise Theme",
  "description": "Dense, restrained theme for B2B SaaS, admin panels, and internal tools.",
  "files": [
    {
      "path": "src/styles/tokens/styles/enterprise.css",
      "type": "registry:file",
      "target": "@styles/base-themes/enterprise.css"
    }
  ],
  "categories": ["theme", "enterprise", "dashboard", "data-dense"],
  "meta": {
    "preview": {
      "light": "/previews/base-themes-enterprise-light.png",
      "dark": "/previews/base-themes-enterprise-dark.png"
    },
    "baseThemes": {
      "style": "enterprise",
      "defaultMode": "light",
      "supportsModes": ["light", "dark"],
      "density": "compact",
      "radius": "sm",
      "contrast": "AA"
    },
    "agent": {
      "summary": "Best for dense admin panels, data-heavy SaaS, settings, billing, and internal tools.",
      "whenToUse": ["dashboards", "settings forms", "B2B apps"],
      "avoidWhen": ["playful consumer onboarding", "editorial marketing pages"],
      "installPlan": ["install base tokens", "install enterprise theme", "install required components"],
      "prompts": [
        "Create a compact settings page using the Enterprise theme and Base UI form components."
      ]
    }
  }
}
```

### 6.5 Blocks as dependency bundles

Blocks 不应该只是 docs examples。应该是 registry bundle：

```json
{
  "name": "dashboard-shell",
  "type": "registry:block",
  "title": "Dashboard Shell",
  "description": "Responsive app shell with sidebar, topbar, cards, tabs, and filters.",
  "registryDependencies": [
    "button",
    "select",
    "tabs",
    "menu",
    "theme-enterprise"
  ],
  "files": [
    {
      "path": "src/blocks/dashboard-shell.tsx",
      "type": "registry:block",
      "target": "@components/blocks/dashboard-shell.tsx"
    }
  ],
  "categories": ["dashboard", "layout", "saas"],
  "meta": {
    "agent": {
      "summary": "Use for SaaS dashboards and internal tools.",
      "bestThemes": ["enterprise", "data-dense", "bento"],
      "requires": ["sidebar", "tabs", "select", "button"]
    }
  }
}
```

### 6.6 AI docs

建议新增：

```text
/llms.txt
/llms-full.txt
```

`llms.txt` 包含：

- project summary
- install docs
- registry index
- component list
- theme list
- token contract
- agent skill link
- common prompts
- anti-patterns

并在 npm exports 暴露：

```json
{
  "exports": {
    "./registry.json": "./registry/registry.json",
    "./registry/*": "./registry/*.json",
    "./skill": "./skills/base-themes/SKILL.md",
    "./llms.txt": "./llms.txt"
  }
}
```

### 6.7 每个页面提供三种安装路径

每个 component/theme/block 页面都应该有：

#### Package import

```bash
npm install base-themes @base-ui/react react react-dom
```

```ts
import 'base-themes/styles.css'
import { Button } from 'base-themes'
```

#### Source copy via registry

```bash
npx shadcn@latest add https://base-themes.dev/r/button.json
```

未来支持 namespace：

```bash
npx shadcn@latest add @base-themes/button
```

#### Agent / MCP

```text
Use @base-themes/theme-enterprise and @base-themes/dashboard-shell to create a compact admin page.
```

---

## 7. Validation 战略

### 7.1 Registry validation

扩展 `scripts/validate-registry.mjs`，检查：

- `registry.style.default` 在 variants 中。
- variants 和 `themeMeta` 完全一致。
- 每个 variant 都有 CSS selector 或明确继承规则。
- 每个 variant 有 preview asset。
- 每个 theme item 有 docs link、description、categories、meta。
- 每个 component item 的 files 存在。
- 每个 block 的 registryDependencies 存在。
- style files 全部列出，不只 `tokens` 和 `global`。

### 7.2 Token validation

新增 `scripts/validate-theme-tokens.mjs`：

- 解析 required token list。
- 检查每个 theme/mode 具备必要 token 或明确继承。
- 检查关键 foreground/background 对：
  - primary / primary-fg
  - surface / fg
  - popup-bg / popup-fg
  - danger / danger-fg
  - muted / muted-fg
  - code-bg / code-fg
- 检查 focus ring 可见性。
- 检查 chart colors distinguishability。

### 7.3 E2E validation

当前 e2e 已经很好，但只集中在 `/components/select`。

建议新增隐藏 test route：

```text
/theme-test?style=enterprise&theme=dark
```

里面展示：

- Button variants
- Input / Textarea
- Select open state
- Dialog open state
- Menu open state
- Tabs active state
- Switch / Checkbox / Radio
- Slider / Progress
- Alert / destructive
- Toast
- Code block
- Data table mock

E2E 读取每个 theme/mode，检查：

- no console error
- root attributes correct
- contrast thresholds
- popup visibility
- focus ring
- disabled state
- destructive state
- selected/highlighted state

### 7.4 Preview validation

预览生成应该从 metadata 读取：

```bash
npm run previews:generate
npm run previews:check
```

检查：

- 每个 theme 有 light/dark preview 或 metadata 声明只生成一种。
- 文件存在。
- 尺寸正确。
- 时间戳新于 CSS 修改。

---

## 8. 实施路线图

### Phase 0：快速修复，一周内

- [ ] 修 Topbar GitHub link 指向 `markbang/base-themes`。
- [ ] 新增 `src/styles/themeMeta.ts`，把 20 个 themes 的 metadata 集中起来。
- [ ] preview script 和 e2e script 改为读取 theme metadata。
- [ ] `validate-registry.mjs` 检查 variants 与 metadata 一致。
- [ ] `/themes` 页面使用 metadata 渲染 label、description、tags。
- [ ] 文档说明当前 token contract 的最小版本。

### Phase 1：Theme contract 稳定，2-4 周

- [ ] 定义 public token taxonomy。
- [ ] 给现有 tokens 加 `--bt-*` alias，不破坏旧变量。
- [ ] 明确 public vs internal/docs-only tokens。
- [ ] 把 docs-only selectors 从 package theme CSS 迁出。
- [ ] 建立 token validation script。
- [ ] 更新 README / skill / docs theming 页面。

### Phase 2：Gallery 升级，1-2 个月

- [ ] `/themes` 改成 gallery。
- [ ] 增加 theme family filters。
- [ ] 每个 card 显示 light/dark preview、badges、copy/install actions。
- [ ] 每个 theme 增加独立 SEO page。
- [ ] 生成 light/dark previews。
- [ ] 添加 realistic preview surfaces。

### Phase 3：Registry v2，1-2 个月

- [ ] 设计 internal manifest。
- [ ] 生成 shadcn-compatible `registry.json`。
- [ ] 为 components 生成 `registry:ui` items。
- [ ] 为 themes 生成 `registry:theme` items。
- [ ] 为 blocks 生成 `registry:block` items。
- [ ] 加 `meta.agent` metadata。
- [ ] 测试 `npx shadcn@latest view/add`。
- [ ] 增加 Open in v0 URL。
- [ ] 发布 `/llms.txt` 和 `/llms-full.txt`。

### Phase 4：Builder MVP，2-4 个月

- [ ] 添加 guided theme builder。
- [ ] 支持 accent / neutral / radius / density / font / shadow。
- [ ] 显示 component matrix 和 blocks preview。
- [ ] 导出 CSS variables。
- [ ] 导出 shadcn `registry:theme`。
- [ ] 导出 DTCG JSON。
- [ ] 支持 share URL。

---

## 9. 推荐优先级排序

如果只做 10 件事，按这个顺序：

1. **建立 `themeMeta.ts` 单一事实源。**
2. **让 scripts 和 registry validation 使用 theme metadata。**
3. **文档化 token contract：public tokens、component aliases、docs-only tokens。**
4. **修复 `useTheme()` 多实例同步问题。**
5. **拆出 docs-only CSS，不让 package CSS 混入 docs implementation。**
6. **引入 `--bt-*` 新公共 token alias。**
7. **把 `/themes` 升级为真正 gallery。**
8. **生成 shadcn-compatible registry items。**
9. **新增 `/llms.txt` 和 agent metadata。**
10. **做 theme builder MVP。**

---

## 10. 建议 issue 拆分

### Epic A：Theme metadata source of truth

- [ ] Create `src/styles/themeMeta.ts`
- [ ] Export `themeStyles` from metadata
- [ ] Add theme family/tags/defaultMode/previewMode fields
- [ ] Update preview generator to read metadata
- [ ] Update e2e verifier to read metadata
- [ ] Update registry validator to compare metadata and registry variants
- [ ] Update `/themes` page to render from metadata

### Epic B：Theme token contract

- [ ] Define public token taxonomy
- [ ] Add `--bt-*` aliases for existing tokens
- [ ] Mark old tokens as compatibility aliases in docs
- [ ] Document contrast pairs
- [ ] Document component alias tokens
- [ ] Add token validation script
- [ ] Add theming docs page

### Epic C：CSS architecture cleanup

- [ ] Identify docs-only selectors in `themes.css`
- [ ] Move docs-only rules to `docs-theme.css` or `App.css`
- [ ] Keep package CSS focused on components and public tokens
- [ ] Introduce component alias tokens in Button
- [ ] Introduce component alias tokens in Select
- [ ] Migrate shadcn/neo overrides toward token assignments
- [ ] Consider CSS cascade layers

### Epic D：Theme runtime

- [ ] Refactor `useTheme()` to external store or provider
- [ ] Add safe localStorage helpers
- [ ] Add cross-tab storage sync
- [ ] Add single media query listener for system mode
- [ ] Add early inline theme script for docs app
- [ ] Add tests for query/localStorage/system precedence

### Epic E：Theme gallery

- [ ] Redesign `/themes` as gallery
- [ ] Add family filters
- [ ] Add light/dark preview cards
- [ ] Add copy CSS action
- [ ] Add install action
- [ ] Add theme detail pages
- [ ] Add realistic preview matrix
- [ ] Generate both light/dark preview assets

### Epic F：Registry v2 / agent-native

- [ ] Create internal registry manifest
- [ ] Generate standard `registry.json` with `items`
- [ ] Generate component item JSON
- [ ] Generate theme item JSON
- [ ] Generate block item JSON
- [ ] Add `meta.agent` metadata
- [ ] Test with shadcn CLI
- [ ] Add namespace install docs
- [ ] Add Open in v0 links
- [ ] Add `/llms.txt` and `/llms-full.txt`

---

## 11. 最终建议

`base-themes` 当前的主题系统方向是对的：CSS variables、`data-style`、`data-theme`、多主题、Base UI wrappers、registry、agent skill 都是非常好的基础。

真正需要优化的是：

- **契约清晰度**：哪些 token 是稳定公共 API？
- **维护一致性**：theme list 和 mode metadata 不要到处复制。
- **分发标准化**：registry 要兼容 shadcn/v0/MCP，而不是只做内部 manifest。
- **展示产品化**：theme gallery 要让用户看到真实应用效果，不只是 swatches。
- **验证自动化**：新增主题和修改 token 时要有 schema、contrast、preview、e2e checks。
- **agent-native 差异化**：让 AI 能理解每个 theme/block 适合什么、怎么安装、怎么修改。

长期目标应该是：

> **Base Themes 不只是 20 个主题，而是一套可验证、可复制、可被 agent 理解和扩展的 Base UI theme system。**

# Theme Contribution Checklist

遵循此清单新增或修改 theme，确保 token + 行为 + 文档的一致性。

---

## 新增 Theme

### 第 0 步：公开 Token 合约（必做）

Base Themes 的公开主题合约是 `docs/theme-token-contract.md` 和 `src/styles/tokenContract.json`。新增或修改 theme 时必须保持所有 `--bt-*` token 可用，并继续支持 `data-style` / `data-theme`。

- 新文档、示例和 agent workflow 应优先使用 `--bt-*` token。
- `--bg`、`--surface`、`--accent`、`--theme-focus` 等旧 token 是 0.x 兼容别名，当前仍需保留。
- 不要把 docs-only token（例如 `--topbar-bg`、`--card-bg`、`--hero-text`）当成 package component API。
- 修改后运行 `npm run tokens:check`。

### 第 1 步：Token 定义（必做）

在 `src/styles/tokens.css` 中添加：

```css
/* Light mode — 必做 */
[data-style='your-theme'] {
  --bg: ...;
  --surface: ...;
  --surface-strong: ...;
  --surface-muted: ...;
  --text: ...;
  --text-strong: ...;
  --text-muted: ...;
  --line: ...;
  --line-strong: ...;
  --accent: ...;
  --accent-strong: ...;
  --teal: ...;
  --blue: ...;
  --green: ...;
  --shadow: ...;
  --shadow-strong: ...;
  --radius: ...;
  --radius-sm: ...;
  /* 以下 token 必须覆盖，使用合适的值 */
  --topbar-bg, --topbar-border, --card-bg, --chip-bg,
  --group-bg, --nav-bg, --track-bg, --switch-off-bg,
  --hero-text, --backdrop,
  --code-bg, --code-text, --code-keyword, --code-string,
  --code-component, --code-tag, --code-number, --code-comment,
  --scrollbar-track, --scrollbar-thumb, --scrollbar-thumb-hover,
  --selection-bg, --selection-text
}

/* Dark mode — 必做 */
[data-style='your-theme'][data-theme='dark'] {
  /* 覆盖所有上述 token */
}
```

> 参考 `tokens.css` 中已有 theme 的 token 定义格式。至少需要覆盖 40+ 个 CSS 变量。

### 第 2 步：行为 Token（推荐）

在 `tokens.css` 底部的行为 token 区域添加覆盖：

```css
[data-style='your-theme'] {
  --theme-border-width: ...;      /* 默认 1px */
  --theme-font-weight: ...;       /* 默认 720 */
  --theme-transition-duration: ...; /* 默认 160ms */
  --theme-letter-spacing: ...;    /* 默认 0 */
}
```

### 第 3 步：Theme 专属 CSS（可选，推荐明显差别的 theme 做）

在 `src/styles/` 中创建 `your-theme.css`，使用 `[data-style='your-theme']` 选择器。

关注以下组件差异化：

- 焦点环样式（`focus-visible`）
- 按钮形状、边框、hover 效果
- 输入框 focus 效果
- 弹出层阴影和边框
- 选中/高亮状态
- 特殊组件（Slider、Switch、Progress 等）

在 `src/index.css` 中 import：

```css
@import './styles/your-theme.css';
```

> 参考 `cyberpunk.css`（霓虹效果）、`glass.css`（磨砂效果）、`neo-brutalism.css`（厚边框）的模式。

### 第 4 步：注册 Theme

在 `src/styles/themeList.ts` 中添加：

```ts
// themeStyles 数组
export const themeStyles = [
  ...,
  'your-theme',
] as const

// themeStyleLabels
export const themeStyleLabels: Record<ThemeStyle, string> = {
  ...,
  'your-theme': 'Your Theme Name',
}

// themeStyleDescriptions
export const themeStyleDescriptions: Record<ThemeStyle, string> = {
  ...,
  'your-theme': 'Short description of the visual style.',
}
```

### 第 5 步：README 预览

1. 为 light 和 dark 模式生成预览截图：

```bash
npm run previews:generate
```

2. 在 README.md 的 Preview 表格中添加一行。

### 第 6 步：验证

```bash
# 0. Public token contract
npm run tokens:check

# 1. Lint + Build
npm run lint
npm run build

# 2. Registry 检查
npm run registry:check

# 3. Theme e2e（需要 agent-browser）
npm run themes:e2e

# 4. 手动检查
# - 在 http://localhost:5175/themes 中切换新 theme
# - 测试 light/dark 切换
# - 测试 Button primary/outline/ghost/icon/accent/teal 变体
# - 测试 Select open/close/keyboard nav
# - 测试 Dialog open/close
# - 测试 Input focus/disabled
# - 测试 Tabs switch
# - 测试 Switch toggle
```

### 第 7 步：提交

Commit message 格式：

```
feat(themes): add `<theme-name>` style
```

---

## 修改已有 Theme

### Token 修改

直接编辑 `tokens.css` 中对应的 `[data-style='X']` 块。确保同时更新 light 和 dark 变体。

### 行为修改

- 通用行为 → `themes.css`
- 特定 theme 的行为 → 该 theme 的专属 CSS 文件（`src/styles/X.css`）
- 新增行为 token → `tokens.css` 底部的行为 token 区

### 验证

修改后至少需要：
1. `npm run build` 通过
2. 在 docs site 中手动切换 theme 检查视觉变化
3. 检查 light/dark 模式都正常

---

## Theme 设计原则

- **Token 第一。** 能用 token 差异化的不要写专属 CSS。
- **行为 token 第二。** `--theme-border-width`、`--theme-font-weight` 等 token 让不同 theme 共享同一套组件 CSS。
- **专属 CSS 做视觉差异。** 只有明显的视觉风格（霓虹、毛玻璃、厚边框）才需要专属 CSS 文件。
- **保持一致。** 所有 theme 的 light/dark 切换必须平滑，所有组件状态必须可辨识。
- **可访问性优先。** focus-visible 必须在所有 theme 下清晰可见，disabled 状态必须可辨识。

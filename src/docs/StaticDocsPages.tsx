import { useMemo, useState, type CSSProperties } from 'react'
import { Check, Copy, GitFork, ImagePlus, MessageCircle, MessageSquarePlus, Star } from 'lucide-react'
import { ComponentDemo } from '../components/ComponentDemo'
import { Button, Input, Select, Switch } from '../components/ui'
import { trackEvent } from '../analytics'

export type StaticDocsPageId =
  | 'installation'
  | 'theming'
  | 'registry'
  | 'cliUsage'
  | 'agentUsage'
  | 'examples'
  | 'contributingGuide'
  | 'themeCustomization'
  | 'whyBaseThemes'
  | 'baseUiVsShadcn'
  | 'tokenSystem'
  | 'accessibility'
  | 'migrationGuide'
  | 'designHandoff'
  | 'securityTrust'

const accentOptions = {
  '#f97316': 'Orange',
  '#2563eb': 'Blue',
  '#7c3aed': 'Violet',
  '#0f766e': 'Teal',
  '#dc2626': 'Red',
}

const radiusOptions = {
  '4px': 'Tight',
  '8px': 'Default',
  '14px': 'Rounded',
  '22px': 'Pill',
}

const fontOptions = {
  'Inter, ui-sans-serif, system-ui, sans-serif': 'System',
  'Georgia, serif': 'Editorial',
  'SFMono-Regular, Consolas, monospace': 'Mono',
}

const projectRepoUrl = 'https://github.com/markbang/base-themes'
const projectForkUrl = `${projectRepoUrl}/fork`
const showAndTellUrl = `${projectRepoUrl}/discussions/new?category=show-and-tell`
const bugReportUrl = `${projectRepoUrl}/issues/new?template=bug_report.yml`
const featureRequestUrl = `${projectRepoUrl}/issues/new?template=feature_request.yml`
const gallerySubmissionUrl = `${projectRepoUrl}/issues/new?template=gallery_submission.yml`
const goodFirstIssuesUrl = `${projectRepoUrl}/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22`

const packageManagers = [
  { id: 'npm', label: 'npm', command: 'npm install base-themes @base-ui/react react react-dom' },
  { id: 'pnpm', label: 'pnpm', command: 'pnpm add base-themes @base-ui/react react react-dom' },
  { id: 'yarn', label: 'yarn', command: 'yarn add base-themes @base-ui/react react react-dom' },
  { id: 'bun', label: 'bun', command: 'bun add base-themes @base-ui/react react react-dom' },
] as const

type PackageManagerId = typeof packageManagers[number]['id']

function trackFeedbackClick(source: string, target: string) {
  trackEvent('github_outbound_click', { source, target })
}

function FeedbackCta({ source }: { source: string }) {
  return (
    <section className="doc-feedback-cta" aria-labelledby={`${source}-feedback-title`}>
      <div>
        <div className="doc-kicker">After trying it</div>
        <h2 id={`${source}-feedback-title`}>Leave one public signal</h2>
        <p>Run the install or doctor flow in a real app, then open the smallest useful signal: a star, fork, discussion, missing component request, bug report, or gallery submission.</p>
      </div>
      <div className="doc-feedback-actions">
        <a href={projectRepoUrl} target="_blank" rel="noreferrer" onClick={() => trackFeedbackClick(source, 'repo-star')}>
          <Star size={17} /> Star
        </a>
        <a href={projectForkUrl} target="_blank" rel="noreferrer" onClick={() => trackFeedbackClick(source, 'repo-fork')}>
          <GitFork size={17} /> Fork
        </a>
        <a href={showAndTellUrl} target="_blank" rel="noreferrer" onClick={() => trackFeedbackClick(source, 'show-and-tell')}>
          <MessageCircle size={17} /> Discuss
        </a>
        <a href={featureRequestUrl} target="_blank" rel="noreferrer" onClick={() => trackFeedbackClick(source, 'feature-request')}>
          <MessageSquarePlus size={17} /> Request
        </a>
        <a href={bugReportUrl} target="_blank" rel="noreferrer" onClick={() => trackFeedbackClick(source, 'bug-report')}>
          <MessageSquarePlus size={17} /> Bug
        </a>
        <a href={gallerySubmissionUrl} target="_blank" rel="noreferrer" onClick={() => trackFeedbackClick(source, 'gallery-submission')}>
          <ImagePlus size={17} /> Gallery
        </a>
      </div>
    </section>
  )
}

function PackageInstallTabs() {
  const [activeManager, setActiveManager] = useState<PackageManagerId>('npm')
  const [copied, setCopied] = useState(false)
  const active = packageManagers.find((manager) => manager.id === activeManager) ?? packageManagers[0]

  const copyCommand = () => {
    trackEvent('install_command_copy', { source: 'docs-installation', manager: active.id })
    void navigator.clipboard?.writeText(active.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="install-command-card" aria-labelledby="install-command-title">
      <div className="install-command-tabs" role="tablist" aria-label="Package manager">
        {packageManagers.map((manager) => (
          <button
            aria-selected={manager.id === activeManager}
            className={manager.id === activeManager ? 'active' : undefined}
            key={manager.id}
            onClick={() => setActiveManager(manager.id)}
            role="tab"
            type="button"
          >
            {manager.label}
          </button>
        ))}
      </div>
      <div className="install-command-row">
        <h2 className="sr-only" id="install-command-title">Install command</h2>
        <code><span>{active.id}</span> {active.command.replace(`${active.id} `, '')}</code>
        <button type="button" aria-label="Copy install command" onClick={copyCommand}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </section>
  )
}

function ThemeCustomizationPage() {
  const [accent, setAccent] = useState('#2563eb')
  const [radius, setRadius] = useState('8px')
  const [font, setFont] = useState('Inter, ui-sans-serif, system-ui, sans-serif')
  const [dense, setDense] = useState(false)

  const setStringValue = (setter: (value: string) => void) => (value: unknown) => {
    if (typeof value === 'string') setter(value)
  }

  const cssVariables = useMemo(() => `:root {
  --accent: ${accent};
  --teal: ${accent};
  --radius: ${radius};
  --radius-sm: ${radius === '4px' ? '3px' : radius === '8px' ? '6px' : radius === '14px' ? '10px' : '999px'};
  --font-sans: ${font};
  --theme-control-height: ${dense ? '34px' : '42px'};
}`, [accent, dense, font, radius])

  const copyCss = () => {
    void navigator.clipboard?.writeText(cssVariables)
  }

  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Customization</div>
        <h1>Theme Customization</h1>
        <p>Adjust the primary color, radius, font, and density tokens, then copy the CSS variables into your app.</p>
      </div>

      <section className="customizer-layout">
        <div className="customizer-controls">
          <Select id="custom-accent" label="Primary color" items={accentOptions} value={accent} onValueChange={setStringValue(setAccent)} />
          <Select id="custom-radius" label="Radius" items={radiusOptions} value={radius} onValueChange={setStringValue(setRadius)} />
          <Select id="custom-font" label="Font" items={fontOptions} value={font} onValueChange={setStringValue(setFont)} />
          <Switch id="custom-density" label="Compact controls" checked={dense} onCheckedChange={setDense} />
        </div>

        <div className="customizer-preview" style={{ '--accent': accent, '--teal': accent, '--radius': radius, '--radius-sm': radius, '--font-sans': font, '--theme-control-height': dense ? '34px' : '42px' } as CSSProperties}>
          <div className="customizer-preview-header">
            <span>Preview</span>
            <Button variant="accent">Publish</Button>
          </div>
          <div className="theme-sample">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="teal">Token action</Button>
            <Input id="customizer-preview-input" label="Workspace" placeholder="Base Themes" />
          </div>
        </div>
      </section>

      <ComponentDemo
        title="Copy CSS variables"
        preview={<Button variant="outline" onClick={copyCss}><Copy size={15} /> Copy variables</Button>}
        code={cssVariables} />
    </article>
  )
}

function WhyBaseThemesPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Why Base Themes</div>
        <h1>Base UI Components with a Theme Layer</h1>
        <p>Base UI gives React teams accessible unstyled primitives. Base Themes adds typed wrappers, CSS variables, visual themes, blocks, and registry metadata without hiding the underlying component model.</p>
      </div>
      <ComponentDemo
        title="Install and render"
        preview={<div className="theme-sample"><Button>Save changes</Button><Button variant="outline">Cancel</Button><Input id="why-workspace" label="Workspace" placeholder="Acme" /></div>}
        code={`npm install base-themes @base-ui/react react react-dom

import 'base-themes/styles.css'
import { Button, Input } from 'base-themes'

export function SettingsHeader() {
  return (
    <section data-style="enterprise" data-theme="light">
      <Input id="workspace" label="Workspace" />
      <Button>Save changes</Button>
    </section>
  )
}`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>What Base Themes adds</h2>
          <p>The project is built for teams that want Base UI accessibility, package installs, source-copy metadata, and theme customization in the same workflow.</p>
        </div>
        <ul className="interaction-list">
          <li>Typed React wrappers around Base UI primitives with CSS class contracts.</li>
          <li>Twenty `data-style` visual systems with light and dark `data-theme` support.</li>
          <li>Registry metadata for components, blocks, pages, source files, and agent workflows.</li>
          <li>Production checks for registry parity, SSR import safety, theme e2e, SEO routes, and package contents.</li>
        </ul>
      </section>
    </article>
  )
}

function BaseUiVsShadcnPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Comparison</div>
        <h1>Base UI vs shadcn/ui for Themed React Apps</h1>
        <p>shadcn/ui is a strong source-copy ecosystem. Base Themes is different: it starts from Base UI primitives, ships as an npm package, and exposes registry metadata for both package and source-copy workflows.</p>
      </div>
      <section className="doc-section">
        <div className="section-heading">
          <h2>Choose by workflow</h2>
          <p>The right choice depends on whether you want to own copied component code immediately or install a maintained Base UI theme layer first.</p>
        </div>
        <div className="api-table-wrap">
          <table className="api-table">
            <thead><tr><th>Need</th><th>shadcn/ui</th><th>Base Themes</th></tr></thead>
            <tbody>
              <tr><td>Primitive foundation</td><td>Radix and community components</td><td>Base UI React primitives</td></tr>
              <tr><td>Install model</td><td>Source-copy first</td><td>npm package plus registry/source-copy metadata</td></tr>
              <tr><td>Theming</td><td>Tailwind and CSS variable conventions</td><td>`data-style`, `data-theme`, and package CSS variables</td></tr>
              <tr><td>Agent workflows</td><td>Registry-friendly ecosystem</td><td>Bundled registry JSON, metadata exports, and agent skill</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <ComponentDemo
        title="Registry discovery"
        preview={<span className="muted">Base Themes exposes metadata for tools that need to resolve package and source-copy surfaces.</span>}
        code={`import registry from 'base-themes/registry.json'

console.log(registry.components.length)
console.log(registry.blocks.map((block) => block.name))`} />
    </article>
  )
}

function TokenSystemPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Tokens</div>
        <h1>CSS Variable Theme System for React</h1>
        <p>Base Themes uses semantic CSS variables so React components, blocks, and docs pages can switch visual systems without a JavaScript theme runtime.</p>
      </div>
      <ComponentDemo
        title="Runtime contract"
        preview={<div className="theme-sample"><Button variant="accent">Accent</Button><Button variant="teal">Teal</Button><Input id="token-system-input" label="Tokenized input" placeholder="Theme aware" /></div>}
        code={`<main data-style="bento" data-theme="light">
  <App />
</main>

[data-style='brand'] {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text-strong: #111827;
  --accent: #2563eb;
  --teal: #0f766e;
  --radius: 10px;
}`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>Token layers</h2>
          <p>Keep custom themes maintainable by changing semantic tokens before reaching for component-specific overrides.</p>
        </div>
        <ul className="interaction-list">
          <li>Surface tokens: `--bg`, `--surface`, `--surface-muted`, `--line`, and `--line-strong`.</li>
          <li>Text tokens: `--text`, `--text-strong`, `--text-muted`, and code syntax tokens.</li>
          <li>Action tokens: `--accent`, `--teal`, status tokens, focus rings, and control sizing.</li>
          <li>Shape and typography tokens: `--radius`, `--radius-sm`, `--font-sans`, and `--font-mono`.</li>
        </ul>
      </section>
    </article>
  )
}

function AccessibilityPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Accessibility</div>
        <h1>Accessible React UI Components on Base UI</h1>
        <p>Base Themes keeps accessibility responsibilities close to Base UI primitives, then validates wrapper behavior, focus states, theme contrast, and SSR safety around that foundation.</p>
      </div>
      <ComponentDemo
        title="Accessible interaction primitives"
        preview={<div className="theme-sample"><Select id="a11y-density" label="Density" items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }} defaultValue="comfortable" /><Switch id="a11y-motion" label="Reduced motion" /><Button>Apply</Button></div>}
        code={`import { Button, Select, Switch } from 'base-themes'

<Select
  id="density"
  label="Density"
  items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
/>
<Switch id="motion" label="Reduced motion" />
<Button>Apply</Button>`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>Validation coverage</h2>
          <p>Accessibility is not just a claim in the README; the repo includes automated checks that protect core wrapper behavior and theme readability.</p>
        </div>
        <ul className="interaction-list">
          <li>Unit tests cover Button rendering, Select option selection, Dialog open/close behavior, and `useTheme` persistence.</li>
          <li>Theme e2e checks validate contrast, popup readability, selected tab state, and browser errors across representative or full theme sets.</li>
          <li>Registry validation keeps component docs, source files, metadata, pages, blocks, and themes in sync.</li>
          <li>Package smoke verifies SSR rendering and public exports before publish.</li>
        </ul>
      </section>
    </article>
  )
}

function MigrationGuidePage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Migration</div>
        <h1>Migrate to Base Themes</h1>
        <p>Adopt Base Themes incrementally: start with package CSS and one component surface, then move repeated patterns into shared tokens and registry-backed blocks.</p>
      </div>

      <ComponentDemo
        title="Incremental wrapper"
        preview={<div className="theme-sample"><Button>Save</Button><Button variant="outline">Cancel</Button><Input id="migration-workspace" label="Workspace" placeholder="Acme" /></div>}
        code={`npm install base-themes @base-ui/react react react-dom

import 'base-themes/styles.css'
import { Button, Input } from 'base-themes'

export function MigratedForm() {
  return (
    <form data-style="enterprise" data-theme="light">
      <Input id="workspace" label="Workspace" />
      <Button>Save</Button>
    </form>
  )
}`} />

      <section className="doc-section">
        <div className="section-heading">
          <h2>Migration paths</h2>
          <p>Choose the path that matches how much component ownership your team wants on day one.</p>
        </div>
        <div className="api-table-wrap">
          <table className="api-table">
            <thead><tr><th>From</th><th>Start with</th><th>Watch for</th></tr></thead>
            <tbody>
              <tr><td>Base UI primitives</td><td>Replace local class recipes with Base Themes wrappers and shared CSS tokens.</td><td>Keep custom behavior on Base UI props, not one-off DOM wrappers.</td></tr>
              <tr><td>shadcn/ui</td><td>Map visual tokens to `data-style` and replace high-traffic components first.</td><td>Tailwind utility variants may need token equivalents or source-copy exceptions.</td></tr>
              <tr><td>MUI or Chakra</td><td>Move layout shells first, then migrate forms, dialogs, and navigation in slices.</td><td>Prop names and controlled component semantics are not one-to-one.</td></tr>
              <tr><td>Custom CSS components</td><td>Keep existing layout, import `base-themes/styles.css`, and replace repeated controls.</td><td>Audit global CSS specificity before deleting old component styles.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h2>Adoption checklist</h2>
          <p>Keep each migration slice small enough to verify in one pull request.</p>
        </div>
        <ul className="interaction-list">
          <li>Import `base-themes/styles.css` once at the app root.</li>
          <li>Set `data-style` and `data-theme` on the route, shell, or app container.</li>
          <li>Replace one component family at a time, starting with Button, Input, Select, Dialog, and Tabs.</li>
          <li>Run `npm run package:smoke`, `npm run test`, and visual checks for theme-heavy changes.</li>
        </ul>
      </section>
    </article>
  )
}

function DesignHandoffPage() {
  const tokenExport = `{
  "style": "enterprise",
  "theme": "light",
  "tokens": {
    "bg": "var(--bg)",
    "surface": "var(--surface)",
    "textStrong": "var(--text-strong)",
    "accent": "var(--accent)",
    "radius": "var(--radius)",
    "fontSans": "var(--font-sans)"
  }
}`

  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Design Handoff</div>
        <h1>Figma and Design Token Handoff</h1>
        <p>Use Base Themes tokens as the shared contract between design files, implementation, previews, and agent-driven customization work.</p>
      </div>

      <ComponentDemo
        title="Token export shape"
        preview={<div className="theme-sample"><Button variant="accent">Primary action</Button><Button variant="outline">Secondary</Button><Input id="handoff-name" label="Project" placeholder="Design system" /></div>}
        code={tokenExport} />

      <section className="doc-section">
        <div className="section-heading">
          <h2>Designer workflow</h2>
          <p>Keep design tooling aligned with the runtime contract instead of duplicating component-specific style decisions.</p>
        </div>
        <ul className="interaction-list">
          <li>Create Figma variables or styles from semantic tokens: background, surface, text, accent, status, radius, and typography.</li>
          <li>Name modes after Base Themes selectors: `data-style` for visual system and `data-theme` for light or dark mode.</li>
          <li>Use preview PNGs from `public/previews` as review artifacts when changing a theme.</li>
          <li>Document any brand override as CSS variables first; only add component CSS when tokens cannot express the need.</li>
        </ul>
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h2>Implementation handoff</h2>
          <p>Give engineers and agents enough structure to apply design changes without guessing at class internals.</p>
        </div>
        <div className="api-table-wrap">
          <table className="api-table">
            <thead><tr><th>Artifact</th><th>Use</th></tr></thead>
            <tbody>
              <tr><td>`src/docs/themeMeta.json`</td><td>Theme labels and descriptions for docs, SEO, previews, and tooling.</td></tr>
              <tr><td>`registry/registry.json`</td><td>Components, blocks, pages, files, dependencies, and available theme variants.</td></tr>
              <tr><td>`src/styles/tokens.css`</td><td>Base semantic token contract and default light/dark behavior.</td></tr>
              <tr><td>`src/styles/themes.css`</td><td>Per-style token overrides and visual system behavior.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  )
}

function InstallationPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Installation</div>
        <h1>Install Base Themes</h1>
        <p>Install with your package manager, import the bundled CSS once, choose a visual style, then import only the components and blocks your screen renders.</p>
      </div>
      <PackageInstallTabs />
      <ComponentDemo
        title="Load styles and pick a theme"
        preview={<span className="muted">Set data-style and data-theme on the app shell, route, or any scoped preview.</span>}
        code={`import 'base-themes/styles.css'

export function RootLayout({ children }) {
  return (
    <main data-style="neo-brutalism" data-theme="dark">
      {children}
    </main>
  )
}`} />
      <ComponentDemo
        title="Import only what you render"
        preview={<Button>Installed</Button>}
        code={`import { Button, DashboardShell, Select, Switch } from 'base-themes'

export function App() {
  return (
    <main data-style="enterprise" data-theme="light">
      <Button>Installed</Button>
      <Select label="Density" items={{ compact: 'Compact', comfortable: 'Comfortable' }} />
      <Switch label="Weekly summary" />
      <DashboardShell />
    </main>
  )
}`} />
      <ComponentDemo
        title="Plan source-copy or agent installs"
        preview={<span className="muted">Use the CLI when you want registry metadata, source-copy plans, theme steps, or install diagnostics.</span>}
        code={`npx base-themes list
npx base-themes plan button select block:dashboard-shell theme:enterprise --json
npx base-themes doctor .

import registry from 'base-themes/registry.json'

// Agent skill markdown is available at:
// node_modules/base-themes/skills/base-themes/SKILL.md
// or via the package export: base-themes/skill`} />
      <FeedbackCta source="docs-installation" />
    </article>
  )
}

function ThemingDocsPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Theming</div>
        <h1>Theme Tokens and CSS Variables</h1>
        <p>Base Themes uses a small runtime contract and CSS variables so product teams can switch visual systems without adopting a JavaScript theme runtime.</p>
      </div>
      <ComponentDemo
        title="Runtime contract"
        preview={<div className="theme-sample"><Button>Primary</Button><Button variant="outline">Outline</Button><Input label="Workspace" placeholder="Theme aware" /></div>}
        code={`<html data-style="enterprise" data-theme="light">
  <body>
    <App />
  </body>
</html>`} />
      <ComponentDemo
        title="Override tokens"
        preview={<span className="muted">Override semantic variables globally or under a scoped data-style selector.</span>}
        code={`:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text-strong: #111827;
  --accent: #2563eb;
  --teal: #0f766e;
}

[data-style='brand'] {
  --accent: #7c3aed;
  --teal: #0891b2;
  --radius: 10px;
}`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>Theme workflow</h2>
          <p>Start from a shipped style, change semantic tokens first, then validate focus rings, disabled states, overlays, and dark mode before publishing a custom style.</p>
        </div>
        <ul className="interaction-list">
          <li>Use `data-style` for visual language and `data-theme` for light or dark mode.</li>
          <li>Keep component code stable; customize through tokens and small per-style CSS rules.</li>
          <li>Run `npm run themes:e2e` before release-level theme changes.</li>
        </ul>
      </section>
    </article>
  )
}

function RegistryDocsPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Registry</div>
        <h1>Registry and Source Copy Workflow</h1>
        <p>The registry is the machine-readable contract for components, blocks, dependencies, source files, pages, and theme variants.</p>
      </div>
      <ComponentDemo
        title="Read registry metadata"
        preview={<span className="muted">The package exposes the same registry consumed by docs, examples, validation, and agent workflows.</span>}
        code={`import registry from 'base-themes/registry.json'
import shadcnRegistry from 'base-themes/shadcn-registry.json'
import buttonItem from 'base-themes/registry/items/button.json'
import dashboardItem from 'base-themes/registry/items/block-dashboard-shell.json'
import blockMeta from 'base-themes/block-meta.json'

console.log(registry.components.length)
console.log(registry.blocks.map((block) => block.name))
console.log(blockMeta.map((block) => block.exportName))
console.log(buttonItem.meta.agent.packageInstall)
console.log(dashboardItem.meta.agent.registryItems)
console.log(registry.style.variants)
console.log(shadcnRegistry.items.length)`} />
      <ComponentDemo
        title="Fetch hosted registry metadata"
        preview={<span className="muted">Docs deployments also publish stable JSON artifacts for tools that prefer HTTPS over package imports.</span>}
        code={`const registry = await fetch('https://base-themes.bangwu.me/registry/registry.json').then((res) => res.json())
const shadcnRegistry = await fetch('https://base-themes.bangwu.me/registry/shadcn-registry.json').then((res) => res.json())
const buttonItem = await fetch('https://base-themes.bangwu.me/registry/items/button.json').then((res) => res.json())
const dashboardItem = await fetch('https://base-themes.bangwu.me/registry/items/block-dashboard-shell.json').then((res) => res.json())
const blockMeta = await fetch('https://base-themes.bangwu.me/registry/block-meta.json').then((res) => res.json())
const componentMeta = await fetch('https://base-themes.bangwu.me/registry/component-meta.json').then((res) => res.json())
const themeMeta = await fetch('https://base-themes.bangwu.me/registry/theme-meta.json').then((res) => res.json())

console.log(registry.blocks.length, shadcnRegistry.items.length, blockMeta.length, componentMeta.length, themeMeta.length)
console.log(buttonItem.meta.agent.packageInstall)
console.log(dashboardItem.meta.agent.registryItems)
console.log(dashboardItem.meta.agent.sourceCopy)`} />
      <ComponentDemo
        title="Plan source-copy install"
        preview={<span className="muted">Resolve block and component source files before copying into an app.</span>}
        code={`npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json

# Output includes:
# - package dependencies
# - src/index.css and every registry style file
# - src/blocks/DashboardShell.tsx
# - component source files used by the block
# - registry item imports and hosted item URLs`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>Registry contract</h2>
          <p>Every public component or block should keep source files, registry metadata, docs examples, and package exports aligned.</p>
        </div>
        <ul className="interaction-list">
          <li>Run `npm run registry:check` after adding components, blocks, pages, styles, or metadata.</li>
          <li>Component entries list source files and CSS needed for copy-based tools.</li>
          <li>Block entries list category, description, source files, and component dependencies.</li>
          <li>Standard registry items expose `meta.agent.packageInstall`, `meta.agent.sourceCopy`, and block `meta.agent.registryItems` for deterministic agent workflows.</li>
        </ul>
      </section>
      <FeedbackCta source="docs-registry" />
    </article>
  )
}

function AgentUsagePage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Agents</div>
        <h1>Agent Usage Guide</h1>
        <p>Base Themes ships registry metadata and a bundled skill so coding agents can install, inspect, customize, and verify UI changes predictably.</p>
      </div>
      <ComponentDemo
        title="Load the bundled skill"
        preview={<span className="muted">The skill describes install, source-copy, theme customization, and verification workflows.</span>}
        code={`// Available in the npm package:
node_modules/base-themes/skills/base-themes/SKILL.md

// Or through package exports for tools that read exports:
base-themes/skill`} />
      <ComponentDemo
        title="Agent-safe verification"
        preview={<span className="muted">Use deterministic checks before returning a UI change.</span>}
        code={`npm run registry:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run package:smoke
npm run community:check
npm run community:issues -- --json
npm run example:theme-customization:build
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>Agent guardrails</h2>
          <p>Prefer existing component APIs, registry metadata, and CSS token overrides over ad hoc rewrites.</p>
        </div>
        <ul className="interaction-list">
          <li>Use `base-themes/registry.json` to discover source files and dependencies.</li>
          <li>Use `base-themes/block-meta.json`, `base-themes/component-meta.json`, and `base-themes/theme-meta.json` for docs, block, and SEO metadata.</li>
          <li>Use `npx base-themes doctor .` after installing into a real app and include WARN output in bug reports.</li>
          <li>Update tests and registry validation when changing public behavior.</li>
        </ul>
      </section>
      <FeedbackCta source="docs-agent-usage" />
    </article>
  )
}

function CliUsagePage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">CLI</div>
        <h1>Base Themes CLI</h1>
        <p>Use the package CLI to inspect registry coverage and generate source-copy plans for components, blocks, dependencies, and style files.</p>
      </div>

      <ComponentDemo
        title="Inspect the registry"
        preview={<span className="muted">List components, blocks, styles, and docs routes directly from the installed package.</span>}
        code={`npx base-themes list
npx base-themes list --json

# Output includes:
# Components (40)
# Blocks (8)
# Styles (21)
# Pages (15)`} />

      <ComponentDemo
        title="Generate a copy plan"
        preview={<span className="muted">Resolve registry item URLs, package imports, block dependencies, and component files before copying source into an app.</span>}
        code={`npx base-themes plan button select block:dashboard-shell theme:enterprise
npx base-themes plan button select block:dashboard-shell theme:enterprise --json

# Resolves:
# - package dependencies
# - package item imports such as base-themes/registry/items/button.json
# - hosted item URLs such as /registry/items/block-dashboard-shell.json
# - meta.agent.packageInstall and meta.agent.sourceCopy steps
# - block meta.agent.registryItems dependencies
# - theme item steps such as set data-style="enterprise"
# - registry style files, including src/index.css and imported theme CSS
# - src/blocks/DashboardShell.tsx
# - src/blocks/Blocks.css
# - required component source and CSS files`} />

      <ComponentDemo
        title="Copy source files"
        preview={<span className="muted">Execute the conservative source-copy path after reviewing the plan.</span>}
        code={`npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json
npx base-themes add button select block:dashboard-shell theme:enterprise --target .

# Behavior:
# - copies registry-listed style, block, and component files
# - creates directories under --target as needed
# - skips existing files by default
# - requires --force before overwriting local files`} />

      <ComponentDemo
        title="Check an installed project"
        preview={<span className="muted">Run doctor in a consumer app to catch missing package, CSS, theme wiring, and the next fix to apply.</span>}
        code={`npx base-themes doctor .
npx base-themes doctor . --json

# Checks:
# - package.json exists
# - base-themes, @base-ui/react, react, and react-dom are declared
# - base-themes/styles.css is imported once
# - data-style/data-theme or useTheme workflow is present
# - failed checks include a concrete Fix line and bug-report link`} />

      <section className="doc-section">
        <div className="section-heading">
          <h2>Agent workflow</h2>
          <p>The CLI is intentionally a planner, not a file copier. Agents and internal tools should make target-path, import-rewrite, formatting, and lockfile decisions explicitly.</p>
        </div>
        <ul className="interaction-list">
          <li>Use `base-themes list --json` before suggesting components, blocks, or theme styles.</li>
          <li>Use `base-themes plan --json` before source-copying files into a user project; it returns package item imports, hosted item URLs, `meta.agent.packageInstall`, `meta.agent.sourceCopy`, block `meta.agent.registryItems`, and theme `data-style` steps.</li>
          <li>Use `base-themes add --dry-run --json` to preview the exact files, then run `base-themes add` only when the target app should receive copied source files.</li>
          <li>Use `base-themes doctor --json` after installation to catch missing CSS, peer dependencies, theme wiring, and the next command or file edit to make.</li>
          <li>Use `base-themes/registry.json` for the full internal manifest and `base-themes/registry/items/*.json` for item-level shadcn-compatible metadata.</li>
          <li>Run `npm run registry:check`, `npm run test`, and `npm run build` after applying a copy plan.</li>
        </ul>
      </section>
      <FeedbackCta source="docs-cli" />
    </article>
  )
}

function ExamplesPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Examples</div>
        <h1>Runnable Base Themes Examples</h1>
        <p>Use the examples to verify a fresh install, inspect framework integration, evaluate a product dashboard, or build source-copy tooling from registry metadata.</p>
      </div>

      <ComponentDemo
        title="Build every example"
        preview={<span className="muted">Run these before release-impacting package, CSS, registry, block, or peer dependency changes.</span>}
        code={`npm run example:vite:build
npm run example:dashboard:build
npm run example:theme-customization:build
npm run example:next:build
npm run example:registry-copy -- button select block:dashboard-shell theme:enterprise
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json`} />

      <section className="doc-section">
        <div className="section-heading">
          <h2>Choose by integration question</h2>
          <p>Each example proves a different part of the adoption funnel, from blank install to realistic product surface.</p>
        </div>
        <div className="api-table-wrap">
          <table className="api-table">
            <thead><tr><th>Example</th><th>Use When</th><th>Verify</th></tr></thead>
            <tbody>
              <tr><td>`examples/vite`</td><td>You want a React 18 Vite app that imports components, CSS, `useTheme`, and registry JSON from the package.</td><td>`npm run example:vite:build`</td></tr>
              <tr><td>`examples/dashboard`</td><td>You want a product-style dashboard composed from shipped blocks, controls, theme switching, and registry metadata.</td><td>`npm run example:dashboard:build`</td></tr>
              <tr><td>`examples/theme-customization`</td><td>You want to override CSS tokens for brand color, radius, font, density, and copyable theme variables.</td><td>`npm run example:theme-customization:build`</td></tr>
              <tr><td>`examples/next`</td><td>You want a Next.js App Router / React 19 app with package CSS imported through `app/layout.tsx`.</td><td>`npm run example:next:build`</td></tr>
              <tr><td>`examples/registry-copy`</td><td>You want to list registry items, resolve source files, preview copied files, and run install diagnostics before copying code into another app.</td><td>`npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json`</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <ComponentDemo
        title="Dashboard example entry"
        preview={<span className="muted">The dashboard example is the closest package-level proof point for SaaS, admin, and internal-tool screens.</span>}
        code={`cd examples/dashboard
npm install
npm run dev

# Open http://localhost:5177
# Imports only documented package paths:
# - base-themes
# - base-themes/styles.css
# - base-themes/registry.json`} />

      <section className="doc-section">
        <div className="section-heading">
          <h2>What to report after trying one</h2>
          <p>Example failures are useful adoption feedback because they usually reveal package export, CSS import, peer dependency, or registry issues.</p>
        </div>
        <ul className="interaction-list">
          <li>Run `npx base-themes doctor .` inside the example or your app and include WARN output in a bug report.</li>
          <li>Open a feature request for the missing block, component, or theme that would make the dashboard example useful in your product.</li>
          <li>Submit a gallery issue when you adapt the dashboard or another example into a real app screen.</li>
        </ul>
      </section>
      <FeedbackCta source="docs-examples" />
    </article>
  )
}

function ContributingDocsPage() {
  const trackContributionClick = (target: string) => {
    trackFeedbackClick('docs-contributing', target)
  }

  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Contributing</div>
        <h1>Contributing to Base Themes</h1>
        <p>Contributions should keep source, docs, registry metadata, tests, examples, and theme behavior aligned.</p>
      </div>
      <ComponentDemo
        title="Local verification"
        preview={<span className="muted">Run the same checks used by CI before opening a pull request.</span>}
        code={`npm install
npm run registry:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run package:smoke`} />
      <ComponentDemo
        title="Fork-to-first-change"
        preview={<span className="muted">Fork the repo, change one theme or block in public, and verify it before asking maintainers to review it.</span>}
        code={`git clone https://github.com/<your-user>/base-themes.git
cd base-themes
npm install
npm run example:theme-customization:build
npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json
npm run package:smoke`} />
      <ComponentDemo
        title="Adding public surface"
        preview={<span className="muted">Components, blocks, and themes each require source, metadata, docs, and verification updates.</span>}
        code={`# Component changes
src/components/ui/*
src/docs/componentMeta.json
registry/registry.json

# Block changes
src/blocks/*
registry/registry.json
examples/registry-copy/plan-copy.mjs

# Theme changes
src/styles/tokens.css
src/docs/themeMeta.json
public/previews/*`} />
      <section className="doc-section">
        <div className="section-heading">
          <h2>Contribution checklist</h2>
          <p>Small changes are welcome when they preserve package trust and make adoption easier for the next user.</p>
        </div>
        <ul className="interaction-list">
          <li>Keep React 18 and React 19 examples building.</li>
          <li>Add focused tests for behavior changes in components or hooks.</li>
          <li>Start from a forked theme-customization or dashboard example when the change is visual or block-level.</li>
          <li>Use `npm pack --dry-run` before release-impacting package changes.</li>
        </ul>
      </section>
      <section className="doc-feedback-cta" aria-labelledby="docs-contributing-actions-title">
        <div>
          <div className="doc-kicker">Public contribution path</div>
          <h2 id="docs-contributing-actions-title">Start with one visible signal</h2>
          <p>Pick the smallest public action that matches what you learned from a real install, example run, or source-copy experiment.</p>
        </div>
        <div className="doc-feedback-actions">
          <a href={goodFirstIssuesUrl} target="_blank" rel="noreferrer" onClick={() => trackContributionClick('good-first-issues')}>
            <MessageSquarePlus size={17} /> Good first issues
          </a>
          <a href={featureRequestUrl} target="_blank" rel="noreferrer" onClick={() => trackContributionClick('feature-request')}>
            <MessageSquarePlus size={17} /> Request work
          </a>
          <a href={showAndTellUrl} target="_blank" rel="noreferrer" onClick={() => trackContributionClick('show-and-tell')}>
            <MessageCircle size={17} /> Discuss usage
          </a>
          <a href={gallerySubmissionUrl} target="_blank" rel="noreferrer" onClick={() => trackContributionClick('gallery-submission')}>
            <ImagePlus size={17} /> Submit build
          </a>
          <a href={projectForkUrl} target="_blank" rel="noreferrer" onClick={() => trackContributionClick('repo-fork')}>
            <GitFork size={17} /> Fork
          </a>
        </div>
      </section>
    </article>
  )
}

function SecurityTrustPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Security</div>
        <h1>Security and Release Trust</h1>
        <p>Base Themes is a public npm UI dependency, so adoption depends on clear vulnerability reporting, repeatable release checks, provenance, and small runtime dependencies.</p>
      </div>

      <ComponentDemo
        title="Report a vulnerability"
        preview={<span className="muted">Use GitHub private vulnerability reporting when available. Do not include secrets, tokens, keys, customer data, or production credentials in public issues.</span>}
        code={`# Preferred path
GitHub private vulnerability reporting

# If private reporting is unavailable
Open a minimal issue asking for a private security contact.
Do not include exploit details or secrets in the issue.

# Include
- affected base-themes version
- affected component, script, workflow, or registry item
- reproduction steps or proof of concept
- likely impact and mitigation`} />

      <ComponentDemo
        title="Release trust checks"
        preview={<span className="muted">Run the same checks before publishing release-impacting package, registry, CSS, docs, or example changes.</span>}
        code={`npm ci
npm run registry:check
npm run tokens:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run community:check
npm run community:issues -- --json
npm run package:smoke
npm pack --dry-run`} />

      <section className="doc-section">
        <div className="section-heading">
          <h2>Supply-chain posture</h2>
          <p>Trust is part of the package contract, not just a release checklist.</p>
        </div>
        <ul className="interaction-list">
          <li>Public releases are published through GitHub Actions with npm provenance.</li>
          <li>Runtime dependencies are intentionally small: `clsx` and `lucide-react`; React and Base UI stay peer dependencies.</li>
          <li>Registry validation checks package files, docs metadata, blocks, standard registry items, and hosted metadata parity.</li>
          <li>`base-themes/registry.json`, `base-themes/shadcn-registry.json`, and `base-themes/token-contract.json` expose machine-readable install and customization contracts.</li>
          <li>Dependabot is configured for npm and GitHub Actions updates.</li>
        </ul>
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h2>Supported scope</h2>
          <p>Security fixes target the latest published minor until the project has a stable major release policy.</p>
        </div>
        <ul className="interaction-list">
          <li>In scope: package source, bundled output, registry metadata, GitHub Actions workflows, release pipeline, and unsafe documentation examples.</li>
          <li>Out of scope: user application vulnerabilities after local modification, private user environments, spam, or social engineering reports.</li>
          <li>Initial triage target is 3 business days after a reproducible report reaches the maintainer.</li>
        </ul>
      </section>

      <FeedbackCta source="docs-security" />
    </article>
  )
}

export default function StaticDocsPages({ page }: { page: StaticDocsPageId }) {
  if (page === 'installation') return <InstallationPage />
  if (page === 'theming') return <ThemingDocsPage />
  if (page === 'registry') return <RegistryDocsPage />
  if (page === 'cliUsage') return <CliUsagePage />
  if (page === 'agentUsage') return <AgentUsagePage />
  if (page === 'examples') return <ExamplesPage />
  if (page === 'themeCustomization') return <ThemeCustomizationPage />
  if (page === 'whyBaseThemes') return <WhyBaseThemesPage />
  if (page === 'baseUiVsShadcn') return <BaseUiVsShadcnPage />
  if (page === 'tokenSystem') return <TokenSystemPage />
  if (page === 'accessibility') return <AccessibilityPage />
  if (page === 'migrationGuide') return <MigrationGuidePage />
  if (page === 'designHandoff') return <DesignHandoffPage />
  if (page === 'securityTrust') return <SecurityTrustPage />
  return <ContributingDocsPage />
}

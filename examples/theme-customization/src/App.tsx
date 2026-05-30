import { useMemo, useState, type CSSProperties } from 'react'
import {
  Button,
  Field,
  Fieldset,
  Input,
  Progress,
  Select,
  Switch,
  Tabs,
  type ThemeStyle,
  useTheme,
} from 'base-themes'
import registry from 'base-themes/registry.json'

const styleChoices = {
  bento: 'Bento',
  enterprise: 'Enterprise',
  glass: 'Glass',
  terminal: 'Terminal',
  'data-dense': 'Data dense',
}

const accentChoices = {
  '#2563eb': 'Blue',
  '#0f766e': 'Teal',
  '#f97316': 'Orange',
  '#dc2626': 'Red',
  '#7c3aed': 'Violet',
}

const radiusChoices = {
  '4px': 'Tight',
  '8px': 'Default',
  '14px': 'Rounded',
  '22px': 'Pill',
}

const fontChoices = {
  'Inter, ui-sans-serif, system-ui, sans-serif': 'System',
  'Georgia, serif': 'Editorial',
  'SFMono-Regular, Consolas, monospace': 'Mono',
}

export function App() {
  const { style, setStyle, resolved, setTheme } = useTheme()
  const [accent, setAccent] = useState('#2563eb')
  const [radius, setRadius] = useState('8px')
  const [font, setFont] = useState('Inter, ui-sans-serif, system-ui, sans-serif')
  const [compact, setCompact] = useState(false)

  const cssVariables = useMemo(() => `:root {
  --accent: ${accent};
  --teal: ${accent};
  --radius: ${radius};
  --radius-sm: ${radius === '4px' ? '3px' : radius === '8px' ? '6px' : radius === '14px' ? '10px' : '999px'};
  --font-sans: ${font};
  --theme-control-height: ${compact ? '34px' : '42px'};
}`, [accent, compact, font, radius])

  const setString = (setter: (value: string) => void) => (value: unknown) => {
    if (typeof value === 'string') setter(value)
  }

  const copyVariables = () => {
    void navigator.clipboard?.writeText(cssVariables)
  }

  return (
    <main className="customization-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Theme customization example</p>
          <h1>Customize Base Themes tokens from the package surface.</h1>
          <p className="hero-copy">
            This React 18 Vite app imports package CSS once, then overrides semantic tokens for brand color, radius, font, and density.
          </p>
        </div>
        <div className="hero-actions" aria-label="Theme controls">
          <Select id="base-style" label="Starting style" value={style} onValueChange={(value) => setStyle(value as ThemeStyle)} items={styleChoices} />
          <Switch id="color-mode" label="Dark mode" checked={resolved === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
        </div>
      </section>

      <section className="customization-grid">
        <Fieldset legend="Token controls">
          <Select id="accent" label="Primary color" value={accent} onValueChange={setString(setAccent)} items={accentChoices} />
          <Select id="radius" label="Radius" value={radius} onValueChange={setString(setRadius)} items={radiusChoices} />
          <Select id="font" label="Font" value={font} onValueChange={setString(setFont)} items={fontChoices} />
          <Switch id="density" label="Compact controls" checked={compact} onCheckedChange={setCompact} />
          <Button type="button" onClick={copyVariables}>Copy CSS variables</Button>
        </Fieldset>

        <section className="preview-panel" style={{ '--accent': accent, '--teal': accent, '--radius': radius, '--radius-sm': radius, '--font-sans': font, '--theme-control-height': compact ? '34px' : '42px' } as CSSProperties}>
          <div className="preview-header">
            <div>
              <p className="eyebrow">Live preview</p>
              <h2>Brand workspace</h2>
            </div>
            <Button variant="accent">Publish</Button>
          </div>
          <div className="form-grid">
            <Field label="Workspace" description="This input uses the overridden theme tokens.">
              <Input id="workspace" defaultValue="Launch Studio" />
            </Field>
            <Select id="status" label="Release track" defaultValue="beta" items={{ alpha: 'Alpha', beta: 'Beta', stable: 'Stable' }} />
          </div>
          <Tabs
            defaultValue="tokens"
            panels={[
              {
                value: 'tokens',
                label: 'Tokens',
                title: 'Semantic overrides',
                content: `Accent ${accent}, radius ${radius}, and ${compact ? 'compact' : 'comfortable'} control density are active.`,
              },
              {
                value: 'registry',
                label: 'Registry',
                title: `${registry.style.variants.length} shipped visual styles`,
                content: `Current registry default is ${registry.style.default}; this example still uses public registry metadata.`,
              },
            ]}
          />
          <Progress value={compact ? 84 : 68} showValue aria-label="Customization coverage" />
        </section>
      </section>

      <section className="code-panel" aria-label="Generated CSS variables">
        <div>
          <p className="eyebrow">Copy into your app</p>
          <h2>Generated token override</h2>
        </div>
        <pre><code>{cssVariables}</code></pre>
      </section>
    </main>
  )
}

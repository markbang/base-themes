import { useMemo } from 'react'
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

const densityOptions = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
}

export function App() {
  const { style, setStyle, resolved, setTheme } = useTheme()
  const componentCount = useMemo(() => registry.components.length, [])
  const blockCount = useMemo(() => registry.blocks.length, [])

  return (
    <main className="example-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Fresh Vite install</p>
          <h1>Base Themes works from the public package surface.</h1>
          <p className="hero-copy">
            This app imports components, CSS, theme state, and registry metadata from the same package a user installs from npm.
          </p>
        </div>
        <div className="hero-actions">
          <Button onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}>
            Toggle {resolved === 'dark' ? 'light' : 'dark'}
          </Button>
          <Select
            id="style"
            label="Visual style"
            value={style}
            onValueChange={(value) => setStyle(value as ThemeStyle)}
            items={Object.fromEntries(registry.style.variants.map((variant) => [variant, variant]))}
          />
        </div>
      </section>

      <section className="metrics-grid" aria-label="Package metadata">
        <article>
          <span>{componentCount}</span>
          <p>Registry components</p>
        </article>
        <article>
          <span>{registry.style.variants.length}</span>
          <p>Theme styles</p>
        </article>
        <article>
          <span>{blockCount}</span>
          <p>Starter blocks</p>
        </article>
      </section>

      <section className="workspace-grid">
        <Fieldset legend="Settings form">
          <Field label="Workspace name" description="Uses Base Themes Field and Input wrappers.">
            <Input id="workspace-name" defaultValue="Product Operations" />
          </Field>
          <Select id="density" label="Density" defaultValue="comfortable" items={densityOptions} />
          <Switch label="Weekly summary" defaultChecked />
          <Button type="button">Save settings</Button>
        </Fieldset>

        <div className="status-panel">
          <Tabs
            defaultValue="overview"
            panels={[
              {
                value: 'overview',
                label: 'Overview',
                title: 'Package surface',
                content: 'Public imports are resolving correctly, including components, theme CSS, and registry JSON.',
              },
              {
                value: 'registry',
                label: 'Registry',
                title: `Default style: ${registry.style.default}`,
                content: `First component in registry: ${registry.components[0]?.title ?? 'none'}.`,
              },
            ]}
          />
          <div className="tab-content">
            <Progress value={72} showValue aria-label="Adoption readiness" />
          </div>
        </div>
      </section>
    </main>
  )
}

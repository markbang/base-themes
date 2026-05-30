import {
  Button,
  DataTableBlock,
  DashboardShell,
  Progress,
  Select,
  Switch,
  Tabs,
  TeamActivityFeed,
  ThemeShowcaseCard,
  type ThemeStyle,
  useTheme,
} from 'base-themes'
import registry from 'base-themes/registry.json'

const styleChoices = {
  enterprise: 'Enterprise',
  'data-dense': 'Data dense',
  bento: 'Bento',
  terminal: 'Terminal',
  shadcn: 'shadcn',
}

const pipelineRows = [
  { label: 'Trial installs', value: 243, delta: '+18%' },
  { label: 'Doctor checks', value: 41, delta: '+9%' },
  { label: 'Registry fetches', value: 67, delta: '+24%' },
]

export function App() {
  const { style, setStyle, resolved, setTheme } = useTheme()

  return (
    <main className="dashboard-shell-example">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Product dashboard example</p>
          <h1>Operate a Base Themes product screen from the npm package.</h1>
          <p className="hero-copy">
            This example combines shipped blocks, controls, registry metadata, and theme switching into one app-like surface.
          </p>
        </div>
        <div className="hero-controls" aria-label="Dashboard controls">
          <Select
            id="dashboard-style"
            label="Visual style"
            value={style}
            onValueChange={(value) => setStyle(value as ThemeStyle)}
            items={styleChoices}
          />
          <Switch
            id="dashboard-theme"
            label="Dark mode"
            checked={resolved === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
          <Button type="button">Share report</Button>
        </div>
      </section>

      <section className="dashboard-kpis" aria-label="Adoption pipeline">
        {pipelineRows.map((row) => (
          <article key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <small>{row.delta}</small>
          </article>
        ))}
        <article>
          <span>Registry surface</span>
          <strong>{registry.components.length}</strong>
          <small>{registry.blocks.length} blocks</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-primary">
          <DashboardShell />
        </div>
        <div className="dashboard-secondary">
          <ThemeShowcaseCard />
        </div>
      </section>

      <section className="dashboard-grid lower">
        <div className="dashboard-primary">
          <DataTableBlock />
        </div>
        <aside className="dashboard-side-panel">
          <Tabs
            defaultValue="release"
            panels={[
              {
                value: 'release',
                label: 'Release',
                title: 'Release readiness',
                content: 'Registry, package smoke, SEO, and example builds are expected to pass before sharing a release.',
              },
              {
                value: 'signals',
                label: 'Signals',
                title: 'Adoption signals',
                content: 'Stars, forks, external issues, registry access, and install-copy events decide the next roadmap.',
              },
            ]}
          />
          <div className="readiness-stack">
            <Progress value={78} showValue aria-label="Release confidence" />
            <TeamActivityFeed />
          </div>
        </aside>
      </section>
    </main>
  )
}

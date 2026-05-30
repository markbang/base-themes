import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import './Blocks.css'

const panels = [
  { value: 'tokens', label: 'Tokens', title: 'CSS variable contract', content: 'Theme styles use shared semantic tokens for surfaces, text, focus, and controls.' },
  { value: 'registry', label: 'Registry', title: 'Copy-ready metadata', content: 'Components and blocks can be resolved from registry metadata for agent workflows.' },
]

export function ThemeShowcaseCard() {
  return (
    <section className="base-block" aria-label="Theme showcase block">
      <div className="base-block-header">
        <div>
          <h2 className="base-block-title">Theme Showcase</h2>
          <p className="base-block-copy">A compact block for explaining theme value on landing or docs pages.</p>
        </div>
        <span className="base-block-pill">20 styles</span>
      </div>
      <div className="base-block-grid" aria-label="Theme swatches">
        {['--bt-bg', '--bt-surface', '--bt-primary', '--bt-secondary'].map((token) => (
          <div className="base-block-stat" key={token}>
            <span className="base-block-muted">{token}</span>
            <span style={{ display: 'block', height: 24, marginTop: 8, border: '1px solid var(--bt-border)', borderRadius: 'var(--bt-radius-sm)', background: `var(${token})` }} />
          </div>
        ))}
      </div>
      <Tabs panels={panels} defaultValue="tokens" />
      <Button type="button">Open themes</Button>
    </section>
  )
}

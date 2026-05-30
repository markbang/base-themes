import { Button } from '../components/ui/Button'
import { Combobox } from '../components/ui/Combobox'
import './Blocks.css'

const commands = [
  { value: 'create-theme', label: 'Create theme' },
  { value: 'open-registry', label: 'Open registry' },
  { value: 'view-components', label: 'View components' },
]

export function CommandPaletteBlock() {
  return (
    <section className="base-block" aria-label="Command palette block">
      <div>
        <h2 className="base-block-title">Command Palette</h2>
        <p className="base-block-copy">A quick-action panel for product navigation, search, and agent-oriented commands.</p>
      </div>
      <Combobox label="Jump to" placeholder="Search commands..." options={commands} />
      <div className="base-block-list">
        {commands.map((command) => (
          <div className="base-block-list-item" key={command.value}>
            <div className="base-block-list-main">
              <strong>{command.label}</strong>
              <span>{command.value}</span>
            </div>
            <Button type="button" variant="ghost">Run</Button>
          </div>
        ))}
      </div>
    </section>
  )
}

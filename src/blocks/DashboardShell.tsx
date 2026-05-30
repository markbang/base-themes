import { Button } from '../components/ui/Button'
import { Meter } from '../components/ui/Meter'
import { Progress } from '../components/ui/Progress'
import './Blocks.css'

const stats = [
  { label: 'Revenue', value: '$48.2k' },
  { label: 'Active seats', value: '1,248' },
  { label: 'Deploys', value: '36' },
]

export function DashboardShell() {
  return (
    <section className="base-block" aria-label="Dashboard shell block">
      <div className="base-block-header">
        <div>
          <h2 className="base-block-title">Operations Dashboard</h2>
          <p className="base-block-copy">A compact dashboard header with metrics, progress, and a primary action.</p>
        </div>
        <Button variant="outline">Export</Button>
      </div>
      <div className="base-block-grid">
        {stats.map((stat) => (
          <div className="base-block-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="base-block-panel">
        <Progress value={72} showValue aria-label="Quarterly target" />
      </div>
      <Meter value={84} showValue aria-label="System health" />
    </section>
  )
}

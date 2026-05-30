import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import './Blocks.css'

const statusItems = {
  all: 'All statuses',
  active: 'Active',
  pending: 'Pending',
}

const rows = [
  { project: 'Checkout refresh', owner: 'Ava', status: 'Active' },
  { project: 'Theme QA', owner: 'Mina', status: 'Pending' },
  { project: 'Registry docs', owner: 'Noah', status: 'Active' },
]

export function DataTableBlock() {
  return (
    <section className="base-block" aria-label="Data table block">
      <div className="base-block-header">
        <div>
          <h2 className="base-block-title">Projects</h2>
          <p className="base-block-copy">A small operational table with filters and row status badges.</p>
        </div>
        <Select id="block-project-status" defaultValue="all" items={statusItems} />
      </div>
      <table className="base-block-table">
        <thead>
          <tr><th>Project</th><th>Owner</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.project}>
              <td>{row.project}</td>
              <td>{row.owner}</td>
              <td><span className="base-block-pill">{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="button" variant="outline">View all projects</Button>
    </section>
  )
}

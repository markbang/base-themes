import { Avatar, AvatarGroup } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import './Blocks.css'

const activity = [
  { title: 'Published enterprise theme', meta: 'Mina, 12m ago' },
  { title: 'Reviewed registry copy plan', meta: 'Ava, 34m ago' },
  { title: 'Updated dashboard block', meta: 'Noah, 1h ago' },
]

export function TeamActivityFeed() {
  return (
    <section className="base-block" aria-label="Team activity feed block">
      <div className="base-block-header">
        <div>
          <h2 className="base-block-title">Team Activity</h2>
          <p className="base-block-copy">A feed block for recent workspace changes and collaboration status.</p>
        </div>
        <AvatarGroup>
          <Avatar fallback="AV" size="sm" />
          <Avatar fallback="MN" size="sm" />
          <Avatar fallback="NH" size="sm" />
        </AvatarGroup>
      </div>
      <div className="base-block-list">
        {activity.map((item) => (
          <div className="base-block-list-item" key={item.title}>
            <div className="base-block-list-main">
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline">Open activity</Button>
    </section>
  )
}

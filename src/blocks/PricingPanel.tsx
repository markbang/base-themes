import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Checkbox'
import './Blocks.css'

const features = ['Unlimited themes', 'Registry metadata', 'Agent workflow docs']

export function PricingPanel() {
  return (
    <section className="base-block" aria-label="Pricing panel block">
      <div className="base-block-split">
        <div>
          <h2 className="base-block-title">Team plan</h2>
          <p className="base-block-copy">A compact pricing panel for SaaS settings, upgrade, or billing screens.</p>
        </div>
        <div className="base-block-price">$29<span>/seat</span></div>
      </div>
      <div className="base-block-list">
        {features.map((feature) => (
          <div className="base-block-list-item" key={feature}>
            <Checkbox defaultChecked aria-label={feature} />
            <div className="base-block-list-main"><strong>{feature}</strong></div>
          </div>
        ))}
      </div>
      <Button type="button">Upgrade plan</Button>
    </section>
  )
}

import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Fieldset } from '../components/ui/Fieldset'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Switch } from '../components/ui/Switch'
import './Blocks.css'

const densityItems = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
}

export function SettingsForm() {
  return (
    <section className="base-block" aria-label="Settings form block">
      <div>
        <h2 className="base-block-title">Workspace Settings</h2>
        <p className="base-block-copy">A production-style settings form for team preferences and workspace defaults.</p>
      </div>
      <Fieldset legend="Workspace">
        <div className="base-block-form">
          <Field label="Workspace name" description="Visible to invited team members.">
            <Input id="block-workspace-name" defaultValue="Product Operations" />
          </Field>
          <Select id="block-density" label="Interface density" defaultValue="comfortable" items={densityItems} />
          <Switch id="block-weekly-summary" defaultChecked label="Send weekly summary" />
          <div className="base-block-actions">
            <Button type="button">Save settings</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </div>
      </Fieldset>
    </section>
  )
}

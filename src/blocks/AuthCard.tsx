import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Input } from '../components/ui/Input'
import { Separator } from '../components/ui/Separator'
import { Switch } from '../components/ui/Switch'
import './Blocks.css'

export function AuthCard() {
  return (
    <section className="base-block" aria-label="Authentication card block">
      <div>
        <h2 className="base-block-title">Sign in to workspace</h2>
        <p className="base-block-copy">A focused authentication card with remembered-device controls.</p>
      </div>
      <div className="base-block-form">
        <Field label="Email">
          <Input id="block-auth-email" type="email" placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input id="block-auth-password" type="password" placeholder="Enter password" />
        </Field>
        <Switch id="block-auth-remember" label="Remember this device" />
        <Button type="button">Continue</Button>
        <Separator />
        <Button type="button" variant="outline">Continue with SSO</Button>
      </div>
    </section>
  )
}

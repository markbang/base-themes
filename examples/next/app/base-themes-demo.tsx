'use client'

import { Button, Field, Fieldset, Input, Progress, Select, Switch, Tabs } from 'base-themes'
import registry from 'base-themes/registry.json'

const densityItems = {
  compact: 'Compact',
  comfortable: 'Comfortable',
  spacious: 'Spacious',
}

export function BaseThemesDemo() {
  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Next.js App Router install</p>
          <h1>Base Themes works in a framework app.</h1>
          <p>
            This page imports package components, global CSS, and registry metadata with a client component boundary.
          </p>
        </div>
        <div className="stats-grid" aria-label="Registry summary">
          <article>
            <span>{registry.components.length}</span>
            <p>Components</p>
          </article>
          <article>
            <span>{registry.style.variants.length}</span>
            <p>Styles</p>
          </article>
        </div>
      </section>

      <section className="content-grid">
        <Fieldset legend="Workspace settings">
          <Field label="Project" description="Client-rendered controls inside a server-rendered route.">
            <Input id="project" defaultValue="Design System Migration" />
          </Field>
          <Select id="density" label="Density" defaultValue="comfortable" items={densityItems} />
          <Switch id="summary" label="Send weekly summary" defaultChecked />
          <Button type="button">Save changes</Button>
        </Fieldset>

        <div className="panel">
          <Tabs
            defaultValue="package"
            panels={[
              {
                value: 'package',
                label: 'Package',
                title: 'Public package surface',
                content: 'Components and CSS are imported from the same paths documented for npm users.',
              },
              {
                value: 'registry',
                label: 'Registry',
                title: `Default style: ${registry.style.default}`,
                content: `Registry homepage: ${registry.homepage}`,
              },
            ]}
          />
          <div className="progress-row">
            <Progress value={78} showValue aria-label="Framework readiness" />
          </div>
        </div>
      </section>
    </>
  )
}

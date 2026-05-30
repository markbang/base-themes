import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { Input } from './Input'
import { Select } from './Select'
import { Switch } from './Switch'
import { Tabs } from './Tabs'

expect.extend(toHaveNoViolations)

describe('accessibility regressions', () => {
  it('has no axe violations for common form controls', async () => {
    const { container } = render(
      <main>
        <Button>Save changes</Button>
        <Button variant="outline">Cancel</Button>
        <Input id="workspace" label="Workspace" placeholder="Acme" />
        <Select
          id="density"
          label="Density"
          defaultValue="comfortable"
          items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
        />
        <Switch id="notifications" label="Notifications" />
      </main>,
    )

    await expect(axe(container)).resolves.toHaveNoViolations()
  })

  it('has no axe violations for dialog content after opening', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dialog
        trigger={<Button>Open dialog</Button>}
        title="Invite teammate"
        description="Send an invitation to join this workspace."
      >
        <Input id="email" label="Email" placeholder="teammate@example.com" />
        <Button>Send invite</Button>
      </Dialog>,
    )

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))

    expect(screen.getByRole('dialog', { name: 'Invite teammate' })).toBeInTheDocument()
    await expect(axe(container)).resolves.toHaveNoViolations()
  })

  it('has no axe violations for tabs and selected panel state', async () => {
    const { container } = render(
      <Tabs
        defaultValue="usage"
        panels={[
          { value: 'usage', label: 'Usage', title: 'Usage guide', content: 'Install and render the component.' },
          { value: 'states', label: 'States', title: 'State coverage', content: 'Review variants and interaction states.' },
        ]}
      />,
    )

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Usage')
    await expect(axe(container)).resolves.toHaveNoViolations()
  })
})

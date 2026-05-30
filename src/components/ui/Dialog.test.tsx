import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('opens from the trigger and closes from the close button', async () => {
    const user = userEvent.setup()
    render(
      <Dialog
        trigger={<Button>Open dialog</Button>}
        title="Invite teammate"
        description="Send an invitation to join this workspace."
      >
        <Button>Send invite</Button>
      </Dialog>,
    )

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    expect(screen.getByRole('dialog', { name: 'Invite teammate' })).toBeInTheDocument()
    expect(screen.getByText('Send an invitation to join this workspace.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Invite teammate' })).not.toBeInTheDocument()
    })
  })
})

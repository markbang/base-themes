import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Select } from './Select'

describe('Select', () => {
  it('opens the listbox and selects an option', async () => {
    const user = userEvent.setup()
    render(
      <Select
        id="density"
        label="Density"
        defaultValue="comfortable"
        items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Density' }))
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByRole('option', { name: 'Spacious' }))

    expect(screen.getByRole('combobox', { name: 'Density' })).toHaveTextContent('Spacious')
  })
})

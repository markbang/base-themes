import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders an accessible button with the base class and variant class', () => {
    render(<Button variant="accent">Save changes</Button>)

    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toHaveClass('bento-button')
    expect(button).toHaveClass('accent')
  })
})

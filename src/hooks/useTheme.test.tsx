import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTheme } from './useTheme'

function ThemeHarness() {
  const { resolved, setTheme, setStyle, style } = useTheme()

  return (
    <div>
      <span data-testid="theme-state">{resolved}</span>
      <span data-testid="style-state">{style}</span>
      <button type="button" onClick={() => setTheme('dark')}>Dark mode</button>
      <button type="button" onClick={() => setStyle('terminal')}>Terminal style</button>
    </div>
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-style')
  })

  it('applies theme and style attributes and persists choices', async () => {
    const user = userEvent.setup()
    render(<ThemeHarness />)

    expect(screen.getByTestId('theme-state')).toHaveTextContent('light')
    expect(document.documentElement).toHaveAttribute('data-style', 'bento')

    await user.click(screen.getByRole('button', { name: 'Dark mode' }))
    await user.click(screen.getByRole('button', { name: 'Terminal style' }))

    expect(screen.getByTestId('theme-state')).toHaveTextContent('dark')
    expect(screen.getByTestId('style-state')).toHaveTextContent('terminal')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement).toHaveAttribute('data-style', 'terminal')
    expect(localStorage.getItem('bento-theme')).toBe('dark')
    expect(localStorage.getItem('bento-style')).toBe('terminal')
  })
})

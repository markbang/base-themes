import { useState, useCallback, useEffect } from 'react'
import { themeStyles, type ThemeStyle } from '../styles/themeList'

type Theme = 'light' | 'dark' | 'system'
const themeStyleSet = new Set<string>(themeStyles)

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const queryTheme = new URLSearchParams(window.location.search).get('theme')
  if (queryTheme === 'light' || queryTheme === 'dark' || queryTheme === 'system') return queryTheme
  const stored = localStorage.getItem('bento-theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function getStoredStyle(): ThemeStyle {
  if (typeof window === 'undefined') return 'bento'
  const queryStyle = new URLSearchParams(window.location.search).get('style')
  if (queryStyle && themeStyleSet.has(queryStyle)) return queryStyle as ThemeStyle
  const stored = localStorage.getItem('bento-style')
  if (stored && themeStyleSet.has(stored)) return stored as ThemeStyle
  return 'bento'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved)
}

function applyStyle(style: ThemeStyle) {
  document.documentElement.setAttribute('data-style', style)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [style, setStyleState] = useState<ThemeStyle>(getStoredStyle)

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('bento-theme', t)
    applyTheme(resolveTheme(t))
  }, [])

  const setStyle = useCallback((nextStyle: ThemeStyle) => {
    setStyleState(nextStyle)
    localStorage.setItem('bento-style', nextStyle)
    applyStyle(nextStyle)
  }, [])

  // Apply on mount and listen for system changes
  useEffect(() => {
    const resolved = resolveTheme(theme)
    applyTheme(resolved)
    applyStyle(style)

    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, style])

  return { theme, setTheme, resolved: resolveTheme(theme), style, setStyle }
}

export type { Theme, ThemeStyle }

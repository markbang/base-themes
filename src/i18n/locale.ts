import { createContext } from 'react'
import en from './en'
import zh from './zh'
import type { Translations } from './en'

export type Locale = 'en' | 'zh'

export const translations: Record<Locale, Translations> = { en, zh }

export const LocaleContext = createContext<{
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
} | null>(null)

export function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('bento-locale')
  if (stored === 'en' || stored === 'zh') return stored
  return 'en'
}

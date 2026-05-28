import { useContext } from 'react'
import { LocaleContext } from './locale'
import type { Translations } from './en'

export function useT(): Translations {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useT must be used within LocaleProvider')
  return ctx.t
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return { locale: ctx.locale, setLocale: ctx.setLocale }
}

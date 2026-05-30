import themeMetaJson from './themeMeta.json'
import type { ThemeStyle } from '../styles/themeList'

export type ThemeMeta = {
  style: ThemeStyle
  label: string
  description: string
}

export const themeMeta = themeMetaJson as ThemeMeta[]

export const themeMetaByStyle = new Map(themeMeta.map((theme) => [theme.style, theme]))

export function getThemeMeta(style: ThemeStyle) {
  return themeMetaByStyle.get(style)
}

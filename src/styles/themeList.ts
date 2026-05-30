import themeMetaJson from '../docs/themeMeta.json'

export const themeStyles = [
  'bento',
  'shadcn',
  'neo-brutalism',
  'minimal',
  'enterprise',
  'linear',
  'glass',
  'terminal',
  'material',
  'fluent',
  'retro',
  'cyberpunk',
  'editorial',
  'calm',
  'data-dense',
  'playful',
  'luxury',
  'soft-ui',
  'bauhaus',
  'mono',
] as const

export type ThemeStyle = (typeof themeStyles)[number]

type ThemeMetaEntry = {
  style: ThemeStyle
  label: string
  description: string
}

const themeMeta = themeMetaJson as ThemeMetaEntry[]

export const themeStyleLabels = Object.fromEntries(themeMeta.map((theme) => [theme.style, theme.label])) as Record<ThemeStyle, string>

export const themeStyleDescriptions = Object.fromEntries(themeMeta.map((theme) => [theme.style, theme.description])) as Record<ThemeStyle, string>

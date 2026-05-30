import componentMeta from '../src/docs/componentMeta.json' with { type: 'json' }
import themeMeta from '../src/docs/themeMeta.json' with { type: 'json' }
import staticPageMeta from '../src/docs/staticPageMeta.json' with { type: 'json' }
import registry from '../registry/registry.json' with { type: 'json' }

export const siteUrl = process.env.SITE_URL ?? 'https://base-themes.bangwu.me'
export const docsRoot = '/components'

export const staticPages = staticPageMeta.map(({ id, type, image, keywords, ...page }) => page)

export function absoluteUrl(path, baseUrl = siteUrl) {
  return new URL(path, baseUrl).toString()
}

export function getComponentPages() {
  return componentMeta.map((component) => ({
    path: `${docsRoot}/${component.id}`,
    title: `${component.title} React Component — Base Themes`,
    description: `${component.summary} Includes interactive examples, API reference, keyboard interactions, and themeable Base UI styling.`,
    priority: '0.7',
  }))
}

export function getThemePages() {
  return themeMeta.map((theme) => ({
    path: `/themes/${theme.style}`,
    title: `${theme.label} React UI Theme — Base Themes`,
    description: `${theme.description} Preview the ${theme.label} visual style for typed Base UI React components, CSS tokens, and registry-ready product UI workflows.`,
    priority: '0.75',
  }))
}

export function getBlockPages() {
  return registry.blocks.map((block) => ({
    path: `/blocks/${block.name}`,
    title: `${block.title} React UI Block — Base Themes`,
    description: `${block.description} Copy the ${block.title} block from Base Themes with accessible Base UI components, CSS tokens, and registry metadata.`,
    priority: '0.65',
  }))
}

export function getSeoPages() {
  return [...staticPages, ...getComponentPages(), ...getThemePages(), ...getBlockPages()]
}

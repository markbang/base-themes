import staticPageMetaJson from './staticPageMeta.json'

export type StaticPageMeta = {
  id: string
  path: string
  title: string
  description: string
  priority: string
  type?: 'website' | 'article'
  image?: string
  keywords?: string[]
}

export const staticPageMeta = staticPageMetaJson as StaticPageMeta[]

export const staticPageMetaById = new Map(staticPageMeta.map((page) => [page.id, page]))

export function getStaticPageMeta(id: string) {
  return staticPageMetaById.get(id)
}

export const docsRoot = '/components'
export const routeChangeEvent = 'bento-route-change'

export function navigateTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event(routeChangeEvent))
}

export function toComponentPath(id: string) {
  return `${docsRoot}/${id}`
}

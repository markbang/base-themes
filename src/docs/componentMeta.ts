import componentMetaJson from './componentMeta.json'

export type ComponentGroup = 'Inputs' | 'Disclosure' | 'Navigation' | 'Feedback'

export type ComponentMeta = {
  id: string
  registryName: string
  title: string
  group: ComponentGroup
  summary: string
  exportName: string
}

export const componentMeta = componentMetaJson as ComponentMeta[]

export const componentMetaById = new Map(componentMeta.map((component) => [component.id, component]))

export function getComponentMeta(id: string) {
  return componentMetaById.get(id)
}

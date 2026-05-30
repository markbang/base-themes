import blockMetaJson from './blockMeta.json'

export type BlockMeta = {
  id: string
  registryName: string
  title: string
  category: string
  description: string
  exportName: string
}

export const blockMeta = blockMetaJson as BlockMeta[]

export const blockMetaById = new Map(blockMeta.map((block) => [block.id, block]))

export function getBlockMeta(id: string) {
  return blockMetaById.get(id)
}

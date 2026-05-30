import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'

const root = process.cwd()
const registryPath = join(root, 'registry/registry.json')
const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
const componentMetaPath = join(root, 'src/docs/componentMeta.json')
const componentMeta = JSON.parse(readFileSync(componentMetaPath, 'utf8'))
const blockMetaPath = join(root, 'src/docs/blockMeta.json')
const blockMeta = JSON.parse(readFileSync(blockMetaPath, 'utf8'))
const themeMetaPath = join(root, 'src/docs/themeMeta.json')
const themeMeta = JSON.parse(readFileSync(themeMetaPath, 'utf8'))
const staticPageMetaPath = join(root, 'src/docs/staticPageMeta.json')
const staticPageMeta = JSON.parse(readFileSync(staticPageMetaPath, 'utf8'))
const standardCatalogPath = join(root, 'registry/shadcn-registry.json')
const standardItemsDir = join(root, 'registry/items')
const standardCatalog = existsSync(standardCatalogPath) ? JSON.parse(readFileSync(standardCatalogPath, 'utf8')) : undefined
const standardItemFiles = existsSync(standardItemsDir) ? readdirSync(standardItemsDir).filter((file) => file.endsWith('.json')).sort() : []
const standardItems = standardItemFiles.map((file) => JSON.parse(readFileSync(join(standardItemsDir, file), 'utf8')))

const requiredComponents = [
  'accordion', 'alert-dialog', 'autocomplete', 'avatar', 'button', 'checkbox', 'checkbox-group',
  'collapsible', 'combobox', 'context-menu', 'csp-provider', 'dialog', 'direction-provider', 'drawer', 'field', 'fieldset', 'form',
  'input', 'menu', 'menubar', 'meter', 'navigation-menu', 'number-field', 'otp-field', 'popover',
  'preview-card', 'progress', 'radio', 'radio-group', 'scroll-area', 'select', 'separator', 'slider',
  'switch', 'tabs', 'toast', 'toggle', 'toggle-group', 'toolbar', 'tooltip',
]

const names = new Set(registry.components.map((component) => component.name))
const missingComponents = requiredComponents.filter((name) => !names.has(name))
const extraComponents = [...names].filter((name) => !requiredComponents.includes(name))
const duplicateComponents = registry.components
  .map((component) => component.name)
  .filter((name, index, all) => all.indexOf(name) !== index)

const metaIds = new Set(componentMeta.map((component) => component.id))
const metaRegistryNames = new Set(componentMeta.map((component) => component.registryName))
const duplicateMetaIds = componentMeta
  .map((component) => component.id)
  .filter((id, index, all) => all.indexOf(id) !== index)
const duplicateMetaRegistryNames = componentMeta
  .map((component) => component.registryName)
  .filter((name, index, all) => all.indexOf(name) !== index)
const missingMetaForRegistry = [...names].filter((name) => !metaRegistryNames.has(name))
const missingRegistryForMeta = [...metaRegistryNames].filter((name) => !names.has(name))
const invalidMeta = componentMeta.filter((component) => (
  !component.id ||
  !component.registryName ||
  !component.title ||
  !component.summary ||
  !component.exportName ||
  !['Inputs', 'Disclosure', 'Navigation', 'Feedback'].includes(component.group)
))
const componentExportSource = readFileSync(join(root, 'src/components/ui/index.ts'), 'utf8')
const componentExportNames = new Set()
for (const match of componentExportSource.matchAll(/^export \{([^}]+)\} from/gm)) {
  for (const rawName of match[1].split(',')) {
    const name = rawName.trim().split(/\s+as\s+/).pop()
    if (name) componentExportNames.add(name)
  }
}
const invalidComponentExportNames = componentMeta
  .filter((component) => !componentExportNames.has(component.exportName))
  .map((component) => `${component.registryName}: ${component.exportName}`)

const registryStyles = new Set(registry.style.variants)
const registryStyleFiles = registry.style.files ?? [registry.style.global, registry.style.tokens]
const themeMetaStyles = new Set(themeMeta.map((theme) => theme.style))
const themeListSource = readFileSync(join(root, 'src/styles/themeList.ts'), 'utf8')
const themeListStyles = [...themeListSource.matchAll(/'([^']+)'/g)]
  .map((match) => match[1])
  .filter((value) => themeMetaStyles.has(value))
const duplicateThemeStyles = themeMeta
  .map((theme) => theme.style)
  .filter((style, index, all) => all.indexOf(style) !== index)
const missingThemeMetaForRegistry = [...registryStyles].filter((style) => !themeMetaStyles.has(style))
const missingRegistryStyleForThemeMeta = [...themeMetaStyles].filter((style) => !registryStyles.has(style))
const themeListOrderMismatch = themeListStyles.join(',') !== themeMeta.map((theme) => theme.style).join(',')
const themeListDuplicatedLabels = themeMeta.some((theme) => themeListSource.includes(`${theme.style}: '${theme.label}'`) || themeListSource.includes(`${theme.style}: '${theme.description}'`))
const invalidThemeMeta = themeMeta.filter((theme) => (
  !theme.style ||
  !theme.label ||
  !theme.description ||
  typeof theme.label !== 'string' ||
  typeof theme.description !== 'string'
))

const missingFiles = []
const missingStyleFiles = registryStyleFiles.filter((file) => !existsSync(join(root, file)))
const missingRequiredStyleFiles = [registry.style.global, registry.style.tokens].filter((file) => !registryStyleFiles.includes(file))
for (const component of registry.components) {
  for (const file of component.files) {
    if (!existsSync(join(root, file))) {
      missingFiles.push(`${component.name}: ${file}`)
    }
  }
}

const sourceCopyDependencyProblems = []
const sourceImportPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css']

function resolveRelativeSourceImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) return undefined
  const basePath = normalize(join(dirname(fromFile), specifier))
  for (const extension of sourceExtensions) {
    const candidate = `${basePath}${extension}`
    if (existsSync(join(root, candidate))) return candidate
  }
  for (const extension of sourceExtensions) {
    const candidate = join(basePath, `index${extension}`)
    if (existsSync(join(root, candidate))) return candidate
  }
  return undefined
}

function collectRelativeSourceImports(files) {
  const imports = []
  for (const file of files.filter((entry) => /\.[jt]sx?$/.test(entry))) {
    if (!existsSync(join(root, file))) continue
    const source = readFileSync(join(root, file), 'utf8')
    for (const match of source.matchAll(sourceImportPattern)) {
      const resolved = resolveRelativeSourceImport(file, match[1])
      if (resolved) imports.push({ file, specifier: match[1], resolved })
    }
  }
  return imports
}

for (const component of registry.components) {
  const componentFiles = new Set(component.files)
  for (const sourceImport of collectRelativeSourceImports(component.files)) {
    if (!componentFiles.has(sourceImport.resolved)) {
      sourceCopyDependencyProblems.push(`${component.name}: ${sourceImport.file} imports ${sourceImport.specifier}; add ${sourceImport.resolved} to component files`)
    }
  }
}
for (const sourceImport of collectRelativeSourceImports(registryStyleFiles)) {
  if (!registryStyleFiles.includes(sourceImport.resolved)) {
    sourceCopyDependencyProblems.push(`registry.style.files: ${sourceImport.file} imports ${sourceImport.specifier}; add ${sourceImport.resolved} to style files`)
  }
}

const duplicateBlocks = registry.blocks
  .map((block) => block.name)
  .filter((name, index, all) => all.indexOf(name) !== index)
const invalidBlocks = registry.blocks.filter((block) => (
  !block.name ||
  !block.title ||
  !block.description ||
  !block.category ||
  !block.route ||
  !Array.isArray(block.components) ||
  block.components.length === 0 ||
  !Array.isArray(block.files) ||
  block.files.length === 0
))
const missingBlockComponentRefs = []
const missingBlockFiles = []
const invalidBlockRoutes = []
for (const block of registry.blocks) {
  if (block.route !== `/blocks/${block.name}`) {
    invalidBlockRoutes.push(`${block.name}: ${block.route}`)
  }
  for (const componentName of block.components ?? []) {
    if (!names.has(componentName)) {
      missingBlockComponentRefs.push(`${block.name}: ${componentName}`)
    }
  }
  for (const file of block.files ?? []) {
    if (!existsSync(join(root, file))) {
      missingBlockFiles.push(`${block.name}: ${file}`)
    }
  }

  const blockSourceCopyFiles = new Set([
    ...(block.files ?? []),
    ...(block.components ?? []).flatMap((componentName) => registry.components.find((component) => component.name === componentName)?.files ?? []),
  ])
  for (const sourceImport of collectRelativeSourceImports(block.files ?? [])) {
    if (!blockSourceCopyFiles.has(sourceImport.resolved)) {
      sourceCopyDependencyProblems.push(`${block.name}: ${sourceImport.file} imports ${sourceImport.specifier}; add ${sourceImport.resolved} to block files or component dependencies`)
    }
  }
}

const blockMetaNames = new Set(blockMeta.map((block) => block.registryName))
const duplicateBlockMetaIds = blockMeta
  .map((block) => block.id)
  .filter((id, index, all) => all.indexOf(id) !== index)
const duplicateBlockMetaRegistryNames = blockMeta
  .map((block) => block.registryName)
  .filter((name, index, all) => all.indexOf(name) !== index)
const missingBlockMetaForRegistry = registry.blocks.map((block) => block.name).filter((name) => !blockMetaNames.has(name))
const missingRegistryBlockForMeta = [...blockMetaNames].filter((name) => !registry.blocks.some((block) => block.name === name))
const invalidBlockMeta = blockMeta.filter((block) => (
  !block.id ||
  !block.registryName ||
  !block.title ||
  !block.category ||
  !block.description ||
  !block.exportName
))
const blockMetaOrderMismatch = blockMeta.map((block) => block.registryName).join(',') !== registry.blocks.map((block) => block.name).join(',')
const blockMetaDrift = []
for (const block of registry.blocks) {
  const meta = blockMeta.find((item) => item.registryName === block.name)
  if (!meta) continue
  if (meta.id !== block.name) blockMetaDrift.push(`${block.name}: id should be ${block.name}`)
  if (meta.title !== block.title) blockMetaDrift.push(`${block.name}: title mismatch`)
  if (meta.category !== block.category) blockMetaDrift.push(`${block.name}: category mismatch`)
  if (meta.description !== block.description) blockMetaDrift.push(`${block.name}: description mismatch`)
}
const appSource = readFileSync(join(root, 'src/App.tsx'), 'utf8')
const appHasBlockDemoData = appSource.includes('const blockDemos = [')

const requiredPages = staticPageMeta.map((page) => page.path).filter((route) => route !== '/')
const pageRoutes = new Set(registry.pages.map((page) => page.route))
const missingPages = requiredPages.filter((route) => !pageRoutes.has(route))
const registryPagesMissingStaticMeta = [...pageRoutes].filter((route) => route !== '/components/button' && !requiredPages.includes(route))

const componentDocsSource = readFileSync(join(root, 'src/docs/ComponentDocsPage.tsx'), 'utf8')
const componentDocIds = [...componentDocsSource.matchAll(/id: '([^']+)'/g)].map((match) => match[1])
const missingComponentDocsForMeta = [...metaIds].filter((id) => !componentDocIds.includes(id))
const missingMetaForComponentDocs = componentDocIds.filter((id) => !metaIds.has(id))

const expectedStandardItemCount = registry.components.length + registry.blocks.length + themeMeta.length
const standardCatalogProblems = []
if (!standardCatalog) {
  standardCatalogProblems.push('registry/shadcn-registry.json is missing')
} else {
  if (standardCatalog.$schema !== 'https://ui.shadcn.com/schema/registry.json') standardCatalogProblems.push('catalog schema is invalid')
  if (standardCatalog.name !== 'base-themes') standardCatalogProblems.push('catalog name must be base-themes')
  if (!Array.isArray(standardCatalog.items) || standardCatalog.items.length !== expectedStandardItemCount) standardCatalogProblems.push(`catalog item count should be ${expectedStandardItemCount}`)
}

const standardItemProblems = []
if (standardItemFiles.length !== expectedStandardItemCount) {
  standardItemProblems.push(`registry/items should contain ${expectedStandardItemCount} item files, found ${standardItemFiles.length}`)
}

const standardItemNames = new Set(standardItems.map((item) => item.name))
for (const component of registry.components) {
  if (!standardItemNames.has(component.name)) standardItemProblems.push(`missing component item: ${component.name}`)
}
for (const block of registry.blocks) {
  if (!standardItemNames.has(`block-${block.name}`)) standardItemProblems.push(`missing block item: block-${block.name}`)
}
for (const theme of themeMeta) {
  if (!standardItemNames.has(`theme-${theme.style}`)) standardItemProblems.push(`missing theme item: theme-${theme.style}`)
}

for (const item of standardItems) {
  if (item.$schema !== 'https://ui.shadcn.com/schema/registry-item.json') standardItemProblems.push(`${item.name}: invalid item schema`)
  if (!['registry:ui', 'registry:block', 'registry:theme'].includes(item.type)) standardItemProblems.push(`${item.name}: invalid item type ${item.type}`)
  if (!item.title || !item.description) standardItemProblems.push(`${item.name}: missing title or description`)
  if (!item.meta?.agent?.summary || !Array.isArray(item.meta?.agent?.installPlan)) standardItemProblems.push(`${item.name}: missing meta.agent summary or installPlan`)
  if (!Array.isArray(item.meta?.agent?.packageInstall) || item.meta.agent.packageInstall.length === 0) standardItemProblems.push(`${item.name}: missing meta.agent packageInstall steps`)
  if (!Array.isArray(item.meta?.agent?.sourceCopy) || item.meta.agent.sourceCopy.length === 0) standardItemProblems.push(`${item.name}: missing meta.agent sourceCopy steps`)
  if (!Array.isArray(item.meta?.agent?.verify) && item.type !== 'registry:theme') standardItemProblems.push(`${item.name}: missing meta.agent verify steps`)
  if (item.type === 'registry:ui') {
    const meta = componentMeta.find((component) => component.registryName === item.name)
    if (meta && !item.meta?.agent?.packageInstall?.includes(`import { ${meta.exportName} } from 'base-themes'`)) {
      standardItemProblems.push(`${item.name}: packageInstall must import exported component ${meta.exportName}`)
    }
  }
  if (item.type === 'registry:block') {
    const blockName = item.name.replace(/^block-/, '')
    const block = registry.blocks.find((entry) => entry.name === blockName)
    const registryItems = item.meta?.agent?.registryItems
    if (!Array.isArray(registryItems) || !registryItems.includes(`/registry/items/${item.name}.json`)) standardItemProblems.push(`${item.name}: missing block registryItems self URL`)
    for (const componentName of block?.components ?? []) {
      if (!registryItems?.includes(`/registry/items/${componentName}.json`)) standardItemProblems.push(`${item.name}: missing registryItems dependency /registry/items/${componentName}.json`)
    }
  }
  if (!Array.isArray(item.files) || item.files.length === 0) standardItemProblems.push(`${item.name}: missing files`)
  for (const file of item.files ?? []) {
    if (!file.path || !file.type || !file.target) standardItemProblems.push(`${item.name}: malformed file entry`)
    if (file.path && !existsSync(join(root, file.path))) standardItemProblems.push(`${item.name}: missing source file ${file.path}`)
  }
}

if (
  missingComponents.length ||
  extraComponents.length ||
  duplicateComponents.length ||
  missingFiles.length ||
  missingStyleFiles.length ||
  missingRequiredStyleFiles.length ||
  missingPages.length ||
  registryPagesMissingStaticMeta.length ||
  duplicateMetaIds.length ||
  duplicateMetaRegistryNames.length ||
  missingMetaForRegistry.length ||
  missingRegistryForMeta.length ||
  invalidMeta.length ||
  invalidComponentExportNames.length ||
  duplicateThemeStyles.length ||
  missingThemeMetaForRegistry.length ||
  missingRegistryStyleForThemeMeta.length ||
  themeListOrderMismatch ||
  themeListDuplicatedLabels ||
  invalidThemeMeta.length ||
  duplicateBlocks.length ||
  invalidBlocks.length ||
  missingBlockComponentRefs.length ||
  missingBlockFiles.length ||
  sourceCopyDependencyProblems.length ||
  invalidBlockRoutes.length ||
  duplicateBlockMetaIds.length ||
  duplicateBlockMetaRegistryNames.length ||
  missingBlockMetaForRegistry.length ||
  missingRegistryBlockForMeta.length ||
  invalidBlockMeta.length ||
  blockMetaOrderMismatch ||
  blockMetaDrift.length ||
  appHasBlockDemoData ||
  missingComponentDocsForMeta.length ||
  missingMetaForComponentDocs.length ||
  standardCatalogProblems.length ||
  standardItemProblems.length
) {
  console.error('Registry validation failed')
  if (missingComponents.length) console.error('Missing components:', missingComponents.join(', '))
  if (extraComponents.length) console.error('Unexpected components:', extraComponents.join(', '))
  if (duplicateComponents.length) console.error('Duplicate registry components:', [...new Set(duplicateComponents)].join(', '))
  if (missingFiles.length) console.error('Missing files:\n' + missingFiles.join('\n'))
  if (missingStyleFiles.length) console.error('Missing style files:\n' + missingStyleFiles.join('\n'))
  if (missingRequiredStyleFiles.length) console.error('registry.style.files must include global and token CSS files:\n' + missingRequiredStyleFiles.join('\n'))
  if (missingPages.length) console.error('Missing pages:', missingPages.join(', '))
  if (registryPagesMissingStaticMeta.length) console.error('Registry pages missing static metadata:', registryPagesMissingStaticMeta.join(', '))
  if (duplicateMetaIds.length) console.error('Duplicate metadata ids:', [...new Set(duplicateMetaIds)].join(', '))
  if (duplicateMetaRegistryNames.length) console.error('Duplicate metadata registry names:', [...new Set(duplicateMetaRegistryNames)].join(', '))
  if (missingMetaForRegistry.length) console.error('Registry entries missing metadata:', missingMetaForRegistry.join(', '))
  if (missingRegistryForMeta.length) console.error('Metadata entries missing registry components:', missingRegistryForMeta.join(', '))
  if (invalidMeta.length) console.error('Invalid metadata entries:', invalidMeta.map((component) => component.id || component.registryName || '(unknown)').join(', '))
  if (invalidComponentExportNames.length) console.error('Component metadata exportName values missing from src/components/ui exports:\n' + invalidComponentExportNames.join('\n'))
  if (duplicateThemeStyles.length) console.error('Duplicate theme metadata styles:', [...new Set(duplicateThemeStyles)].join(', '))
  if (missingThemeMetaForRegistry.length) console.error('Registry styles missing theme metadata:', missingThemeMetaForRegistry.join(', '))
  if (missingRegistryStyleForThemeMeta.length) console.error('Theme metadata entries missing registry styles:', missingRegistryStyleForThemeMeta.join(', '))
  if (themeListOrderMismatch) console.error('src/styles/themeList.ts themeStyles must match src/docs/themeMeta.json order and values.')
  if (themeListDuplicatedLabels) console.error('src/styles/themeList.ts must derive labels and descriptions from src/docs/themeMeta.json, not duplicate them.')
  if (invalidThemeMeta.length) console.error('Invalid theme metadata entries:', invalidThemeMeta.map((theme) => theme.style || '(unknown)').join(', '))
  if (duplicateBlocks.length) console.error('Duplicate registry blocks:', [...new Set(duplicateBlocks)].join(', '))
  if (invalidBlocks.length) console.error('Invalid registry blocks:', invalidBlocks.map((block) => block.name || '(unknown)').join(', '))
  if (missingBlockComponentRefs.length) console.error('Block component refs missing registry components:\n' + missingBlockComponentRefs.join('\n'))
  if (missingBlockFiles.length) console.error('Missing block files:\n' + missingBlockFiles.join('\n'))
  if (sourceCopyDependencyProblems.length) console.error('Source-copy dependency problems:\n' + sourceCopyDependencyProblems.join('\n'))
  if (invalidBlockRoutes.length) console.error('Invalid block routes:\n' + invalidBlockRoutes.join('\n'))
  if (duplicateBlockMetaIds.length) console.error('Duplicate block metadata ids:', [...new Set(duplicateBlockMetaIds)].join(', '))
  if (duplicateBlockMetaRegistryNames.length) console.error('Duplicate block metadata registry names:', [...new Set(duplicateBlockMetaRegistryNames)].join(', '))
  if (missingBlockMetaForRegistry.length) console.error('Registry blocks missing metadata:', missingBlockMetaForRegistry.join(', '))
  if (missingRegistryBlockForMeta.length) console.error('Block metadata entries missing registry blocks:', missingRegistryBlockForMeta.join(', '))
  if (invalidBlockMeta.length) console.error('Invalid block metadata entries:', invalidBlockMeta.map((block) => block.id || block.registryName || '(unknown)').join(', '))
  if (blockMetaOrderMismatch) console.error('src/docs/blockMeta.json must match registry blocks order and values.')
  if (blockMetaDrift.length) console.error('Block metadata drift:\n' + blockMetaDrift.join('\n'))
  if (appHasBlockDemoData) console.error('src/App.tsx must import block demos from src/docs/blockDocs.tsx instead of duplicating block metadata.')
  if (missingComponentDocsForMeta.length) console.error('Metadata entries missing component docs:', missingComponentDocsForMeta.join(', '))
  if (missingMetaForComponentDocs.length) console.error('Component docs missing metadata:', missingMetaForComponentDocs.join(', '))
  if (standardCatalogProblems.length) console.error('Standard registry catalog problems:\n' + standardCatalogProblems.join('\n'))
  if (standardItemProblems.length) console.error('Standard registry item problems:\n' + standardItemProblems.join('\n'))
  process.exit(1)
}

console.log(`Registry valid: ${registry.components.length} components, ${registry.blocks.length} blocks, ${registry.pages.length} pages, ${componentMeta.length} component metadata entries, ${blockMeta.length} block metadata entries, ${themeMeta.length} theme metadata entries, ${standardItems.length} standard registry items`)

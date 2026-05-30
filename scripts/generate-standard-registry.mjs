import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

const internalRegistryPath = resolve('registry/registry.json')
const componentMetaPath = resolve('src/docs/componentMeta.json')
const blockMetaPath = resolve('src/docs/blockMeta.json')
const themeMetaPath = resolve('src/docs/themeMeta.json')
const catalogPath = resolve('registry/shadcn-registry.json')
const itemsDir = resolve('registry/items')

function targetForSource(path) {
  if (path.startsWith('src/components/ui/')) return `@/components/ui/${basename(path)}`
  if (path.startsWith('src/blocks/')) return `@/blocks/${basename(path)}`
  if (path.startsWith('src/styles/')) return `@/styles/base-themes/${basename(path)}`
  if (path === 'src/index.css') return '@/styles/base-themes/index.css'
  return path
}

function registryFileType(path, fallback) {
  if (path.endsWith('.tsx') && path.includes('/components/ui/')) return 'registry:ui'
  if (path.endsWith('.tsx') && path.includes('/blocks/')) return 'registry:block'
  if (path.endsWith('.css')) return 'registry:file'
  return fallback
}

function toRegistryFiles(files, fallbackType) {
  return files.map((path) => ({
    path,
    type: registryFileType(path, fallbackType),
    target: targetForSource(path),
  }))
}

function sentence(value) {
  return value.replace(/[.!?]+$/u, '')
}

function componentCategories(component, meta) {
  const categories = new Set(['base-ui', 'component'])
  if (meta?.group) categories.add(meta.group.toLowerCase())
  if (component.name.includes('dialog') || component.name.includes('popover') || component.name.includes('tooltip')) categories.add('overlay')
  if (['button', 'input', 'select', 'checkbox', 'switch', 'radio-group', 'slider'].includes(component.name)) categories.add('form')
  return [...categories]
}

function blockCategories(block) {
  return ['block', block.category.toLowerCase().replaceAll(' ', '-'), 'product-ui']
}

function themeCategories(theme) {
  const categories = new Set(['theme', 'base-themes'])
  for (const word of theme.description.toLowerCase().split(/[^a-z0-9-]+/)) {
    if (['dashboard', 'dashboards', 'admin', 'data', 'dense', 'developer', 'editorial', 'marketing', 'enterprise', 'playful'].includes(word)) categories.add(word)
  }
  return [...categories]
}

function componentItem(component, meta, registry) {
  const exportName = meta?.exportName ?? component.title.replaceAll(' ', '')
  return {
    '$schema': 'https://ui.shadcn.com/schema/registry-item.json',
    name: component.name,
    type: 'registry:ui',
    title: component.title,
    description: meta?.summary ?? `${component.title} component for Base Themes.`,
    dependencies: registry.dependencies,
    files: toRegistryFiles(component.files, 'registry:ui'),
    categories: componentCategories(component, meta),
    meta: {
      baseThemes: {
        source: 'package-and-source-copy',
        docsRoute: `/components/${meta?.id ?? component.name}`,
        supportsStyles: registry.style.variants,
        styleContract: ['data-style', 'data-theme', ...(registry.style.files ?? [registry.style.global, registry.style.tokens])],
      },
      agent: {
        summary: `Use ${component.title} when a React UI needs ${sentence(meta?.summary?.toLowerCase() ?? 'a themed Base UI wrapper')}.`,
        whenToUse: [meta?.group ?? 'Component', 'Base UI wrapper', 'CSS token theme support'],
        packageInstall: ['npm install base-themes @base-ui/react react react-dom', 'import base-themes/styles.css once', `import { ${exportName} } from 'base-themes'`],
        sourceCopy: [`fetch /registry/items/${component.name}.json`, 'copy every files[].path to files[].target', 'copy every registry.style.files entry once', 'install dependencies from dependencies[]'],
        installPlan: ['npm install base-themes @base-ui/react react react-dom', 'import base-themes/styles.css once', `import { ${exportName} } from 'base-themes'`, `or fetch /registry/items/${component.name}.json for source-copy`],
        verify: ['npm run registry:check', 'npm run tokens:check', 'npm run lint', 'npm run build'],
      },
    },
  }
}

function blockItem(block, meta, registry) {
  const exportName = meta?.exportName ?? block.title.replaceAll(' ', '')
  return {
    '$schema': 'https://ui.shadcn.com/schema/registry-item.json',
    name: `block-${block.name}`,
    type: 'registry:block',
    title: block.title,
    description: block.description,
    dependencies: registry.dependencies,
    files: toRegistryFiles(block.files, 'registry:block'),
    categories: blockCategories(block),
    meta: {
      baseThemes: {
        source: 'package-and-source-copy',
        registryName: block.name,
        docsRoute: block.route,
        components: block.components,
        supportsStyles: registry.style.variants,
      },
      agent: {
        summary: `Use ${block.title} as a ready product UI starting point for ${block.category.toLowerCase()} screens.`,
        whenToUse: [block.category, 'Product screen composition', 'Block-level copy plan'],
        registryItems: [`/registry/items/block-${block.name}.json`, ...block.components.map((component) => `/registry/items/${component}.json`)],
        packageInstall: ['npm install base-themes @base-ui/react react react-dom', 'import base-themes/styles.css once', `import { ${exportName} } from 'base-themes'`],
        sourceCopy: [`npx base-themes plan block:${block.name}`, `fetch /registry/items/block-${block.name}.json`, 'copy block files', 'copy required component files from registryItems', 'copy every registry.style.files entry once'],
        installPlan: [`npx base-themes plan block:${block.name}`, `fetch /registry/items/block-${block.name}.json`, 'copy block files and component registryItems', 'import base-themes/styles.css once'],
        verify: ['npm run registry:check', 'npm run tokens:check', 'npm run lint', 'npm run build'],
      },
    },
  }
}

function themeItem(theme, registry) {
  return {
    '$schema': 'https://ui.shadcn.com/schema/registry-item.json',
    name: `theme-${theme.style}`,
    type: 'registry:theme',
    title: `${theme.label} Theme`,
    description: theme.description,
    files: toRegistryFiles(registry.style.files ?? [registry.style.global, registry.style.tokens, 'src/styles/themes.css'], 'registry:file'),
    categories: themeCategories(theme),
    meta: {
      preview: {
        light: `/previews/base-themes-${theme.style}.png`,
      },
      baseThemes: {
        style: theme.style,
        label: theme.label,
        defaultMode: 'light',
        supportsModes: ['light', 'dark'],
        dataAttributes: { style: theme.style, theme: 'light' },
      },
      agent: {
        summary: `Use the ${theme.label} theme when the user wants ${sentence(theme.description.toLowerCase())}.`,
        whenToUse: [theme.label, 'CSS variable theme', 'Base Themes visual style'],
        avoidWhen: ['The user needs a fully custom brand system before trying token overrides'],
        packageInstall: ['npm install base-themes @base-ui/react react react-dom', 'import base-themes/styles.css once', `set data-style="${theme.style}"`, 'set data-theme="light" or data-theme="dark"'],
        sourceCopy: [`fetch /registry/items/theme-${theme.style}.json`, 'copy every files[].path to files[].target', 'copy src/styles/tokenContract.json when generating overrides'],
        installPlan: ['import base-themes/styles.css once', `set data-style="${theme.style}"`, 'set data-theme="light" or data-theme="dark"', `or fetch /registry/items/theme-${theme.style}.json for source-copy`],
        prompts: [`Create a React settings screen using Base Themes with data-style="${theme.style}".`],
      },
    },
  }
}

export async function createStandardRegistryArtifacts() {
  const registry = JSON.parse(await readFile(internalRegistryPath, 'utf8'))
  const componentMeta = JSON.parse(await readFile(componentMetaPath, 'utf8'))
  const blockMeta = JSON.parse(await readFile(blockMetaPath, 'utf8'))
  const themeMeta = JSON.parse(await readFile(themeMetaPath, 'utf8'))
  const componentMetaByRegistryName = new Map(componentMeta.map((meta) => [meta.registryName, meta]))
  const blockMetaByRegistryName = new Map(blockMeta.map((meta) => [meta.registryName, meta]))

  const items = [
    ...registry.components.map((component) => componentItem(component, componentMetaByRegistryName.get(component.name), registry)),
    ...registry.blocks.map((block) => blockItem(block, blockMetaByRegistryName.get(block.name), registry)),
    ...themeMeta.map((theme) => themeItem(theme, registry)),
  ]

  const catalog = {
    '$schema': 'https://ui.shadcn.com/schema/registry.json',
    name: 'base-themes',
    homepage: registry.homepage,
    items: items.map((item) => ({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
    })),
  }

  return { catalog, items }
}

export async function writeStandardRegistryArtifacts() {
  const { catalog, items } = await createStandardRegistryArtifacts()
  await mkdir(itemsDir, { recursive: true })
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
  await Promise.all(items.map((item) => writeFile(resolve(itemsDir, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`)))
  return { catalog, items }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { catalog, items } = await writeStandardRegistryArtifacts()
  console.log(`Generated shadcn-compatible registry catalog with ${catalog.items.length} items in registry/shadcn-registry.json`)
  console.log(`Generated ${items.length} item files in registry/items`)
}

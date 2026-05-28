import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const registryPath = join(root, 'registry/registry.json')
const registry = JSON.parse(readFileSync(registryPath, 'utf8'))

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

const missingFiles = []
for (const component of registry.components) {
  for (const file of component.files) {
    if (!existsSync(join(root, file))) {
      missingFiles.push(`${component.name}: ${file}`)
    }
  }
}

const requiredPages = ['/blocks', '/themes', '/docs/installation']
const pageRoutes = new Set(registry.pages.map((page) => page.route))
const missingPages = requiredPages.filter((route) => !pageRoutes.has(route))

if (missingComponents.length || extraComponents.length || missingFiles.length || missingPages.length) {
  console.error('Registry validation failed')
  if (missingComponents.length) console.error('Missing components:', missingComponents.join(', '))
  if (extraComponents.length) console.error('Unexpected components:', extraComponents.join(', '))
  if (missingFiles.length) console.error('Missing files:\n' + missingFiles.join('\n'))
  if (missingPages.length) console.error('Missing pages:', missingPages.join(', '))
  process.exit(1)
}

console.log(`Registry valid: ${registry.components.length} components, ${registry.blocks.length} blocks, ${registry.pages.length} pages`)

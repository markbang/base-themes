import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'

const requiredFiles = [
  'dist/base-themes.js',
  'dist/base-themes.css',
  'dist/types/lib.d.ts',
  'registry/registry.json',
  'registry/shadcn-registry.json',
  'registry/items/button.json',
  'registry/items/block-dashboard-shell.json',
  'registry/items/theme-enterprise.json',
  'llms.txt',
  'llms-full.txt',
  'bin/base-themes.mjs',
  'scripts/render-release-announcement.mjs',
  'scripts/render-launch-status.mjs',
  'scripts/render-launch-actions.mjs',
  'scripts/registry-plan.mjs',
  'scripts/verify-launch-readiness.mjs',
  'scripts/verify-telemetry-report.mjs',
  'scripts/verify-telemetry-fixtures.mjs',
  'research/telemetry-fixtures/search-console-export.csv',
  'research/telemetry-fixtures/analytics-events.jsonl',
  'research/telemetry-fixtures/registry-access.jsonl',
  'research/telemetry-fixtures/community-proof.csv',
  'research/telemetry-fixtures/bundle-report.json',
  'src/components/ui/Button.tsx',
  'src/blocks/DashboardShell.tsx',
  'src/blocks/Blocks.css',
  'src/docs/blockMeta.json',
  'src/docs/componentMeta.json',
  'src/docs/staticPageMeta.json',
  'src/docs/themeMeta.json',
  'src/styles/tokenContract.json',
  'docs/community-proof-telemetry.md',
  'skills/base-themes/SKILL.md',
]

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(file)))
if (missingFiles.length > 0) {
  console.error(`Package smoke failed. Missing files: ${missingFiles.join(', ')}`)
  process.exit(1)
}

const library = await import('base-themes')
const blockMetaModule = await import('base-themes/block-meta.json', { with: { type: 'json' } })
const componentMetaModule = await import('base-themes/component-meta.json', { with: { type: 'json' } })
const staticPageMetaModule = await import('base-themes/static-page-meta.json', { with: { type: 'json' } })
const themeMetaModule = await import('base-themes/theme-meta.json', { with: { type: 'json' } })
const tokenContractModule = await import('base-themes/token-contract.json', { with: { type: 'json' } })
const buttonItemModule = await import('base-themes/registry/items/button.json', { with: { type: 'json' } })
const dashboardBlockItemModule = await import('base-themes/registry/items/block-dashboard-shell.json', { with: { type: 'json' } })
const enterpriseThemeItemModule = await import('base-themes/registry/items/theme-enterprise.json', { with: { type: 'json' } })
const llmsTxt = readFileSync(resolve('llms.txt'), 'utf8')
const llmsFullTxt = readFileSync(resolve('llms-full.txt'), 'utf8')
const readme = readFileSync(resolve('README.md'), 'utf8')
const registry = JSON.parse(readFileSync(resolve('registry/registry.json'), 'utf8'))
const standardCatalog = JSON.parse(readFileSync(resolve('registry/shadcn-registry.json'), 'utf8'))
const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
const blockMeta = blockMetaModule.default
const componentMeta = componentMetaModule.default
const staticPageMeta = staticPageMetaModule.default
const themeMeta = themeMetaModule.default
const tokenContract = tokenContractModule.default
const buttonItem = buttonItemModule.default
const dashboardBlockItem = dashboardBlockItemModule.default
const enterpriseThemeItem = enterpriseThemeItemModule.default
const skill = readFileSync(resolve('skills/base-themes/SKILL.md'), 'utf8')
const requiredKeywords = [
  'base-ui',
  'base-ui-theme',
  'react-components',
  'themes',
  'css-variables',
  'design-tokens',
  'shadcn-ui',
  'registry',
  'copy-paste',
  'agent-friendly',
  'accessibility',
]

const requiredExports = ['Button', 'Select', 'Dialog', 'Tabs', 'DashboardShell', 'SettingsForm', 'useTheme']
const missingExports = requiredExports.filter((name) => !(name in library))
if (missingExports.length > 0) {
  console.error(`Package smoke failed. Missing exports: ${missingExports.join(', ')}`)
  process.exit(1)
}

const missingMetadataExports = componentMeta
  .filter((component) => !(component.exportName in library))
  .map((component) => `${component.registryName}: ${component.exportName}`)
if (missingMetadataExports.length > 0) {
  console.error(`Package smoke failed. Component metadata exportName values are not package exports: ${missingMetadataExports.join(', ')}`)
  process.exit(1)
}

const missingKeywords = requiredKeywords.filter((keyword) => !packageJson.keywords?.includes(keyword))
if (missingKeywords.length > 0) {
  console.error(`Package smoke failed. Missing npm discoverability keywords: ${missingKeywords.join(', ')}`)
  process.exit(1)
}

const requiredDescriptionPhrases = ['Accessible Base UI React components', '22 themes', 'registry metadata', 'agent-friendly workflows']
const missingDescriptionPhrases = requiredDescriptionPhrases.filter((phrase) => !packageJson.description?.includes(phrase))
if (missingDescriptionPhrases.length > 0) {
  console.error(`Package smoke failed. npm description is missing strategic positioning: ${missingDescriptionPhrases.join(', ')}`)
  process.exit(1)
}

const quickStartIndex = readme.indexOf('## Quick Start')
const previewIndex = readme.indexOf('## Preview')
if (quickStartIndex === -1 || (previewIndex !== -1 && quickStartIndex > previewIndex)) {
  console.error('Package smoke failed. README should include Quick Start before optional preview content.')
  process.exit(1)
}

if (packageJson.homepage !== 'https://base-themes.bangwu.me') {
  console.error('Package smoke failed. Homepage should point to the docs site.')
  process.exit(1)
}

if (packageJson.publishConfig?.access !== 'public') {
  console.error('Package smoke failed. publishConfig.access must be public.')
  process.exit(1)
}

if (packageJson.bin?.['base-themes'] !== './bin/base-themes.mjs') {
  console.error('Package smoke failed. base-themes CLI bin is missing.')
  process.exit(1)
}

if (packageJson.exports?.['./registry/items/*.json'] !== './registry/items/*.json') {
  console.error('Package smoke failed. registry item JSON subpath export is missing.')
  process.exit(1)
}

const requiredPrepackChecks = ['npm run registry:check', 'npm run tokens:check', 'npm run lint', 'npm run test', 'npm run build', 'npm run bundle:report', 'npm run package:smoke']
const missingPrepackChecks = requiredPrepackChecks.filter((check) => !packageJson.scripts?.prepack?.includes(check))
if (missingPrepackChecks.length > 0) {
  console.error(`Package smoke failed. prepack is missing release checks: ${missingPrepackChecks.join(', ')}`)
  process.exit(1)
}

if (registry.components.length < 40 || registry.style.variants.length !== 22) {
  console.error('Package smoke failed. Registry shape does not match expected component/theme coverage.')
  process.exit(1)
}

if (registry.blocks.length < 8) {
  console.error('Package smoke failed. Registry does not include expected block coverage.')
  process.exit(1)
}

const expectedStandardItems = registry.components.length + registry.blocks.length + registry.style.variants.length
if (standardCatalog.items?.length !== expectedStandardItems) {
  console.error(`Package smoke failed. Shadcn-compatible registry should contain ${expectedStandardItems} items.`)
  process.exit(1)
}

if (!standardCatalog.items.some((item) => item.name === 'theme-enterprise' && item.type === 'registry:theme')) {
  console.error('Package smoke failed. Shadcn-compatible registry is missing theme-enterprise.')
  process.exit(1)
}

if (buttonItem.name !== 'button' || dashboardBlockItem.name !== 'block-dashboard-shell' || enterpriseThemeItem.name !== 'theme-enterprise') {
  console.error('Package smoke failed. Registry item subpath exports do not resolve expected item JSON.')
  process.exit(1)
}

if (!dashboardBlockItem.meta?.agent?.registryItems?.includes('/registry/items/button.json')) {
  console.error('Package smoke failed. Block registry item export is missing dependency registryItems metadata.')
  process.exit(1)
}

for (const component of componentMeta) {
  const item = JSON.parse(readFileSync(resolve(`registry/items/${component.registryName}.json`), 'utf8'))
  if (!item.meta?.agent?.packageInstall?.includes(`import { ${component.exportName} } from 'base-themes'`)) {
    console.error(`Package smoke failed. ${component.registryName} registry item does not import package export ${component.exportName}.`)
    process.exit(1)
  }
}

const missingRegistryFiles = [
  ...registry.components.flatMap((component) => component.files),
  ...registry.blocks.flatMap((block) => block.files),
].filter((file) => !existsSync(resolve(file)))
if (missingRegistryFiles.length > 0) {
  console.error(`Package smoke failed. Registry files missing from package surface: ${missingRegistryFiles.join(', ')}`)
  process.exit(1)
}

if (componentMeta.length !== registry.components.length) {
  console.error('Package smoke failed. Component metadata count does not match registry components.')
  process.exit(1)
}

if (blockMeta.length !== registry.blocks.length || !blockMeta.some((block) => block.registryName === 'dashboard-shell' && block.exportName === 'DashboardShell')) {
  console.error('Package smoke failed. Block metadata count or dashboard-shell export metadata does not match registry blocks.')
  process.exit(1)
}

if (!staticPageMeta.some((page) => page.path === '/docs/security') || !staticPageMeta.some((page) => page.path === '/docs/registry')) {
  console.error('Package smoke failed. Static page metadata is missing required trust or registry routes.')
  process.exit(1)
}

if (themeMeta.length !== registry.style.variants.length) {
  console.error('Package smoke failed. Theme metadata count does not match registry theme variants.')
  process.exit(1)
}

if (tokenContract.version !== '0.1.0' || tokenContract.stablePrefix !== '--bt-' || !tokenContract.dataAttributes?.includes('data-style') || !tokenContract.dataAttributes?.includes('data-theme')) {
  console.error('Package smoke failed. Token contract export is missing required version, prefix, or data attributes.')
  process.exit(1)
}

if (!llmsTxt.includes('/llms-full.txt') || !llmsFullTxt.includes('Base Themes Full Agent Context') || !llmsFullTxt.includes('base-themes/token-contract.json')) {
  console.error('Package smoke failed. Agent discovery files are missing compact/full links or token contract guidance.')
  process.exit(1)
}

const validDoctorReport = execFileSync('node', ['bin/base-themes.mjs', 'doctor', '.', '--json'], { encoding: 'utf8' })
const doctorReport = JSON.parse(validDoctorReport)
if (!doctorReport.ok || !Array.isArray(doctorReport.checks)) {
  console.error('Package smoke failed. Doctor JSON should include an ok flag and checks array.')
  process.exit(1)
}
const doctorText = execFileSync('node', ['bin/base-themes.mjs', 'doctor', '.'], { encoding: 'utf8' })
const requiredDoctorText = ['Base Themes doctor', 'base-themes dependency', 'base-themes/styles.css import found', 'data-style attribute found', 'data-theme attribute found']
const missingDoctorText = requiredDoctorText.filter((phrase) => !doctorText.includes(phrase))
if (missingDoctorText.length > 0) {
  console.error(`Package smoke failed. Doctor success output is missing package diagnostics: ${missingDoctorText.join(', ')}`)
  process.exit(1)
}

const requiredSkillPhrases = [
  'npx base-themes plan',
  'npx base-themes add',
  'npx base-themes doctor',
  'base-themes/block-meta.json',
  'base-themes/component-meta.json',
  'base-themes/static-page-meta.json',
  'base-themes/theme-meta.json',
  'base-themes/token-contract.json',
  '/llms-full.txt',
  'examples/theme-customization',
  'npm run tokens:check',
  'npm run bundle:report',
  'npm run bundle:report -- --json',
  'BUNDLE_REPORT_EXPORT',
  'npm run package:smoke',
]
const missingSkillPhrases = requiredSkillPhrases.filter((phrase) => !skill.includes(phrase))
if (missingSkillPhrases.length > 0) {
  console.error(`Package smoke failed. Agent skill is missing current workflow guidance: ${missingSkillPhrases.join(', ')}`)
  process.exit(1)
}

const bundleReport = JSON.parse(execFileSync('node', ['scripts/report-bundle-size.mjs', '--json'], { encoding: 'utf8' }))
if (!bundleReport.ok || !bundleReport.appJs?.gzipBytes || !bundleReport.largestJs?.bytes || !Array.isArray(bundleReport.budgetChecks) || bundleReport.budgetChecks.length < 3 || !bundleReport.budgetChecks.every((check) => check.passed)) {
  console.error('Package smoke failed. Bundle report JSON is missing passing performance budgets.')
  process.exit(1)
}

const html = renderToString(React.createElement(library.Button, null, 'Save changes'))
if (!html.includes('Save changes') || !html.includes('bento-button')) {
  console.error('Package smoke failed. SSR render output did not include expected Button markup.')
  process.exit(1)
}

const cliList = execFileSync('node', ['bin/base-themes.mjs', 'list'], { encoding: 'utf8' })
if (!cliList.includes('Components (40)') || !cliList.includes('Blocks (8)') || !cliList.includes('Styles (22)')) {
  console.error('Package smoke failed. CLI list output does not include expected registry coverage.')
  process.exit(1)
}
const cliListJson = JSON.parse(execFileSync('node', ['bin/base-themes.mjs', 'list', '--json'], { encoding: 'utf8' }))
if (cliListJson.components?.length !== 40 || cliListJson.blocks?.length !== 8 || cliListJson.style?.variants?.length !== 22) {
  console.error('Package smoke failed. CLI list --json output does not include expected registry coverage.')
  process.exit(1)
}

const cliPlan = execFileSync('node', ['bin/base-themes.mjs', 'plan', 'button', 'select', 'block:dashboard-shell', 'theme:enterprise'], { encoding: 'utf8' })
if (!cliPlan.includes('Base Themes registry copy plan') || !cliPlan.includes('src/blocks/DashboardShell.tsx') || !cliPlan.includes('src/components/ui/Select.tsx')) {
  console.error('Package smoke failed. CLI plan output does not include expected block and component files.')
  process.exit(1)
}

const requiredCliPlanPhrases = [
  'Registry item imports:',
  'Hosted registry item URLs:',
  'Block registryItems metadata:',
  'Package install steps:',
  'Source-copy steps:',
  'base-themes/registry/items/button.json',
  'base-themes/registry/items/theme-enterprise.json',
  '/registry/items/block-dashboard-shell.json',
  '/registry/items/theme-enterprise.json',
  "import { Button } from 'base-themes'",
  'set data-style="enterprise"',
  '/registry/items/button.json, /registry/items/progress.json, /registry/items/meter.json',
]
const missingCliPlanPhrases = requiredCliPlanPhrases.filter((phrase) => !cliPlan.includes(phrase))
if (missingCliPlanPhrases.length > 0) {
  console.error(`Package smoke failed. CLI plan is missing agent registry guidance: ${missingCliPlanPhrases.join(', ')}`)
  process.exit(1)
}

const cliPlanJson = JSON.parse(execFileSync('node', ['bin/base-themes.mjs', 'plan', 'button', 'select', 'block:dashboard-shell', 'theme:enterprise', '--json'], { encoding: 'utf8' }))
if (!cliPlanJson.ok || !cliPlanJson.components.includes('button') || !cliPlanJson.blocks.includes('dashboard-shell') || !cliPlanJson.themes.includes('enterprise') || !cliPlanJson.registryItems.some((item) => item.name === 'theme-enterprise')) {
  console.error('Package smoke failed. CLI plan --json output is missing expected component, block, theme, or registry item data.')
  process.exit(1)
}

const addSmokeTarget = resolve('.tmp/package-smoke-add')
rmSync(addSmokeTarget, { recursive: true, force: true })
const cliAddDryRun = execFileSync('node', ['bin/base-themes.mjs', 'add', 'button', 'block:dashboard-shell', 'theme:enterprise', '--target', addSmokeTarget, '--dry-run'], { encoding: 'utf8' })
if (!cliAddDryRun.includes('Base Themes add dry run') || !cliAddDryRun.includes('Themes: enterprise') || !cliAddDryRun.includes('src/components/ui/Button.tsx') || !cliAddDryRun.includes('src/blocks/DashboardShell.tsx') || !cliAddDryRun.includes('src/styles/themes.css')) {
  console.error('Package smoke failed. CLI add dry-run output does not include expected copy plan.')
  process.exit(1)
}
const cliAddDryRunJson = JSON.parse(execFileSync('node', ['bin/base-themes.mjs', 'add', 'button', 'block:dashboard-shell', 'theme:enterprise', '--target', addSmokeTarget, '--dry-run', '--json'], { encoding: 'utf8' }))
if (!cliAddDryRunJson.ok || !cliAddDryRunJson.dryRun || !cliAddDryRunJson.plan.themes.includes('enterprise') || !cliAddDryRunJson.copied.some((file) => file.file === 'src/styles/themes.css')) {
  console.error('Package smoke failed. CLI add --json dry-run output is missing expected theme or copied-file data.')
  process.exit(1)
}
const cliAdd = execFileSync('node', ['bin/base-themes.mjs', 'add', 'button', 'block:dashboard-shell', 'theme:enterprise', '--target', addSmokeTarget], { encoding: 'utf8' })
if (!cliAdd.includes('Base Themes add') || !existsSync(resolve(addSmokeTarget, 'src/components/ui/Button.tsx')) || !existsSync(resolve(addSmokeTarget, 'src/blocks/DashboardShell.tsx')) || !existsSync(resolve(addSmokeTarget, 'src/styles/themes.css'))) {
  console.error('Package smoke failed. CLI add did not copy expected files.')
  process.exit(1)
}
const copiedDashboardBlock = readFileSync(resolve(addSmokeTarget, 'src/blocks/DashboardShell.tsx'), 'utf8')
if (copiedDashboardBlock.includes("from '../components/ui'") || !copiedDashboardBlock.includes("from '../components/ui/Button'")) {
  console.error('Package smoke failed. CLI add should copy blocks with direct component imports, not the full components barrel.')
  process.exit(1)
}
const cliAddSkip = execFileSync('node', ['bin/base-themes.mjs', 'add', 'button', 'block:dashboard-shell', 'theme:enterprise', '--target', addSmokeTarget], { encoding: 'utf8' })
if (!cliAddSkip.includes('Skipped files:') || !cliAddSkip.includes('use --force to overwrite')) {
  console.error('Package smoke failed. CLI add should skip existing files unless --force is passed.')
  process.exit(1)
}

const addSmokeAppTarget = resolve('.tmp/package-smoke-add-app')
rmSync(addSmokeAppTarget, { recursive: true, force: true })
mkdirSync(resolve(addSmokeAppTarget, 'src'), { recursive: true })
cpSync(resolve(addSmokeTarget, 'src/components'), resolve(addSmokeAppTarget, 'src/components'), { recursive: true })
cpSync(resolve(addSmokeTarget, 'src/blocks'), resolve(addSmokeAppTarget, 'src/blocks'), { recursive: true })
cpSync(resolve(addSmokeTarget, 'src/styles'), resolve(addSmokeAppTarget, 'src/styles'), { recursive: true })
cpSync(resolve(addSmokeTarget, 'src/index.css'), resolve(addSmokeAppTarget, 'src/index.css'))
writeFileSync(resolve(addSmokeAppTarget, 'package.json'), `${JSON.stringify({ type: 'module', private: true, dependencies: {} }, null, 2)}\n`)
writeFileSync(resolve(addSmokeAppTarget, 'index.html'), '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n')
writeFileSync(resolve(addSmokeAppTarget, 'src/main.tsx'), `import React from 'react'
import { createRoot } from 'react-dom/client'
import { DashboardShell } from './blocks/DashboardShell'
import './index.css'

createRoot(document.getElementById('root')).render(
  <main data-style="bento" data-theme="light">
    <DashboardShell />
  </main>,
)
`)
writeFileSync(resolve(addSmokeAppTarget, 'vite.config.ts'), `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()] })
`)
execFileSync(resolve('node_modules/.bin/vite'), ['build'], {
  cwd: addSmokeAppTarget,
  env: { ...process.env, NODE_PATH: resolve('node_modules') },
  encoding: 'utf8',
})
rmSync(addSmokeTarget, { recursive: true, force: true })
rmSync(addSmokeAppTarget, { recursive: true, force: true })

const cliDoctor = execFileSync('node', ['bin/base-themes.mjs', 'doctor', 'examples/vite'], { encoding: 'utf8' })
if (!cliDoctor.includes('Base Themes doctor') || !cliDoctor.includes('Result: Base Themes installation looks complete.')) {
  console.error('Package smoke failed. CLI doctor did not pass against the Vite example.')
  process.exit(1)
}
const cliDoctorJson = JSON.parse(execFileSync('node', ['bin/base-themes.mjs', 'doctor', 'examples/vite', '--json'], { encoding: 'utf8' }))
if (!cliDoctorJson.ok || cliDoctorJson.root !== 'examples/vite' || cliDoctorJson.checks?.length !== 7 || !cliDoctorJson.checks.every((check) => check.ok)) {
  console.error('Package smoke failed. CLI doctor --json did not pass against the Vite example.')
  process.exit(1)
}

const registryCopyPlanJson = JSON.parse(execFileSync('node', ['examples/registry-copy/plan-copy.mjs', 'plan', 'button', 'select', 'block:dashboard-shell', 'theme:enterprise', '--json'], { encoding: 'utf8' }))
if (!registryCopyPlanJson.ok || !registryCopyPlanJson.components.includes('button') || !registryCopyPlanJson.blocks.includes('dashboard-shell') || !registryCopyPlanJson.themes.includes('enterprise') || !registryCopyPlanJson.registryItems.some((item) => item.packageImport === 'base-themes/registry/items/theme-enterprise.json')) {
  console.error('Package smoke failed. Registry-copy example plan --json is not aligned with the CLI planner.')
  process.exit(1)
}
const registryCopyAddJson = JSON.parse(execFileSync('node', ['examples/registry-copy/plan-copy.mjs', 'add', 'button', 'block:dashboard-shell', 'theme:enterprise', '--target', resolve('.tmp/package-smoke-registry-copy'), '--dry-run', '--json'], { encoding: 'utf8' }))
if (!registryCopyAddJson.ok || !registryCopyAddJson.dryRun || !registryCopyAddJson.plan.themes.includes('enterprise') || !registryCopyAddJson.copied.some((file) => file.file === 'src/blocks/DashboardShell.tsx')) {
  console.error('Package smoke failed. Registry-copy example add --json dry-run is not aligned with the CLI add workflow.')
  process.exit(1)
}
const registryCopyDoctorJson = JSON.parse(execFileSync('node', ['examples/registry-copy/plan-copy.mjs', 'doctor', 'examples/vite', '--json'], { encoding: 'utf8' }))
if (!registryCopyDoctorJson.ok || registryCopyDoctorJson.root !== 'examples/vite') {
  console.error('Package smoke failed. Registry-copy example doctor --json did not pass against the Vite example.')
  process.exit(1)
}

console.log(`Package smoke valid: ${registry.components.length} components, ${registry.blocks.length} blocks, ${registry.style.variants.length} styles, SSR Button render OK`)

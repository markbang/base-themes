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

const requiredDescriptionPhrases = ['Accessible Base UI React components', '20 themes', 'registry metadata', 'agent-friendly workflows']
const missingDescriptionPhrases = requiredDescriptionPhrases.filter((phrase) => !packageJson.description?.includes(phrase))
if (missingDescriptionPhrases.length > 0) {
  console.error(`Package smoke failed. npm description is missing strategic positioning: ${missingDescriptionPhrases.join(', ')}`)
  process.exit(1)
}

const quickStartIndex = readme.indexOf('## Quick Start')
const previewIndex = readme.indexOf('## Preview')
if (quickStartIndex === -1 || previewIndex === -1 || quickStartIndex > previewIndex) {
  console.error('Package smoke failed. README should place Quick Start before the preview table.')
  process.exit(1)
}

const requiredReadmeAdoptionLinks = [
  'https://github.com/markbang/base-themes',
  'https://github.com/markbang/base-themes/fork',
  'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
  'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
]
const missingReadmeAdoptionLinks = requiredReadmeAdoptionLinks.filter((link) => !readme.includes(link))
if (missingReadmeAdoptionLinks.length > 0) {
  console.error(`Package smoke failed. README is missing public adoption action links: ${missingReadmeAdoptionLinks.join(', ')}`)
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

const requiredPrepackChecks = ['npm run telemetry:fixtures', 'npm run launch:check', 'npm run bundle:report', 'npm run package:smoke']
const missingPrepackChecks = requiredPrepackChecks.filter((check) => !packageJson.scripts?.prepack?.includes(check))
if (missingPrepackChecks.length > 0) {
  console.error(`Package smoke failed. prepack is missing release checks: ${missingPrepackChecks.join(', ')}`)
  process.exit(1)
}

if (registry.components.length < 40 || registry.style.variants.length !== 20) {
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

const requiredAgentCommunityLinks = [
  'https://github.com/markbang/base-themes',
  'https://github.com/markbang/base-themes/fork',
  'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
  'https://github.com/markbang/base-themes/issues/new?template=bug_report.yml',
  'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
  'https://github.com/markbang/base-themes/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22',
]
const missingAgentCommunityLinks = requiredAgentCommunityLinks.filter((link) => !llmsTxt.includes(link) || !llmsFullTxt.includes(link))
if (missingAgentCommunityLinks.length > 0) {
  console.error(`Package smoke failed. Agent discovery files are missing community action links: ${missingAgentCommunityLinks.join(', ')}`)
  process.exit(1)
}

const communityProofDocs = readFileSync(resolve('docs/community-proof-telemetry.md'), 'utf8')
const requiredCommunityProofPhrases = ['COMMUNITY_PROOF_EXPORT', 'Show and tell Discussions', 'permissionToFeature', 'Community proof is supporting evidence']
const missingCommunityProofPhrases = requiredCommunityProofPhrases.filter((phrase) => !communityProofDocs.includes(phrase))
if (missingCommunityProofPhrases.length > 0) {
  console.error('Package smoke failed. Community proof telemetry docs are missing export, discussion, or permission guidance.')
  process.exit(1)
}

const validDoctorReport = execFileSync('node', ['bin/base-themes.mjs', 'doctor', '.', '--json'], { encoding: 'utf8' })
const doctorReport = JSON.parse(validDoctorReport)
const requiredDoctorLinks = {
  repo: 'https://github.com/markbang/base-themes',
  fork: 'https://github.com/markbang/base-themes/fork',
  showAndTell: 'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  featureRequest: 'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
  bugReport: 'https://github.com/markbang/base-themes/issues/new?template=bug_report.yml',
  gallerySubmission: 'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
}
const missingDoctorLinks = Object.entries(requiredDoctorLinks)
  .filter(([key, value]) => doctorReport.links?.[key] !== value)
  .map(([key]) => key)
if (missingDoctorLinks.length > 0) {
  console.error(`Package smoke failed. Doctor JSON is missing adoption action links: ${missingDoctorLinks.join(', ')}`)
  process.exit(1)
}

const doctorText = execFileSync('node', ['bin/base-themes.mjs', 'doctor', '.'], { encoding: 'utf8' })
const requiredDoctorText = [
  'Public signal:',
  requiredDoctorLinks.repo,
  requiredDoctorLinks.fork,
  requiredDoctorLinks.showAndTell,
  requiredDoctorLinks.gallerySubmission,
]
const missingDoctorText = requiredDoctorText.filter((phrase) => !doctorText.includes(phrase))
if (missingDoctorText.length > 0) {
  console.error(`Package smoke failed. Doctor success output is missing adoption guidance: ${missingDoctorText.join(', ')}`)
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
  'npm run community:check',
  'npm run community:issues',
  'npm run tokens:check',
  'npm run bundle:report',
  'npm run bundle:report -- --json',
  'BUNDLE_REPORT_EXPORT',
  'npm run telemetry:check',
  'npm run telemetry:check -- --live',
  'npm run telemetry:fixtures',
  'npm run launch:status',
  'npm run launch:status -- --live',
  'npm run launch:actions',
  'npm run launch:actions -- --live',
  'npm run launch:campaign',
  'npm run telemetry:collect -- --json',
  'npm run package:smoke',
]
const missingSkillPhrases = requiredSkillPhrases.filter((phrase) => !skill.includes(phrase))
if (missingSkillPhrases.length > 0) {
  console.error(`Package smoke failed. Agent skill is missing current workflow guidance: ${missingSkillPhrases.join(', ')}`)
  process.exit(1)
}

const requiredReadmeTelemetryPhrases = [
  'npm run telemetry:check',
  'npm run telemetry:check -- --live',
  'npm run telemetry:fixtures',
  'npm run launch:status',
  'npm run launch:status -- --live',
  'npm run launch:actions',
  'npm run launch:actions -- --live',
  'npm run launch:campaign',
  'research/telemetry-YYYY-MM-DD.json',
  'research/telemetry-fixtures',
  'BUNDLE_REPORT_EXPORT',
  'externallyValidated',
  'node scripts/collect-telemetry.mjs --json',
]
const missingReadmeTelemetryPhrases = requiredReadmeTelemetryPhrases.filter((phrase) => !readme.includes(phrase))
if (missingReadmeTelemetryPhrases.length > 0) {
  console.error(`Package smoke failed. README is missing machine-readable telemetry guidance: ${missingReadmeTelemetryPhrases.join(', ')}`)
  process.exit(1)
}

const requiredForkWorkflowPhrases = [
  '## Fork-To-First-Change',
  'npm run example:theme-customization:build',
  'npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json',
  'npm run community:issues',
  'Show and tell Discussion',
]
const missingForkWorkflowPhrases = requiredForkWorkflowPhrases.filter((phrase) => !readme.includes(phrase))
if (missingForkWorkflowPhrases.length > 0) {
  console.error(`Package smoke failed. README is missing fork-to-first-change adoption workflow: ${missingForkWorkflowPhrases.join(', ')}`)
  process.exit(1)
}

const telemetryFixturesOutput = execFileSync('node', ['scripts/verify-telemetry-fixtures.mjs'], { encoding: 'utf8' })
if (!telemetryFixturesOutput.includes('Telemetry fixture import valid')) {
  console.error('Package smoke failed. Telemetry fixture verifier did not confirm import coverage.')
  process.exit(1)
}

const launchStatus = JSON.parse(execFileSync('node', ['scripts/render-launch-status.mjs', '--json'], { encoding: 'utf8' }))
if (launchStatus.completionThreshold !== 3 || launchStatus.signalCount !== 4 || typeof launchStatus.externallyValidated !== 'boolean' || typeof launchStatus.publicTelemetryComplete !== 'boolean' || !Array.isArray(launchStatus.telemetryErrors) || !Array.isArray(launchStatus.missingSignals) || !Array.isArray(launchStatus.signalTrends)) {
  console.error('Package smoke failed. Launch status JSON is missing the public adoption gate summary or signal trends.')
  process.exit(1)
}
if (!launchStatus.missingSignals.some((signal) => signal.id === 'forks' && signal.nextAction?.includes('Fork-to-first-change'))) {
  console.error('Package smoke failed. Launch status should route missing fork signal to the Fork-to-first-change workflow.')
  process.exit(1)
}
if (!launchStatus.missingSignals.some((signal) => signal.id === 'external-human-issue-or-pr' && signal.recommendedGoodFirstIssues?.length >= 2)) {
  console.error('Package smoke failed. Launch status should route missing external issue/PR signal to recommended good-first issues.')
  process.exit(1)
}
const launchActions = JSON.parse(execFileSync('node', ['scripts/render-launch-actions.mjs', '--json'], { encoding: 'utf8' }))
const launchActionsText = execFileSync('node', ['scripts/render-launch-actions.mjs'], { encoding: 'utf8' })
const launchActionsWrite = JSON.parse(execFileSync('node', ['scripts/render-launch-actions.mjs', '--json', '--write', '--output', '.tmp/package-smoke-launch-actions'], { encoding: 'utf8' }))
if (launchActions.completionThreshold !== 3 || launchActions.signalCount !== 4 || typeof launchActions.publicTelemetryComplete !== 'boolean' || !Array.isArray(launchActions.telemetryErrors) || !Array.isArray(launchActions.actions) || !Array.isArray(launchActions.signalTrends)) {
  console.error('Package smoke failed. Launch actions JSON is missing the public adoption gate action list or signal trends.')
  process.exit(1)
}
if (!Array.isArray(launchActions.shareAssets) || launchActions.shareAssets.length < 4 || !launchActions.shareAssets.every((asset) => asset.url?.includes('utm_campaign=') && asset.imageUrl?.startsWith('https://base-themes.bangwu.me/previews/'))) {
  console.error('Package smoke failed. Launch actions should include structured share assets with attributed URLs and preview images.')
  process.exit(1)
}
if (!Array.isArray(launchActions.channelChecklist) || launchActions.channelChecklist.length < 4 || !launchActions.channelChecklist.every((item) => item.channel && Array.isArray(item.shareAssetIds) && item.shareAssetIds.length > 0)) {
  console.error('Package smoke failed. Launch actions should include channel checklist entries with shareAssetIds.')
  process.exit(1)
}
if (!Array.isArray(launchActions.promotionWave) || launchActions.promotionWave.length < 4 || !launchActions.promotionWave.every((item) => item.channel && item.copy && item.primaryLink?.includes('utm_campaign=') && item.action && item.measure && Array.isArray(item.targetSignals) && item.targetSignals.length > 0 && Array.isArray(item.shareAssets) && item.shareAssets.length > 0)) {
  console.error('Package smoke failed. Launch actions should include channel promotion wave entries with copy, targets, links, actions, measures, and share assets.')
  process.exit(1)
}
if (!Array.isArray(launchActions.campaignChecklist) || launchActions.campaignChecklist.length < 7 || !launchActions.campaignChecklist.every((item) => item.phase && item.task && item.evidence && Array.isArray(item.recordFields) && item.recordFields.length > 0)) {
  console.error('Package smoke failed. Launch actions should include a campaign checklist with phase, task, evidence, and record fields.')
  process.exit(1)
}
const launchActionCampaignCommandText = launchActions.campaignChecklist.flatMap((item) => item.commands ?? []).join('\n')
for (const command of ['npm run launch:check', 'npm run launch:status -- --live', 'npm run telemetry:collect', 'npm run launch:actions']) {
  if (!launchActionCampaignCommandText.includes(command)) {
    console.error(`Package smoke failed. Launch action campaign checklist is missing ${command}.`)
    process.exit(1)
  }
}
const missingCampaignChannels = launchActions.promotionWave.map((item) => item.channel).filter((channel) => !launchActions.campaignChecklist.some((item) => item.channel === channel))
if (missingCampaignChannels.length > 0) {
  console.error(`Package smoke failed. Launch action campaign checklist is missing channels: ${missingCampaignChannels.join(', ')}`)
  process.exit(1)
}
const launchActionShareAssetIds = new Set(launchActions.shareAssets.map((asset) => asset.id))
const unknownLaunchActionShareAssetIds = launchActions.channelChecklist.flatMap((item) => item.shareAssetIds ?? []).filter((id) => !launchActionShareAssetIds.has(id))
if (unknownLaunchActionShareAssetIds.length > 0) {
  console.error(`Package smoke failed. Launch action channels reference unknown share asset ids: ${unknownLaunchActionShareAssetIds.join(', ')}`)
  process.exit(1)
}
const unknownPromotionWaveShareAssetIds = launchActions.promotionWave.flatMap((item) => item.shareAssetIds ?? []).filter((id) => !launchActionShareAssetIds.has(id))
if (unknownPromotionWaveShareAssetIds.length > 0) {
  console.error(`Package smoke failed. Launch action promotion wave references unknown share asset ids: ${unknownPromotionWaveShareAssetIds.join(', ')}`)
  process.exit(1)
}
if (!launchActionsText.includes('Promotion wave:') || !launchActionsText.includes('Campaign checklist:') || !launchActionsText.includes('Signal trend:') || !launchActionsText.includes('Target signals: github-stars') || !launchActionsText.includes('Post URL:') || !launchActionsText.includes('Telemetry report path:') || launchActionsText.includes('```text')) {
  console.error('Package smoke failed. Launch actions text should render promotion wave copy without nested text fences.')
  process.exit(1)
}
if (!launchActionsWrite.written?.jsonPath || !launchActionsWrite.written?.markdownPath || !existsSync(launchActionsWrite.written.jsonPath) || !existsSync(launchActionsWrite.written.markdownPath)) {
  console.error('Package smoke failed. Launch actions --write should create JSON and Markdown campaign files.')
  process.exit(1)
}
const writtenLaunchActionsJson = JSON.parse(readFileSync(launchActionsWrite.written.jsonPath, 'utf8'))
const writtenLaunchActionsMarkdown = readFileSync(launchActionsWrite.written.markdownPath, 'utf8')
if (!Array.isArray(writtenLaunchActionsJson.campaignChecklist) || !writtenLaunchActionsMarkdown.includes('Campaign checklist:') || !writtenLaunchActionsMarkdown.includes('Promotion wave:') || !writtenLaunchActionsMarkdown.includes('Post URL:')) {
  console.error('Package smoke failed. Written launch action campaign files should preserve campaign checklist and promotion wave content.')
  process.exit(1)
}
if (writtenLaunchActionsJson.written?.jsonPath !== launchActionsWrite.written.jsonPath || writtenLaunchActionsJson.written?.markdownPath !== launchActionsWrite.written.markdownPath) {
  console.error('Package smoke failed. Written launch action JSON should preserve its own output paths.')
  process.exit(1)
}
writeFileSync(launchActionsWrite.written.markdownPath, `${writtenLaunchActionsMarkdown}\n- Post URL: https://example.com/base-themes-launch\n`)
let refusedFilledOverwrite = false
try {
  execFileSync('node', ['scripts/render-launch-actions.mjs', '--write', '--output', '.tmp/package-smoke-launch-actions'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch (error) {
  refusedFilledOverwrite = `${error.stdout ?? ''}${error.stderr ?? ''}`.includes('Refusing to overwrite')
}
if (!refusedFilledOverwrite) {
  console.error('Package smoke failed. Launch actions --write should refuse to overwrite filled campaign record fields.')
  process.exit(1)
}
const forcedLaunchActionsWrite = JSON.parse(execFileSync('node', ['scripts/render-launch-actions.mjs', '--json', '--write', '--force', '--output', '.tmp/package-smoke-launch-actions'], { encoding: 'utf8' }))
if (!forcedLaunchActionsWrite.written?.jsonPath || !existsSync(forcedLaunchActionsWrite.written.jsonPath)) {
  console.error('Package smoke failed. Launch actions --force should allow an intentional campaign overwrite.')
  process.exit(1)
}
if (!launchActions.actions.some((action) => action.signalId === 'external-human-issue-or-pr' && action.recommendedGoodFirstIssues?.length >= 2)) {
  console.error('Package smoke failed. Launch actions should route missing external issue/PR signal to recommended good-first issues.')
  process.exit(1)
}
if (!launchActions.actions.some((action) => action.signalId === 'external-human-issue-or-pr' && action.commands?.some((command) => command.includes('gh issue create --repo markbang/base-themes')))) {
  console.error('Package smoke failed. Launch actions should include GitHub CLI commands for recommended good-first issues.')
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
if (!cliList.includes('Components (40)') || !cliList.includes('Blocks (8)') || !cliList.includes('Styles (20)')) {
  console.error('Package smoke failed. CLI list output does not include expected registry coverage.')
  process.exit(1)
}
const cliListJson = JSON.parse(execFileSync('node', ['bin/base-themes.mjs', 'list', '--json'], { encoding: 'utf8' }))
if (cliListJson.components?.length !== 40 || cliListJson.blocks?.length !== 8 || cliListJson.style?.variants?.length !== 20) {
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

const releaseAnnouncementJson = JSON.parse(execFileSync('node', ['scripts/render-release-announcement.mjs', '--json'], { encoding: 'utf8' }))
if (releaseAnnouncementJson.stats.components !== registry.components.length || releaseAnnouncementJson.stats.blocks !== registry.blocks.length || releaseAnnouncementJson.stats.pages !== registry.pages.length || releaseAnnouncementJson.stats.styles !== registry.style.variants.length) {
  console.error('Package smoke failed. Release announcement stats are not sourced from the current registry.')
  process.exit(1)
}
if (!releaseAnnouncementJson.githubRelease.includes('`add`') || !releaseAnnouncementJson.githubRelease.includes('Show and tell Discussion') || !releaseAnnouncementJson.commands.includes('npx base-themes doctor . --json')) {
  console.error('Package smoke failed. Release announcement output is missing add, community, or JSON CLI guidance.')
  process.exit(1)
}
if (!Array.isArray(releaseAnnouncementJson.recommendedGoodFirstIssues) || releaseAnnouncementJson.recommendedGoodFirstIssues.length < 2 || !releaseAnnouncementJson.recommendedGoodFirstIssues.every((issue) => issue.title && issue.url?.startsWith('https://github.com/markbang/base-themes/issues/new?') && issue.labels?.includes('type: good first issue'))) {
  console.error('Package smoke failed. Release announcement should include at least two recommended good-first issue URLs.')
  process.exit(1)
}
if (!releaseAnnouncementJson.recommendedGoodFirstIssues.every((issue) => releaseAnnouncementJson.githubRelease.includes(issue.url))) {
  console.error('Package smoke failed. GitHub release copy should include recommended good-first issue URLs.')
  process.exit(1)
}
const releaseGithubChannel = releaseAnnouncementJson.channelChecklist?.find((item) => item.channel === 'GitHub Release')
if (!releaseAnnouncementJson.recommendedGoodFirstIssues.every((issue) => releaseGithubChannel?.recommendedIssueUrls?.includes(issue.url))) {
  console.error('Package smoke failed. GitHub Release channel checklist should include recommended good-first issue URLs.')
  process.exit(1)
}
if (!Array.isArray(releaseAnnouncementJson.shareAssets) || releaseAnnouncementJson.shareAssets.length < 4 || !releaseAnnouncementJson.shareAssets.every((asset) => asset.id && asset.title && asset.url?.includes('utm_campaign=') && asset.imageUrl?.startsWith('https://base-themes.bangwu.me/previews/') && asset.use)) {
  console.error('Package smoke failed. Release announcement should include structured share assets with attributed URLs and preview images.')
  process.exit(1)
}
for (const assetId of ['dashboard-shell-block', 'enterprise-theme-preview', 'base-ui-vs-shadcn', 'cli-doctor-workflow']) {
  if (!releaseAnnouncementJson.shareAssets.some((asset) => asset.id === assetId)) {
    console.error(`Package smoke failed. Release announcement share assets are missing ${assetId}.`)
    process.exit(1)
  }
}
const releaseAnnouncementChannels = ['GitHub Release', 'X / Bluesky', 'Hacker News / Reddit', 'Product / devtool directories']
const missingReleaseAnnouncementChannels = releaseAnnouncementChannels.filter((channel) => !releaseAnnouncementJson.channelChecklist?.some((item) => item.channel === channel && item.action && item.measure && item.primaryLink))
if (missingReleaseAnnouncementChannels.length > 0) {
  console.error(`Package smoke failed. Release announcement channel tracking checklist is missing: ${missingReleaseAnnouncementChannels.join(', ')}`)
  process.exit(1)
}
const releaseShareAssetIds = new Set(releaseAnnouncementJson.shareAssets.map((asset) => asset.id))
const channelsMissingShareAssetIds = releaseAnnouncementJson.channelChecklist.filter((item) => !Array.isArray(item.shareAssetIds) || item.shareAssetIds.length === 0)
if (channelsMissingShareAssetIds.length > 0) {
  console.error(`Package smoke failed. Release announcement channels are missing shareAssetIds: ${channelsMissingShareAssetIds.map((item) => item.channel).join(', ')}`)
  process.exit(1)
}
const unknownReleaseShareAssetIds = releaseAnnouncementJson.channelChecklist.flatMap((item) => item.shareAssetIds ?? []).filter((id) => !releaseShareAssetIds.has(id))
if (unknownReleaseShareAssetIds.length > 0) {
  console.error(`Package smoke failed. Release announcement channels reference unknown share asset ids: ${unknownReleaseShareAssetIds.join(', ')}`)
  process.exit(1)
}
const unattributedAnnouncementChannels = releaseAnnouncementJson.channelChecklist.filter((item) => !['utm_campaign', 'utm_source', 'utm_medium', 'utm_content'].every((param) => item.primaryLink.includes(`${param}=`)))
if (unattributedAnnouncementChannels.length > 0 || !releaseAnnouncementJson.attribution?.campaign) {
  console.error('Package smoke failed. Release announcement channel links are missing launch attribution parameters.')
  process.exit(1)
}
const releaseAnnouncementMeasureText = releaseAnnouncementJson.channelChecklist.map((item) => item.measure).join('\n').toLowerCase()
const missingReleaseAnnouncementMeasures = ['stars', 'forks', 'issues', 'registry', 'npm'].filter((measure) => !releaseAnnouncementMeasureText.includes(measure))
if (missingReleaseAnnouncementMeasures.length > 0) {
  console.error(`Package smoke failed. Release announcement channel checklist is missing adoption measures: ${missingReleaseAnnouncementMeasures.join(', ')}`)
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

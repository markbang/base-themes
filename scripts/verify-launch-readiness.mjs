import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import packageJson from '../package.json' with { type: 'json' }

const requiredScripts = [
  'registry:check',
  'tokens:check',
  'seo:check',
  'analytics:check',
  'community:check',
  'community:issues',
  'release:announce',
  'telemetry:collect',
  'telemetry:check',
  'telemetry:fixtures',
  'package:smoke',
  'bundle:report',
  'launch:status',
  'launch:actions',
  'launch:campaign',
]

const requiredReleaseLinks = {
  repo: 'https://github.com/markbang/base-themes',
  docs: 'https://base-themes.bangwu.me',
  registry: 'https://base-themes.bangwu.me/registry/registry.json',
  cli: 'https://base-themes.bangwu.me/docs/cli',
  blocks: 'https://base-themes.bangwu.me/blocks',
  llms: 'https://base-themes.bangwu.me/llms.txt',
  llmsFull: 'https://base-themes.bangwu.me/llms-full.txt',
  fork: 'https://github.com/markbang/base-themes/fork',
  showAndTell: 'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  featureRequest: 'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
  gallerySubmission: 'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
  goodFirstIssues: 'https://github.com/markbang/base-themes/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22',
}

function fail(message, details = []) {
  console.error(`Launch readiness invalid: ${message}`)
  for (const detail of details) console.error(`- ${detail}`)
  process.exit(1)
}

const missingScripts = requiredScripts.filter((script) => !packageJson.scripts?.[script])
if (missingScripts.length > 0) {
  fail('package.json is missing required release/adoption scripts', missingScripts)
}

const releaseChecklist = readFileSync('RELEASE.md', 'utf8')
const releaseKit = readFileSync('docs/release-announcement-kit.md', 'utf8')
const adoptionDashboard = readFileSync('docs/adoption-dashboard.md', 'utf8')

const requiredReleaseChecklistPhrases = [
  'npm run launch:check',
  'npm run release:announce -- --json',
  'npm run community:issues -- --json',
  'npm run telemetry:collect',
  'npm run telemetry:check',
  'npm run telemetry:check -- --live',
  'npm run telemetry:fixtures',
  'npm run launch:status',
  'npm run launch:status -- --live',
  'npm run launch:actions',
  'npm run launch:actions -- --live',
  'npm run launch:campaign',
  'public adoption gate',
]
const missingReleaseChecklistPhrases = requiredReleaseChecklistPhrases.filter((phrase) => !releaseChecklist.includes(phrase))
if (missingReleaseChecklistPhrases.length > 0) {
  fail('RELEASE.md is missing launch/adoption checklist coverage', missingReleaseChecklistPhrases)
}

const requiredReleaseKitPhrases = [
  'npm run launch:check',
  'npm run launch:actions',
  'npm run launch:campaign',
  'at least three external channels',
  'star the repo',
  'fork it',
  'Show and tell Discussion',
  'community gallery issue template',
  '24 hours, 7 days, and 30 days',
  'T+1 day',
  'T+7 days',
  'T+30 days',
  'shareAssets',
  'signalTrends',
  'refuses to overwrite',
  '--force',
  'refuses to save a campaign pack when telemetry is incomplete',
  '--allow-incomplete',
]
const missingReleaseKitPhrases = requiredReleaseKitPhrases.filter((phrase) => !releaseKit.includes(phrase))
if (missingReleaseKitPhrases.length > 0) {
  fail('release announcement kit is missing launch/adoption guidance', missingReleaseKitPhrases)
}

const requiredForkWorkflowPhrases = [
  'Fork-To-First-Change',
  'Fork-to-first-change',
  'npm run example:theme-customization:build',
  'npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json',
]
const readme = readFileSync('README.md', 'utf8')
const staticDocs = readFileSync('src/docs/StaticDocsPages.tsx', 'utf8')
const missingForkWorkflowPhrases = requiredForkWorkflowPhrases.filter((phrase) => ![readme, staticDocs, releaseKit].some((source) => source.includes(phrase)))
if (missingForkWorkflowPhrases.length > 0) {
  fail('fork-to-first-change workflow must be documented before asking users for forks', missingForkWorkflowPhrases)
}

const requiredGatePhrases = [
  'Current public adoption score: **1/4**',
  'at least three of the four public signals pass',
  'Do not mark the strategy complete while the adoption score is below `3/4`',
  'Latest campaign pack: [research/launch-actions-',
  'Latest external-action evidence: [research/launch-evidence-',
  'record fields for external post URLs plus T+1, T+7, and T+30 telemetry evidence',
]
const missingGatePhrases = requiredGatePhrases.filter((phrase) => !adoptionDashboard.includes(phrase))
if (missingGatePhrases.length > 0) {
  fail('adoption dashboard is missing explicit non-completion gate language', missingGatePhrases)
}

const latestCampaignPackMatch = adoptionDashboard.match(/\[research\/(launch-actions-\d{4}-\d{2}-\d{2}\.md)\]\(\.\.\/research\/\1\)/)
if (!latestCampaignPackMatch) {
  fail('adoption dashboard must link the latest generated launch campaign pack')
}

const latestCampaignPackPath = `research/${latestCampaignPackMatch[1]}`
if (!existsSync(latestCampaignPackPath)) {
  fail('adoption dashboard references a launch campaign pack that does not exist', [latestCampaignPackPath])
}

const latestCampaignPack = readFileSync(latestCampaignPackPath, 'utf8')
const requiredCampaignPackPhrases = [
  'Campaign checklist:',
  'Promotion wave:',
  'Post URL:',
  'T+1 day measurement',
  'T+7 day measurement',
  'T+30 day measurement',
]
const missingCampaignPackPhrases = requiredCampaignPackPhrases.filter((phrase) => !latestCampaignPack.includes(phrase))
if (missingCampaignPackPhrases.length > 0) {
  fail('latest launch campaign pack is missing execution evidence fields', missingCampaignPackPhrases)
}

const latestEvidenceMatch = adoptionDashboard.match(/\[research\/(launch-evidence-\d{4}-\d{2}-\d{2}\.md)\]\(\.\.\/research\/\1\)/)
if (!latestEvidenceMatch) {
  fail('adoption dashboard must link the latest external-action evidence file')
}

const latestEvidencePath = `research/${latestEvidenceMatch[1]}`
if (!existsSync(latestEvidencePath)) {
  fail('adoption dashboard references an external-action evidence file that does not exist', [latestEvidencePath])
}

const latestEvidence = readFileSync(latestEvidencePath, 'utf8')
const requiredEvidencePhrases = [
  'Published GitHub Seed Issues',
  'GitHub Release Update',
  'GitHub Repository Discovery Surface',
  'GitHub Discussion',
  'not external human adoption signals',
  'https://github.com/markbang/base-themes/releases/tag/v0.1.2',
  'https://github.com/markbang/base-themes/issues/2',
  'https://github.com/markbang/base-themes/issues/3',
  'https://github.com/markbang/base-themes/discussions/4',
]
const missingEvidencePhrases = requiredEvidencePhrases.filter((phrase) => !latestEvidence.includes(phrase))
if (missingEvidencePhrases.length > 0) {
  fail('latest external-action evidence file is missing published issue evidence', missingEvidencePhrases)
}

const requiredDashboardReleaseChecks = [
  'npm run registry:check',
  'npm run lint',
  'npm run test',
  'npm run build',
  'npm run seo:check',
  'npm run bundle:report',
  'npm run analytics:check',
  'npm run community:check',
  'npm run telemetry:check',
  'npm run telemetry:check -- --live',
  'npm run telemetry:fixtures',
  'npm run launch:check',
  'npm run launch:status',
  'npm run launch:status -- --live',
  'npm run launch:actions',
  'npm run launch:actions -- --live',
  'npm run launch:campaign',
  'npm run package:smoke',
  'npm pack --dry-run',
]
const missingDashboardReleaseChecks = requiredDashboardReleaseChecks.filter((check) => !adoptionDashboard.includes(check))
if (missingDashboardReleaseChecks.length > 0) {
  fail('adoption dashboard release-readiness commands are not aligned with the current launch gate', missingDashboardReleaseChecks)
}

let announcement
try {
  announcement = JSON.parse(execFileSync('node', ['scripts/render-release-announcement.mjs', '--json'], { encoding: 'utf8' }))
} catch (error) {
  fail('release announcement must render valid JSON', [error.message])
}

let launchStatus
try {
  launchStatus = JSON.parse(execFileSync('node', ['scripts/render-launch-status.mjs', '--json'], { encoding: 'utf8' }))
} catch (error) {
  fail('launch status must render valid JSON from the latest telemetry report', [error.message])
}

let launchActions
try {
  launchActions = JSON.parse(execFileSync('node', ['scripts/render-launch-actions.mjs', '--json'], { encoding: 'utf8' }))
} catch (error) {
  fail('launch actions must render valid JSON from the latest telemetry and announcement data', [error.message])
}

if (launchStatus.completionThreshold !== 3 || launchStatus.signalCount !== 4) {
  fail('launch status must preserve the public adoption gate shape', [`got ${launchStatus.completionThreshold}/${launchStatus.signalCount}`])
}

if (typeof launchStatus.externallyValidated !== 'boolean' || typeof launchStatus.publicTelemetryComplete !== 'boolean' || !Array.isArray(launchStatus.telemetryErrors) || !Array.isArray(launchStatus.missingSignals) || !Array.isArray(launchStatus.signalTrends)) {
  fail('launch status JSON must include externallyValidated, publicTelemetryComplete, telemetryErrors, missingSignals, and signalTrends fields')
}

if (launchActions.completionThreshold !== 3 || launchActions.signalCount !== 4 || typeof launchActions.publicTelemetryComplete !== 'boolean' || !Array.isArray(launchActions.telemetryErrors) || !Array.isArray(launchActions.actions) || !Array.isArray(launchActions.signalTrends)) {
  fail('launch actions JSON must preserve the public adoption gate and expose telemetry completeness, signal trends, plus an action list')
}

if (!Array.isArray(launchActions.shareAssets) || launchActions.shareAssets.length < 4) {
  fail('launch actions JSON must include share assets from the release announcement pack')
}

if (!Array.isArray(launchActions.channelChecklist) || launchActions.channelChecklist.length < 4) {
  fail('launch actions JSON must include the release channel checklist')
}

if (!Array.isArray(launchActions.promotionWave) || launchActions.promotionWave.length < 4) {
  fail('launch actions JSON must include a channel promotion wave')
}

if (!Array.isArray(launchActions.campaignChecklist) || launchActions.campaignChecklist.length < 7) {
  fail('launch actions JSON must include a campaign execution checklist')
}

const launchActionShareAssetIds = new Set(launchActions.shareAssets.map((asset) => asset.id))
const launchActionChannelsMissingShareAssets = launchActions.channelChecklist.filter((item) => !Array.isArray(item.shareAssetIds) || item.shareAssetIds.length === 0)
if (launchActionChannelsMissingShareAssets.length > 0) {
  fail('launch action channel checklist entries must include shareAssetIds', launchActionChannelsMissingShareAssets.map((item) => item.channel ?? '(unknown channel)'))
}

const incompletePromotionWave = launchActions.promotionWave.filter((item) => !item.channel || !item.copy || !item.primaryLink || !item.action || !item.measure || !Array.isArray(item.targetSignals) || item.targetSignals.length === 0 || !Array.isArray(item.shareAssets) || item.shareAssets.length === 0)
if (incompletePromotionWave.length > 0) {
  fail('launch action promotion wave entries must include copy, target signals, primary links, share assets, actions, and measures', incompletePromotionWave.map((item) => item.channel ?? '(unknown channel)'))
}

const unknownLaunchActionShareAssetIds = launchActions.channelChecklist.flatMap((item) => item.shareAssetIds ?? []).filter((id) => !launchActionShareAssetIds.has(id))
if (unknownLaunchActionShareAssetIds.length > 0) {
  fail('launch action channel checklist references unknown share asset ids', unknownLaunchActionShareAssetIds)
}

const unknownPromotionWaveShareAssetIds = launchActions.promotionWave.flatMap((item) => item.shareAssetIds ?? []).filter((id) => !launchActionShareAssetIds.has(id))
if (unknownPromotionWaveShareAssetIds.length > 0) {
  fail('launch action promotion wave references unknown share asset ids', unknownPromotionWaveShareAssetIds)
}

const incompleteCampaignChecklist = launchActions.campaignChecklist.filter((item) => !item.phase || !item.task || !item.evidence || !Array.isArray(item.recordFields) || item.recordFields.length === 0)
if (incompleteCampaignChecklist.length > 0) {
  fail('launch action campaign checklist entries must include phase, task, evidence, and record fields', incompleteCampaignChecklist.map((item) => item.phase ?? '(unknown phase)'))
}

const missingCampaignChannels = launchActions.promotionWave.map((item) => item.channel).filter((channel) => !launchActions.campaignChecklist.some((item) => item.channel === channel))
if (missingCampaignChannels.length > 0) {
  fail('launch action campaign checklist must include every promotion wave channel', missingCampaignChannels)
}

const campaignCommandText = launchActions.campaignChecklist.flatMap((item) => item.commands ?? []).join('\n')
const missingCampaignCommands = ['npm run launch:check', 'npm run launch:status -- --live', 'npm run telemetry:collect', 'npm run launch:actions'].filter((command) => !campaignCommandText.includes(command))
if (missingCampaignCommands.length > 0) {
  fail('launch action campaign checklist is missing required launch and measurement commands', missingCampaignCommands)
}

const missingLaunchActionIds = launchStatus.missingSignals
  .map((signal) => signal.id)
  .filter((id) => !launchActions.actions.some((action) => action.signalId === id))
if (missingLaunchActionIds.length > 0) {
  fail('launch actions must include one actionable block for each missing public signal', missingLaunchActionIds)
}

const forkAction = launchActions.actions.find((action) => action.signalId === 'forks')
if (forkAction && !forkAction.commands?.includes('npm run example:theme-customization:build')) {
  fail('launch actions must route the missing fork signal to the Fork-to-first-change workflow')
}

const missingAnnouncementLinks = Object.entries(requiredReleaseLinks)
  .filter(([key, value]) => announcement.links?.[key] !== value)
  .map(([key]) => key)
if (missingAnnouncementLinks.length > 0) {
  fail('release announcement JSON is missing direct launch/adoption links', missingAnnouncementLinks)
}

const announcementText = [
  announcement.githubRelease,
  announcement.social,
  announcement.forum,
  announcement.directory,
  ...(announcement.callsToAction ?? []),
].join('\n')
const missingAnnouncementText = Object.values(requiredReleaseLinks).filter((link) => !announcementText.includes(link))
if (missingAnnouncementText.length > 0) {
  fail('release announcement copy is missing direct launch/adoption URLs', missingAnnouncementText)
}

const requiredAnnouncementWorkflowText = [
  'Fork-to-first-change',
  'npm run example:theme-customization:build',
  'npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json',
  'Good-first issues to publish with this release',
]
const missingAnnouncementWorkflowText = requiredAnnouncementWorkflowText.filter((text) => !announcementText.includes(text))
if (missingAnnouncementWorkflowText.length > 0) {
  fail('release announcement copy must turn fork asks into a verifiable first-change workflow', missingAnnouncementWorkflowText)
}

const requiredCommands = [
  'npm install base-themes @base-ui/react react react-dom',
  'npx base-themes plan button select block:dashboard-shell theme:enterprise --json',
  'npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json',
  'npx base-themes doctor . --json',
]
const missingCommands = requiredCommands.filter((command) => !announcement.commands?.includes(command))
if (missingCommands.length > 0) {
  fail('release announcement commands are missing install, source-copy, or doctor actions', missingCommands)
}

const requiredChannels = ['GitHub Release', 'X / Bluesky', 'Hacker News / Reddit', 'Product / devtool directories']
const missingChannels = requiredChannels.filter((channel) => !announcement.channelChecklist?.some((item) => item.channel === channel))
if (missingChannels.length > 0) {
  fail('release announcement JSON is missing channel tracking checklist entries', missingChannels)
}

const incompleteChannels = announcement.channelChecklist.filter((item) => !item.action || !item.measure || !item.primaryLink)
if (incompleteChannels.length > 0) {
  fail('release channel checklist entries must include action, measure, and primaryLink', incompleteChannels.map((item) => item.channel ?? '(unknown channel)'))
}

const channelsMissingShareAssets = announcement.channelChecklist.filter((item) => !Array.isArray(item.shareAssetIds) || item.shareAssetIds.length === 0)
if (channelsMissingShareAssets.length > 0) {
  fail('release channel checklist entries must include shareAssetIds for execution-ready promotion', channelsMissingShareAssets.map((item) => item.channel ?? '(unknown channel)'))
}

const unattributedChannels = announcement.channelChecklist.filter((item) => !['utm_campaign', 'utm_source', 'utm_medium', 'utm_content'].every((param) => item.primaryLink.includes(`${param}=`)))
if (unattributedChannels.length > 0) {
  fail('release channel checklist primary links must include launch attribution parameters', unattributedChannels.map((item) => item.channel ?? '(unknown channel)'))
}

const channelCopyByName = {
  'GitHub Release': announcement.githubRelease,
  'X / Bluesky': announcement.social,
  'Hacker News / Reddit': announcement.forum,
  'Product / devtool directories': announcement.directory,
}
const channelsMissingAttributedCopy = announcement.channelChecklist.filter((item) => !channelCopyByName[item.channel]?.includes(item.primaryLink))
if (channelsMissingAttributedCopy.length > 0) {
  fail('release channel copy must include its attributed primaryLink, not only the checklist', channelsMissingAttributedCopy.map((item) => item.channel ?? '(unknown channel)'))
}

const channelsMissingStarAsk = announcement.channelChecklist.filter((item) => !/star (the )?repo/i.test(channelCopyByName[item.channel] ?? ''))
if (channelsMissingStarAsk.length > 0) {
  fail('release channel copy must ask for a repo star after trying the package', channelsMissingStarAsk.map((item) => item.channel ?? '(unknown channel)'))
}

if (!announcement.attribution?.campaign || !announcement.attribution?.parameters?.includes('utm_campaign')) {
  fail('release announcement JSON must expose launch attribution metadata')
}

if (!Array.isArray(announcement.shareAssets) || announcement.shareAssets.length < 4) {
  fail('release announcement JSON must include share assets for screenshots, block routes, and docs routes')
}

const invalidShareAssets = announcement.shareAssets.filter((asset) => !asset.id || !asset.title || !asset.type || !asset.url?.includes('utm_campaign=') || !asset.imageUrl?.startsWith('https://base-themes.bangwu.me/previews/') || !asset.use)
if (invalidShareAssets.length > 0) {
  fail('release share assets must include id, type, attributed URL, preview image URL, and usage guidance', invalidShareAssets.map((asset) => asset.id ?? asset.title ?? '(untitled)'))
}

const requiredShareAssetIds = ['dashboard-shell-block', 'enterprise-theme-preview', 'base-ui-vs-shadcn', 'cli-doctor-workflow']
const missingShareAssets = requiredShareAssetIds.filter((id) => !announcement.shareAssets.some((asset) => asset.id === id))
if (missingShareAssets.length > 0) {
  fail('release share assets must cover block, theme, forum, and directory launch surfaces', missingShareAssets)
}

const shareAssetIds = new Set(announcement.shareAssets.map((asset) => asset.id))
const unknownChecklistShareAssets = announcement.channelChecklist.flatMap((item) => item.shareAssetIds ?? []).filter((id) => !shareAssetIds.has(id))
if (unknownChecklistShareAssets.length > 0) {
  fail('release channel checklist references unknown share asset ids', unknownChecklistShareAssets)
}

const requiredChannelMeasures = ['stars', 'forks', 'issues', 'registry', 'npm']
const channelMeasureText = announcement.channelChecklist.map((item) => item.measure).join('\n').toLowerCase()
const missingChannelMeasures = requiredChannelMeasures.filter((measure) => !channelMeasureText.includes(measure))
if (missingChannelMeasures.length > 0) {
  fail('release channel checklist must map posts back to public adoption and registry signals', missingChannelMeasures)
}

let seedIssues
try {
  seedIssues = JSON.parse(execFileSync('node', ['scripts/render-contributor-issues.mjs', '--json'], { encoding: 'utf8' }))
} catch (error) {
  fail('contributor seed issues must render valid JSON', [error.message])
}

if (!Array.isArray(seedIssues) || seedIssues.length < 6) {
  fail('launch should have at least six contributor seed issues ready', [`got ${Array.isArray(seedIssues) ? seedIssues.length : 'non-array output'}`])
}

const goodFirstIssues = seedIssues.filter((issue) => issue.labels?.includes('type: good first issue'))
if (goodFirstIssues.length < 4) {
  fail('launch should have several good-first issue URLs ready before asking for contributors', [`got ${goodFirstIssues.length}`])
}

if (!Array.isArray(announcement.recommendedGoodFirstIssues) || announcement.recommendedGoodFirstIssues.length < 2) {
  fail('release announcement JSON must include at least two recommended good-first issues to publish')
}

const invalidRecommendedIssues = announcement.recommendedGoodFirstIssues.filter((issue) => !issue.title || !issue.url?.startsWith('https://github.com/markbang/base-themes/issues/new?') || !issue.labels?.includes('type: good first issue'))
if (invalidRecommendedIssues.length > 0) {
  fail('recommended good-first issues must include title, prefilled URL, and good-first label', invalidRecommendedIssues.map((issue) => issue.title ?? '(untitled)'))
}

const missingRecommendedIssueCopy = announcement.recommendedGoodFirstIssues.filter((issue) => !announcement.githubRelease.includes(issue.url))
if (missingRecommendedIssueCopy.length > 0) {
  fail('GitHub release copy must include recommended good-first issue URLs', missingRecommendedIssueCopy.map((issue) => issue.title))
}

const githubReleaseChannel = announcement.channelChecklist.find((item) => item.channel === 'GitHub Release')
const missingRecommendedIssueChecklistUrls = announcement.recommendedGoodFirstIssues.filter((issue) => !githubReleaseChannel?.recommendedIssueUrls?.includes(issue.url))
if (missingRecommendedIssueChecklistUrls.length > 0) {
  fail('GitHub Release channel checklist must include recommended good-first issue URLs', missingRecommendedIssueChecklistUrls.map((issue) => issue.title))
}

const externalIssueAction = launchActions.actions.find((action) => action.signalId === 'external-human-issue-or-pr')
const missingRecommendedLaunchActionUrls = announcement.recommendedGoodFirstIssues.filter((issue) => !externalIssueAction?.links?.includes(issue.url))
if (missingRecommendedLaunchActionUrls.length > 0) {
  fail('launch actions must include recommended good-first issue URLs for the missing external issue/PR signal', missingRecommendedLaunchActionUrls.map((issue) => issue.title))
}

if (!externalIssueAction?.commands?.some((command) => command.includes('gh issue create --repo markbang/base-themes'))) {
  fail('launch actions must include GitHub CLI commands for recommended good-first issues')
}

const externalIssueStatus = launchStatus.missingSignals.find((signal) => signal.id === 'external-human-issue-or-pr')
const missingRecommendedStatusUrls = announcement.recommendedGoodFirstIssues.filter((issue) => !externalIssueStatus?.recommendedGoodFirstIssues?.some((statusIssue) => statusIssue.url === issue.url))
if (missingRecommendedStatusUrls.length > 0) {
  fail('launch status must include recommended good-first issue URLs for the missing external issue/PR signal', missingRecommendedStatusUrls.map((issue) => issue.title))
}

const invalidSeedUrls = seedIssues.filter((issue) => !issue.url?.startsWith('https://github.com/markbang/base-themes/issues/new?'))
if (invalidSeedUrls.length > 0) {
  fail('contributor seed issues must include prefilled GitHub issue URLs', invalidSeedUrls.map((issue) => issue.title ?? '(untitled)'))
}

console.log(`Launch readiness valid: ${Object.keys(requiredReleaseLinks).length} adoption links, ${seedIssues.length} seed issues, ${goodFirstIssues.length} good-first issues`)

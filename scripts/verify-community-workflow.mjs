import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const labelManifestPath = '.github/labels.json'
const discussionTemplatePath = '.github/DISCUSSION_TEMPLATE/show-and-tell.yml'
const issueTemplatePaths = [
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/component_theme_block.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/gallery_submission.yml',
]
const seedPath = 'docs/contributor-issue-seeds.md'

const requiredLabels = [
  'type: bug',
  'type: feature',
  'type: docs',
  'type: theme',
  'type: component',
  'type: block',
  'type: registry',
  'type: accessibility',
  'type: performance',
  'type: gallery',
  'type: good first issue',
  'type: help wanted',
  'area: docs',
  'area: website',
  'area: components',
  'area: tokens',
  'area: registry',
  'area: ci',
  'area: examples',
  'priority: high',
  'priority: medium',
  'priority: low',
  'community',
  'help wanted',
]

function fail(message, details = []) {
  console.error(`Community workflow invalid: ${message}`)
  for (const detail of details) console.error(`- ${detail}`)
  process.exit(1)
}

function extractTemplateLabels(source, filePath) {
  const match = source.match(/^labels:\s*\[(.*)\]\s*$/m)
  if (!match) fail(`missing labels array in ${filePath}`)

  return match[1]
    .split(',')
    .map((label) => label.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function extractSeedLabelLines(source) {
  const matches = [...source.matchAll(/^type: .*$/gm)]
  return matches.map((match) => match[0])
}

function splitSeedLabels(labelLine) {
  return labelLine.split(',').map((label) => label.trim()).filter(Boolean)
}

const manifest = JSON.parse(await readFile(labelManifestPath, 'utf8'))
const manifestNames = new Set(manifest.map((label) => label.name))

const duplicateLabels = manifest
  .map((label) => label.name)
  .filter((name, index, labels) => labels.indexOf(name) !== index)
if (duplicateLabels.length) fail('label manifest has duplicate names', duplicateLabels)

const missingRequiredLabels = requiredLabels.filter((label) => !manifestNames.has(label))
if (missingRequiredLabels.length) fail('label manifest is missing required strategy labels', missingRequiredLabels)

const malformedLabels = manifest.filter((label) => !label.name || !/^[0-9a-f]{6}$/i.test(label.color) || !label.description)
if (malformedLabels.length) fail('label manifest entries must include name, six-digit color, and description', malformedLabels.map((label) => label.name ?? '(missing name)'))

const issueTemplateLabels = []
for (const filePath of issueTemplatePaths) {
  const source = await readFile(filePath, 'utf8')
  issueTemplateLabels.push(...extractTemplateLabels(source, filePath).map((label) => ({ label, filePath })))
}

const unknownTemplateLabels = issueTemplateLabels.filter(({ label }) => !manifestNames.has(label))
if (unknownTemplateLabels.length) {
  fail('issue templates reference labels missing from .github/labels.json', unknownTemplateLabels.map(({ label, filePath }) => `${filePath}: ${label}`))
}

const seedSource = await readFile(seedPath, 'utf8')
const seedLabels = extractSeedLabelLines(seedSource).flatMap(splitSeedLabels)
const unknownSeedLabels = seedLabels.filter((label) => !manifestNames.has(label))
if (unknownSeedLabels.length) fail('contributor issue seeds reference labels missing from .github/labels.json', unknownSeedLabels)

const seedCount = (seedSource.match(/^## Seed \d+:/gm) ?? []).length
if (seedCount < 6) fail('contributor issue seeds should keep at least six adoption-funnel seed issues')

const galleryTemplateSource = await readFile('.github/ISSUE_TEMPLATE/gallery_submission.yml', 'utf8')
if (!galleryTemplateSource.includes('Base Themes may feature this submission')) {
  fail('gallery submission template must include permission-to-feature language')
}

const issueTemplateConfigSource = await readFile('.github/ISSUE_TEMPLATE/config.yml', 'utf8')
const requiredIssueChooserLinks = [
  'Show and tell Discussion',
  'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  'Good first issues',
  'https://github.com/markbang/base-themes/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22',
  'Community gallery submission',
  'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
]
const missingIssueChooserLinks = requiredIssueChooserLinks.filter((text) => !issueTemplateConfigSource.includes(text))
if (missingIssueChooserLinks.length) {
  fail('issue template chooser must expose public adoption contact links', missingIssueChooserLinks)
}

const discussionTemplateSource = await readFile(discussionTemplatePath, 'utf8')
if (!discussionTemplateSource.includes('labels: ["community"]')) {
  fail('show-and-tell discussion template must carry the community label')
}

const requiredDiscussionPhrases = [
  'What worked, what was missing?',
  'community gallery submission',
  'opening a PR',
  'source-copy or agent workflow',
]
const missingDiscussionPhrases = requiredDiscussionPhrases.filter((phrase) => !discussionTemplateSource.includes(phrase))
if (missingDiscussionPhrases.length) {
  fail('show-and-tell discussion template is missing adoption feedback prompts', missingDiscussionPhrases)
}

let renderedSeeds
try {
  renderedSeeds = JSON.parse(execFileSync('node', ['scripts/render-contributor-issues.mjs', '--json'], { encoding: 'utf8' }))
} catch (error) {
  fail('render-contributor-issues script must emit valid JSON with --json', [error.message])
}

if (renderedSeeds.length !== seedCount) {
  fail('render-contributor-issues output count must match contributor seed count', [`expected ${seedCount}, got ${renderedSeeds.length}`])
}

const invalidRenderedSeeds = renderedSeeds.filter((seed) => !seed.title || !seed.body || !Array.isArray(seed.labels) || !seed.url?.startsWith('https://github.com/markbang/base-themes/issues/new?'))
if (invalidRenderedSeeds.length) {
  fail('rendered contributor issues must include title, labels, body, and prefilled GitHub issue URL', invalidRenderedSeeds.map((seed) => seed.title ?? `(seed ${seed.number ?? 'unknown'})`))
}

let announcement
try {
  announcement = JSON.parse(execFileSync('node', ['scripts/render-release-announcement.mjs', '--json'], { encoding: 'utf8' }))
} catch (error) {
  fail('render-release-announcement script must emit valid JSON with --json', [error.message])
}

const requiredAnnouncementLinks = {
  repo: 'https://github.com/markbang/base-themes',
  fork: 'https://github.com/markbang/base-themes/fork',
  showAndTell: 'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  featureRequest: 'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
  gallerySubmission: 'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
  goodFirstIssues: 'https://github.com/markbang/base-themes/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22',
}

const missingAnnouncementLinks = Object.entries(requiredAnnouncementLinks)
  .filter(([key, value]) => announcement.links?.[key] !== value)
  .map(([key]) => key)
if (missingAnnouncementLinks.length) {
  fail('release announcement JSON must expose direct adoption action links', missingAnnouncementLinks)
}

if (!Array.isArray(announcement.recommendedGoodFirstIssues) || announcement.recommendedGoodFirstIssues.length < 2) {
  fail('release announcement JSON must recommend at least two good-first seed issues')
}

const invalidRecommendedIssues = announcement.recommendedGoodFirstIssues.filter((issue) => !issue.title || !issue.url?.startsWith('https://github.com/markbang/base-themes/issues/new?') || !issue.labels?.includes('type: good first issue'))
if (invalidRecommendedIssues.length) {
  fail('recommended good-first seed issues must include title, labels, and prefilled URL', invalidRecommendedIssues.map((issue) => issue.title ?? '(untitled)'))
}

const githubReleaseChannel = announcement.channelChecklist?.find((item) => item.channel === 'GitHub Release')
const missingRecommendedIssueChecklistUrls = announcement.recommendedGoodFirstIssues.filter((issue) => !githubReleaseChannel?.recommendedIssueUrls?.includes(issue.url))
if (missingRecommendedIssueChecklistUrls.length) {
  fail('GitHub Release channel checklist must include recommended good-first issue URLs', missingRecommendedIssueChecklistUrls.map((issue) => issue.title))
}

const announcementText = [announcement.githubRelease, announcement.social, announcement.forum, announcement.directory, ...(announcement.callsToAction ?? [])].join('\n')
const missingAnnouncementPhrases = [
  requiredAnnouncementLinks.repo,
  requiredAnnouncementLinks.fork,
  requiredAnnouncementLinks.showAndTell,
  requiredAnnouncementLinks.featureRequest,
  requiredAnnouncementLinks.gallerySubmission,
  requiredAnnouncementLinks.goodFirstIssues,
  'Fork-to-first-change',
  'Good-first issues to publish with this release',
  'npm run example:theme-customization:build',
  'npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json',
  ...announcement.recommendedGoodFirstIssues.map((issue) => issue.url),
].filter((phrase) => !announcementText.includes(phrase))
if (missingAnnouncementPhrases.length) {
  fail('release announcement copy must include direct adoption action URLs', missingAnnouncementPhrases)
}

console.log(`Community workflow valid: ${manifest.length} labels, ${issueTemplateLabels.length} template label references, ${seedCount} seed issues`)

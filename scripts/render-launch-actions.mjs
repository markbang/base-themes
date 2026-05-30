import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function readJsonScript(scriptPath, args = []) {
  return JSON.parse(execFileSync('node', [scriptPath, ...args, '--json'], { encoding: 'utf8' }))
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`
}

function ghIssueCreateCommand(issue) {
  return [
    'gh issue create',
    '--repo markbang/base-themes',
    `--title ${shellQuote(issue.title)}`,
    `--label ${shellQuote(issue.labels.join(','))}`,
    `--body ${shellQuote(issue.body)}`,
  ].join(' ')
}

function buildStarAction(announcement) {
  return {
    signalId: 'github-stars',
    title: 'Earn repo stars from users who tried the package',
    objective: 'Reach at least 10 GitHub stars by asking for a star only after install, doctor, or docs exploration.',
    actions: [
      'Publish the GitHub Release draft and keep the install guide as the primary attributed link.',
      'Share the dashboard block route on X / Bluesky with one command and one explicit star ask.',
      'Post the Base UI-first workflow question to Hacker News or Reddit and ask users to star after trying it.',
      'Submit the CLI workflow to one product or devtool directory and ask users to try doctor before starring.',
    ],
    links: [
      announcement.links.repo,
      ...announcement.channelChecklist.map((item) => item.primaryLink),
    ],
    measure: 'Re-run npm run telemetry:collect and npm run launch:status at T+1 day and T+7 days.',
  }
}

function buildExternalIssueAction(announcement) {
  return {
    signalId: 'external-human-issue-or-pr',
    title: 'Convert trial users into one external issue or PR',
    objective: 'Get at least one non-maintainer, non-bot issue or PR by making the first contribution path obvious.',
    actions: [
      'Publish two recommended good-first issues before the first announcement wave.',
      'Link the recommended issues from the GitHub Release body or first release comment.',
      'Ask users who hit a blocker to open the smallest feature request, bug report, Show and tell Discussion, or gallery submission.',
      'Route contributors to comment on a good-first issue before opening a PR.',
    ],
    links: [
      announcement.links.goodFirstIssues,
      announcement.links.featureRequest,
      announcement.links.showAndTell,
      announcement.links.gallerySubmission,
      ...announcement.recommendedGoodFirstIssues.map((issue) => issue.url),
    ],
    commands: announcement.recommendedGoodFirstIssues.map(ghIssueCreateCommand),
    recommendedGoodFirstIssues: announcement.recommendedGoodFirstIssues.map((issue) => ({
      title: issue.title,
      url: issue.url,
    })),
    measure: 'Re-run npm run telemetry:collect after issues are published and after each announcement wave.',
  }
}

function buildForkAction(announcement) {
  return {
    signalId: 'forks',
    title: 'Turn customization interest into at least one fork',
    objective: 'Get one public fork from a user adapting a theme, block, docs example, or registry workflow.',
    actions: [
      'Ask customization-minded users to fork the repo instead of only copying snippets.',
      'Have them run the Fork-to-first-change workflow before opening a Discussion, issue, or PR.',
      'Point them at theme customization or registry-copy commands so the fork has a visible first result.',
    ],
    links: [announcement.links.fork, announcement.links.showAndTell, announcement.links.gallerySubmission],
    commands: [
      'npm run example:theme-customization:build',
      'npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json',
    ],
    measure: 'Re-run npm run telemetry:collect and confirm the forks signal in npm run launch:status.',
  }
}

function buildDownloadAction(announcement) {
  return {
    signalId: 'npm-weekly-downloads',
    title: 'Improve install conversion',
    objective: 'Grow npm weekly downloads through clearer install, CLI, docs, and registry entry points.',
    actions: [
      'Keep the install command first in release copy and README.',
      'Use the CLI docs and doctor command as the lowest-friction trial path.',
      'Share registry and block routes with attributed links so conversion is measurable.',
    ],
    links: [announcement.links.docs, announcement.links.cli, announcement.links.registry],
    commands: ['npm install base-themes @base-ui/react react react-dom', 'npx base-themes doctor .'],
    measure: 'Compare npm weekly download slope in the next telemetry report.',
  }
}

function actionForSignal(signal, announcement) {
  if (signal.id === 'github-stars') return buildStarAction(announcement)
  if (signal.id === 'external-human-issue-or-pr') return buildExternalIssueAction(announcement)
  if (signal.id === 'forks') return buildForkAction(announcement)
  if (signal.id === 'npm-weekly-downloads') return buildDownloadAction(announcement)
  return {
    signalId: signal.id,
    title: signal.label,
    objective: signal.nextAction,
    actions: [signal.nextAction],
    links: [announcement.links.docs],
    measure: 'Re-run npm run telemetry:collect and npm run launch:status.',
  }
}

function targetSignalsForChannel(channel) {
  if (channel === 'GitHub Release') return ['github-stars', 'external-human-issue-or-pr', 'forks']
  if (channel === 'X / Bluesky') return ['github-stars', 'forks']
  if (channel === 'Hacker News / Reddit') return ['github-stars', 'external-human-issue-or-pr', 'npm-weekly-downloads']
  if (channel === 'Product / devtool directories') return ['github-stars', 'npm-weekly-downloads']
  return ['github-stars']
}

function buildPromotionWave(announcement) {
  const shareAssetsById = new Map((announcement.shareAssets ?? []).map((asset) => [asset.id, asset]))
  const copyByChannel = {
    'GitHub Release': announcement.githubRelease,
    'X / Bluesky': announcement.social,
    'Hacker News / Reddit': announcement.forum,
    'Product / devtool directories': announcement.directory,
  }

  return (announcement.channelChecklist ?? []).map((item) => ({
    channel: item.channel,
    targetSignals: targetSignalsForChannel(item.channel),
    action: item.action,
    copy: copyByChannel[item.channel] ?? '',
    primaryLink: item.primaryLink,
    shareAssetIds: item.shareAssetIds ?? [],
    shareAssets: (item.shareAssetIds ?? []).map((id) => shareAssetsById.get(id)).filter(Boolean),
    recommendedIssueUrls: item.recommendedIssueUrls ?? [],
    measure: item.measure,
  }))
}

function buildCampaignChecklist(announcement, promotionWave) {
  return [
    {
      phase: 'Before promotion',
      task: 'Verify the release, telemetry, channel copy, issue URLs, and adoption gate before posting externally.',
      evidence: 'Passing launch readiness output and a current live launch status.',
      commands: ['npm run launch:check', 'npm run launch:status -- --live', 'npm run launch:actions -- --live'],
      links: [announcement.links.docs, announcement.links.repo],
      recordFields: ['Launch status output or file:', 'Verified by:', 'Verified at:'],
    },
    {
      phase: 'Before promotion',
      task: 'Publish two or three good-first issues so interested users have an immediate external contribution path.',
      evidence: 'Public issue URLs copied into the GitHub Release body or first release comment.',
      commands: announcement.recommendedGoodFirstIssues.map(ghIssueCreateCommand),
      links: announcement.recommendedGoodFirstIssues.map((issue) => issue.url),
      recordFields: ['Published issue URLs:', 'Release body or comment URL:', 'Published at:'],
    },
    ...promotionWave.map((item) => ({
      phase: 'Promotion wave',
      task: `Publish ${item.channel} copy with its attributed primary link and listed share assets.`,
      evidence: `Saved ${item.channel} post URL plus observed signals for ${item.targetSignals.join(', ')}.`,
      channel: item.channel,
      targetSignals: item.targetSignals,
      shareAssetIds: item.shareAssetIds,
      links: [item.primaryLink],
      recordFields: ['Post URL:', 'Posted at:', 'Observed response:', 'Follow-up owner:'],
    })),
    {
      phase: 'T+1 day measurement',
      task: 'Collect early telemetry and compare stars, forks, external issues or PRs, docs visits, and npm slope.',
      evidence: 'Saved telemetry report and launch status after the first 24 hours.',
      commands: ['npm run telemetry:collect', 'npm run telemetry:check', 'npm run launch:status'],
      recordFields: ['Telemetry report path:', 'Launch status score:', 'Decision notes:'],
    },
    {
      phase: 'T+7 day measurement',
      task: 'Compare channel performance and decide whether to repeat, refine, or pivot the announcement wave.',
      evidence: 'Launch status plus notes on which channel produced public GitHub or npm movement.',
      commands: ['npm run telemetry:collect', 'npm run launch:status', 'npm run launch:actions'],
      recordFields: ['Telemetry report path:', 'Launch status score:', 'Channel decision:'],
    },
    {
      phase: 'T+30 day measurement',
      task: 'Decide whether the strategy is externally validated or needs another product/docs/community iteration.',
      evidence: 'Adoption dashboard updated from public telemetry and supporting analytics exports.',
      commands: ['npm run telemetry:collect', 'npm run launch:status', 'npm run launch:actions'],
      recordFields: ['Telemetry report path:', 'Launch status score:', 'Strategy decision:'],
    },
  ]
}

function buildPayload(status, announcement) {
  const missingSignals = status.missingSignals ?? []
  const promotionWave = buildPromotionWave(announcement)
  return {
    generatedAt: new Date().toISOString(),
    telemetryReport: status.telemetryReport,
    score: status.score,
    completionThreshold: status.completionThreshold,
    signalCount: status.signalCount,
    externallyValidated: status.externallyValidated,
    publicTelemetryComplete: status.publicTelemetryComplete,
    telemetryErrors: status.telemetryErrors ?? [],
    previousTelemetryReport: status.previousTelemetryReport,
    signalTrends: status.signalTrends ?? [],
    conclusion: status.conclusion,
    actions: missingSignals.map((signal) => actionForSignal(signal, announcement)),
    shareAssets: announcement.shareAssets ?? [],
    channelChecklist: announcement.channelChecklist,
    promotionWave,
    campaignChecklist: buildCampaignChecklist(announcement, promotionWave),
  }
}

function indentBlock(value) {
  return value.split('\n').map((line) => `    ${line}`).join('\n')
}

function argValue(name, fallback) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : fallback
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const protectedRecordFieldLabels = [
  'Launch status output or file',
  'Verified by',
  'Verified at',
  'Published issue URLs',
  'Release body or comment URL',
  'Published at',
  'Post URL',
  'Posted at',
  'Observed response',
  'Follow-up owner',
  'Telemetry report path',
  'Launch status score',
  'Decision notes',
  'Channel decision',
  'Strategy decision',
]

function filledRecordFields(markdown) {
  return protectedRecordFieldLabels.filter((label) => {
    const pattern = new RegExp(`^\\s*-\\s+${escapeRegExp(label)}:[^\\S\\r\\n]+\\S`, 'm')
    return pattern.test(markdown)
  })
}

function assertSafeCampaignOverwrite(markdownPath) {
  if (process.argv.includes('--force') || !existsSync(markdownPath)) return

  const existingMarkdown = readFileSync(markdownPath, 'utf8')
  const filledFields = filledRecordFields(existingMarkdown)
  if (filledFields.length === 0) return

  console.error(`Refusing to overwrite ${markdownPath} because it contains filled campaign record fields: ${filledFields.join(', ')}`)
  console.error('Move the filled evidence to a separate ledger or rerun with --force if overwriting it is intentional.')
  process.exit(1)
}

function assertCompleteCampaignPayload(payload) {
  if (process.argv.includes('--allow-incomplete')) return
  if (payload.publicTelemetryComplete && payload.telemetryErrors.length === 0) return

  console.error('Refusing to write launch campaign files because telemetry is incomplete.')
  for (const error of payload.telemetryErrors) console.error(`- ${error}`)
  console.error('Rerun after telemetry succeeds, or pass --allow-incomplete to intentionally write a diagnostic campaign pack.')
  process.exit(1)
}

function renderText(payload) {
  const actionBlocks = payload.actions.length
    ? payload.actions.map((action) => {
      const commands = action.commands?.length
        ? `\nCommands:\n${action.commands.map((command) => `- ${command}`).join('\n')}`
        : ''
      const recommended = action.recommendedGoodFirstIssues?.length
        ? `\nRecommended good-first issues:\n${action.recommendedGoodFirstIssues.map((issue) => `- ${issue.title}: ${issue.url}`).join('\n')}`
        : ''
      const recommendedUrls = new Set(action.recommendedGoodFirstIssues?.map((issue) => issue.url) ?? [])
      const links = action.links.filter((link) => !recommendedUrls.has(link))

      return `## ${action.title}

Signal: ${action.signalId}
Objective: ${action.objective}

Actions:
${action.actions.map((item) => `- ${item}`).join('\n')}

Links:
${links.map((link) => `- ${link}`).join('\n')}${commands}${recommended}

Measure: ${action.measure}`
    }).join('\n\n')
    : 'No missing public adoption signals. Keep measuring slope after promotion.'
  const channelChecklist = payload.channelChecklist?.length
    ? payload.channelChecklist.map((item) => `- ${item.channel}: ${item.action} Assets: ${(item.shareAssetIds ?? []).join(', ')} Measure: ${item.measure} Link: ${item.primaryLink}`).join('\n')
    : '- None'
  const promotionWave = payload.promotionWave?.length
    ? payload.promotionWave.map((item) => `## ${item.channel}

Target signals: ${item.targetSignals.join(', ')}
Primary link: ${item.primaryLink}
Share assets: ${item.shareAssetIds.join(', ')}
Action: ${item.action}
Measure: ${item.measure}

Copy:
${indentBlock(item.copy)}`).join('\n\n')
    : '- None'
  const campaignChecklist = payload.campaignChecklist?.length
    ? payload.campaignChecklist.map((item) => {
      const commands = item.commands?.length ? `\n  Commands:\n${item.commands.map((command) => indentBlock(`- ${command}`)).join('\n')}` : ''
      const links = item.links?.length ? `\n  Links:\n${item.links.map((link) => indentBlock(`- ${link}`)).join('\n')}` : ''
      const assets = item.shareAssetIds?.length ? `\n  Assets: ${item.shareAssetIds.join(', ')}` : ''
      const targets = item.targetSignals?.length ? `\n  Target signals: ${item.targetSignals.join(', ')}` : ''
      const recordFields = item.recordFields?.length ? `\n  Record:\n${item.recordFields.map((field) => indentBlock(`- ${field}`)).join('\n')}` : ''
      return `- [ ] ${item.phase}: ${item.task}\n  Evidence: ${item.evidence}${targets}${assets}${links}${commands}${recordFields}`
    }).join('\n')
    : '- None'
  const signalTrends = payload.signalTrends?.length
    ? payload.signalTrends.map((signal) => {
      const delta = typeof signal.delta === 'number' ? ` Delta: ${signal.delta >= 0 ? '+' : ''}${signal.delta}.` : ''
      return `- ${signal.label}: ${signal.current ?? 'n/a'} (previous ${signal.previous ?? 'n/a'}).${delta}`
    }).join('\n')
    : '- No previous telemetry report is available for slope comparison.'

  return `# Launch Actions

Telemetry report: ${payload.telemetryReport}
Public adoption score: ${payload.score ?? 'n/a'}
Completion gate: ${payload.completionThreshold}/${payload.signalCount} public signals
Externally validated: ${payload.externallyValidated ? 'yes' : 'no'}
Public telemetry complete: ${payload.publicTelemetryComplete ? 'yes' : 'no'}
Previous telemetry report: ${payload.previousTelemetryReport ?? 'none'}

${actionBlocks}

Signal trend:
${signalTrends}

Share assets:
${payload.shareAssets.length ? payload.shareAssets.map((asset) => `- ${asset.title}: ${asset.url} Image: ${asset.imageUrl}`).join('\n') : '- None'}

Channel checklist:
${channelChecklist}

Promotion wave:
${promotionWave}

Campaign checklist:
${campaignChecklist}

Telemetry errors:
${payload.telemetryErrors.length ? payload.telemetryErrors.map((error) => `- ${error}`).join('\n') : '- None'}

Conclusion: ${payload.conclusion}
`
}

function writeLaunchActions(payload, text) {
  const outputDir = argValue('--output', 'research')
  const basename = `launch-actions-${payload.generatedAt.slice(0, 10)}`
  const jsonPath = join(outputDir, `${basename}.json`)
  const markdownPath = join(outputDir, `${basename}.md`)
  const written = { jsonPath, markdownPath }

  assertCompleteCampaignPayload(payload)
  assertSafeCampaignOverwrite(markdownPath)

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(jsonPath, `${JSON.stringify({ ...payload, written }, null, 2)}\n`)
  writeFileSync(markdownPath, text)

  return written
}

const status = readJsonScript('scripts/render-launch-status.mjs', process.argv.includes('--live') ? ['--live'] : [])
const announcement = readJsonScript('scripts/render-release-announcement.mjs')
const payload = buildPayload(status, announcement)
const text = renderText(payload)
const written = process.argv.includes('--write') ? writeLaunchActions(payload, text) : undefined

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(written ? { ...payload, written } : payload, null, 2))
} else {
  console.log(text)
  if (written) {
    console.log(`Wrote launch actions: ${written.markdownPath} and ${written.jsonPath}`)
  }
}

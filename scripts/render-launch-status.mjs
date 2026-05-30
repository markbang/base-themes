import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

function fail(message, details = []) {
  console.error(`Launch status unavailable: ${message}`)
  for (const detail of details) console.error(`- ${detail}`)
  process.exit(1)
}

function telemetryDate(filePath) {
  return basename(filePath).match(/^telemetry-(\d{4}-\d{2}-\d{2})\.(json|md)$/)?.[1]
}

function telemetrySources() {
  const byDate = new Map()

  for (const file of readdirSync(resolve('research')).filter((name) => /^telemetry-\d{4}-\d{2}-\d{2}\.(json|md)$/.test(name)).sort()) {
    const filePath = resolve('research', file)
    const date = telemetryDate(filePath)
    const current = byDate.get(date)
    if (!current || file.endsWith('.json')) byDate.set(date, filePath)
  }

  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, filePath]) => filePath)
}

function latestTelemetryPath() {
  const files = telemetrySources()

  return files.length ? files.at(-1) : undefined
}

function previousTelemetryPath(currentSource, currentGeneratedAt) {
  const files = telemetrySources()
  if (!currentSource) return undefined

  if (currentSource === 'live collect-telemetry') {
    const currentDate = currentGeneratedAt ?? new Date().toISOString().slice(0, 10)
    return files.filter((filePath) => telemetryDate(filePath) < currentDate).at(-1)
  }

  const currentIndex = files.indexOf(resolve(currentSource))
  if (currentIndex <= 0) return undefined
  return files[currentIndex - 1]
}

function loadTelemetry(filePath) {
  if (filePath.endsWith('.md')) return loadMarkdownTelemetry(filePath)

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    fail('latest telemetry JSON could not be parsed', [`${filePath}: ${error.message}`])
  }
}

function numericSignalValue(value) {
  const match = String(value).match(/\d+/)
  return match ? Number(match[0]) : value
}

function signalFromMarkdownRow(label, current, status) {
  const normalized = label.toLowerCase()
  const passed = /^pass$/i.test(status.trim())

  if (normalized.startsWith('npm weekly downloads')) {
    return { id: 'npm-weekly-downloads', label: 'npm weekly downloads >= 100', threshold: '>= 100', current: numericSignalValue(current), passed }
  }

  if (normalized.startsWith('github stars')) {
    return { id: 'github-stars', label: 'GitHub stars >= 10', threshold: '>= 10', current: numericSignalValue(current), passed }
  }

  if (normalized.startsWith('external human issue or pr')) {
    return { id: 'external-human-issue-or-pr', label: 'External human issue or PR present', threshold: '> 0 external non-maintainer, non-bot issue or PR', current: numericSignalValue(current), passed }
  }

  if (normalized.startsWith('at least one fork')) {
    return { id: 'forks', label: 'At least one fork', threshold: '> 0', current: numericSignalValue(current), passed }
  }

  return undefined
}

function loadMarkdownTelemetry(filePath) {
  const markdown = readFileSync(filePath, 'utf8')
  const adoptionSection = markdown.match(/## Adoption Status\n\n([\s\S]*?)(?=\n## )/)?.[1] ?? ''
  const signals = adoptionSection
    .split('\n')
    .map((line) => line.match(/^\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/))
    .filter(Boolean)
    .map((match) => signalFromMarkdownRow(match[1], match[2], match[3]))
    .filter(Boolean)

  if (signals.length === 0) {
    fail('historical telemetry Markdown could not be parsed', [filePath])
  }

  const passedSignals = signals.filter((signal) => signal.passed).length
  const signalCount = signals.length
  const completionThreshold = 3

  return {
    generatedAt: telemetryDate(filePath),
    repo: 'markbang/base-themes',
    packageName: 'base-themes',
    adoption: {
      completionThreshold,
      passedSignals,
      signalCount,
      score: `${passedSignals}/${signalCount}`,
      externallyValidated: passedSignals >= completionThreshold,
      signals,
    },
    errors: [],
  }
}

function loadLiveTelemetry() {
  try {
    return JSON.parse(execFileSync('node', ['scripts/collect-telemetry.mjs', '--json', '--no-write'], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }))
  } catch (error) {
    fail('live telemetry could not be collected', [error.message])
  }
}

function parseFencedValue(section, label) {
  const fence = '```'
  const match = section.match(new RegExp(`${label}:\\s*\\n\\n${fence}(?:md|text)?\\n([\\s\\S]*?)\\n${fence}`))
  return match?.[1]?.trim()
}

function recommendedGoodFirstIssues() {
  const repoUrl = 'https://github.com/markbang/base-themes'
  const source = readFileSync('docs/contributor-issue-seeds.md', 'utf8')
  return source.split(/^## Seed \d+: /m).slice(1).map((section) => {
    const title = parseFencedValue(section, 'Title')
    const labels = parseFencedValue(section, 'Labels')
      ?.split(',')
      .map((label) => label.trim())
      .filter(Boolean)
    const body = parseFencedValue(section, 'Body')

    if (!title || !labels?.includes('type: good first issue') || !body) return undefined

    const search = new URLSearchParams()
    search.set('title', title)
    search.set('labels', labels.join(','))
    search.set('body', body)

    return {
      title,
      url: `${repoUrl}/issues/new?${search.toString()}`,
    }
  }).filter(Boolean).slice(0, 2)
}

function missingSignals(payload) {
  return (payload.adoption?.signals ?? []).filter((signal) => !signal.passed)
}

function nextAction(signal) {
  if (signal.id === 'github-stars') {
    return 'Share the release through at least three external channels and ask for one repo star from users who try it.'
  }

  if (signal.id === 'external-human-issue-or-pr') {
    return 'Publish prepared good-first issues and route users to feature, bug, Show and tell, or gallery links after first use.'
  }

  if (signal.id === 'forks') {
    return 'Ask users who want to adapt a theme, block, or docs example to fork the repo, run the Fork-to-first-change workflow, and share the changed example or block.'
  }

  if (signal.id === 'npm-weekly-downloads') {
    return 'Improve install snippets, README positioning, npm metadata, examples, and release-channel traffic.'
  }

  return 'Re-run telemetry after launch activity and compare the adoption slope.'
}

function buildSignalTrends(currentTelemetry, previousTelemetry) {
  if (!previousTelemetry) return []

  const previousSignalsById = new Map((previousTelemetry.adoption?.signals ?? []).map((signal) => [signal.id, signal]))
  return (currentTelemetry.adoption?.signals ?? []).map((signal) => {
    const previous = previousSignalsById.get(signal.id)
    const currentValue = typeof signal.current === 'number' ? signal.current : undefined
    const previousValue = typeof previous?.current === 'number' ? previous.current : undefined
    const delta = currentValue !== undefined && previousValue !== undefined ? currentValue - previousValue : undefined

    return {
      id: signal.id,
      label: signal.label,
      current: signal.current,
      previous: previous?.current ?? null,
      delta: delta ?? null,
      changed: delta !== undefined ? delta !== 0 : signal.current !== previous?.current,
      passed: signal.passed,
      previouslyPassed: previous?.passed ?? null,
    }
  })
}

function buildPayload(telemetry, source, previousTelemetry, previousSource) {
  const adoption = telemetry.adoption ?? {}
  const failedSignals = missingSignals(telemetry)
  const goodFirstIssues = recommendedGoodFirstIssues()
  const telemetryErrors = Array.isArray(telemetry.errors) ? telemetry.errors : []

  return {
    generatedAt: new Date().toISOString(),
    telemetryReport: basename(source),
    telemetryGeneratedAt: telemetry.generatedAt,
    repo: telemetry.repo,
    packageName: telemetry.packageName,
    score: adoption.score,
    passedSignals: adoption.passedSignals,
    signalCount: adoption.signalCount,
    completionThreshold: adoption.completionThreshold,
    externallyValidated: Boolean(adoption.externallyValidated),
    publicTelemetryComplete: telemetryErrors.length === 0,
    telemetryErrors,
    publicSignals: adoption.signals ?? [],
    previousTelemetryReport: previousSource ? basename(previousSource) : null,
    signalTrends: buildSignalTrends(telemetry, previousTelemetry),
    missingSignals: failedSignals.map((signal) => {
      const missingSignal = {
        id: signal.id,
        label: signal.label,
        current: signal.current,
        threshold: signal.threshold,
        nextAction: nextAction(signal),
      }

      if (signal.id === 'external-human-issue-or-pr') {
        missingSignal.recommendedGoodFirstIssues = goodFirstIssues
      }

      return missingSignal
    }),
    supportingEvidence: {
      githubTraffic: Boolean(telemetry.github?.traffic && !telemetry.github.traffic.error),
      searchConsole: Boolean(telemetry.searchConsole),
      websiteAnalytics: Boolean(telemetry.analytics),
      registryAccess: Boolean(telemetry.registryAccess),
      communityProof: Boolean(telemetry.communityProof),
    },
    conclusion: telemetryErrors.length
      ? `Telemetry incomplete: ${telemetryErrors.length} collection error${telemetryErrors.length === 1 ? '' : 's'} occurred; do not treat this pass as complete adoption evidence.`
      : adoption.externallyValidated
        ? 'Externally validated: at least three public adoption signals pass.'
        : `Not externally validated: ${adoption.score ?? 'n/a'} public signals pass, below the ${adoption.completionThreshold ?? 3}/${adoption.signalCount ?? 4} gate.`,
  }
}

function renderText(status) {
  const signalRows = status.publicSignals.map((signal) => {
    const state = signal.passed ? 'Pass' : 'Not yet'
    return `- ${signal.label}: ${signal.current ?? 'n/a'} (${state}; threshold ${signal.threshold})`
  })

  const missingRows = status.missingSignals.length
    ? status.missingSignals.map((signal) => {
      const recommended = signal.recommendedGoodFirstIssues?.length
        ? ` Recommended good-first issues: ${signal.recommendedGoodFirstIssues.map((issue) => issue.title).join('; ')}.`
        : ''
      return `- ${signal.label}: ${signal.nextAction}${recommended}`
    })
    : ['- No missing public signals. Keep measuring slope after promotion.']

  const evidenceRows = Object.entries(status.supportingEvidence).map(([key, available]) => `- ${key}: ${available ? 'available' : 'missing'}`)
  const trendRows = status.signalTrends.length
    ? status.signalTrends.map((signal) => {
      const delta = typeof signal.delta === 'number' ? `, delta ${signal.delta >= 0 ? '+' : ''}${signal.delta}` : ''
      return `- ${signal.label}: ${signal.current ?? 'n/a'} (previous ${signal.previous ?? 'n/a'}${delta})`
    })
    : ['- No previous telemetry report is available for slope comparison.']
  const errorRows = status.telemetryErrors.length
    ? status.telemetryErrors.map((error) => `- ${error}`)
    : ['- None']

  return `# Launch Status

Telemetry report: ${status.telemetryReport}
Public adoption score: ${status.score ?? 'n/a'}
Completion gate: ${status.completionThreshold}/${status.signalCount} public signals
Externally validated: ${status.externallyValidated ? 'yes' : 'no'}

## Public Signals

${signalRows.join('\n')}

## Public Signal Trend

Previous telemetry report: ${status.previousTelemetryReport ?? 'none'}

${trendRows.join('\n')}

## Missing-Signal Actions

${missingRows.join('\n')}

## Supporting Evidence

${evidenceRows.join('\n')}

## Telemetry Errors

${errorRows.join('\n')}

## Conclusion

${status.conclusion}
`
}

const live = process.argv.includes('--live')
const source = live ? 'live collect-telemetry' : latestTelemetryPath()
if (!source) fail('no research/telemetry-YYYY-MM-DD.json report exists', ['Run npm run telemetry:collect first, or use --live.'])

const telemetry = live ? loadLiveTelemetry() : loadTelemetry(source)
const previousSource = previousTelemetryPath(source, telemetry.generatedAt)
const previousTelemetry = previousSource ? loadTelemetry(previousSource) : undefined
const status = buildPayload(telemetry, source, previousTelemetry, previousSource)

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(status, null, 2))
} else {
  console.log(renderText(status))
}

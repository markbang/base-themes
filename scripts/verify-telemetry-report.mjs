import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

function fail(message, details = []) {
  console.error(`Telemetry report invalid: ${message}`)
  for (const detail of details) console.error(`- ${detail}`)
  process.exit(1)
}

function latestTelemetryPath() {
  const files = readdirSync(resolve('research'))
    .filter((file) => /^telemetry-\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort()

  return files.length ? resolve('research', files.at(-1)) : undefined
}

function loadTelemetryReport() {
  if (process.argv.includes('--live')) {
    try {
      return {
        source: 'live collect-telemetry',
        payload: JSON.parse(execFileSync('node', ['scripts/collect-telemetry.mjs', '--json', '--no-write'], {
          encoding: 'utf8',
          maxBuffer: 20 * 1024 * 1024,
        })),
      }
    } catch (error) {
      fail('collect-telemetry --json must emit valid JSON', [error.message])
    }
  }

  const source = latestTelemetryPath()
  if (!source) fail('no research/telemetry-YYYY-MM-DD.json report exists', ['Run npm run telemetry:collect first, or use --live.'])

  try {
    return {
      source: basename(source),
      payload: JSON.parse(readFileSync(source, 'utf8')),
    }
  } catch (error) {
    fail('latest telemetry JSON could not be parsed', [`${source}: ${error.message}`])
  }
}

const { source, payload } = loadTelemetryReport()
const telemetryErrors = Array.isArray(payload.errors) ? payload.errors : []
if (telemetryErrors.length > 0) {
  fail('telemetry collection errors must be resolved before treating the report as valid', telemetryErrors)
}

const requiredSignalIds = ['npm-weekly-downloads', 'github-stars', 'external-human-issue-or-pr', 'forks']
const signalIds = payload.adoption?.signals?.map((signal) => signal.id) ?? []
const missingSignalIds = requiredSignalIds.filter((id) => !signalIds.includes(id))
if (missingSignalIds.length > 0) {
  fail('adoption JSON is missing required public signal ids', missingSignalIds)
}

if (payload.adoption?.completionThreshold !== 3) {
  fail('completion threshold must stay at three public signals', [`got ${payload.adoption?.completionThreshold}`])
}

if (payload.adoption?.signalCount !== 4 || payload.adoption?.signals?.length !== 4) {
  fail('adoption JSON must track exactly four public completion signals', [`got ${payload.adoption?.signalCount ?? 'missing'} / ${payload.adoption?.signals?.length ?? 'missing'}`])
}

if (payload.adoption?.passedSignals !== payload.adoption.signals.filter((signal) => signal.passed).length) {
  fail('passedSignals must equal the number of passed signal entries')
}

if (payload.adoption?.score !== `${payload.adoption.passedSignals}/${payload.adoption.signalCount}`) {
  fail('adoption score string must match passedSignals/signalCount', [`got ${payload.adoption?.score}`])
}

if (payload.adoption?.externallyValidated !== (payload.adoption.passedSignals >= payload.adoption.completionThreshold)) {
  fail('externallyValidated must be derived from passedSignals and completionThreshold')
}

const missingCurrentValues = payload.adoption.signals.filter((signal) => !('current' in signal) || !('passed' in signal) || !signal.threshold)
if (missingCurrentValues.length > 0) {
  fail('every adoption signal must include current, passed, and threshold fields', missingCurrentValues.map((signal) => signal.id))
}

if (payload.adoption.externallyValidated) {
  console.log(`Telemetry report valid (${source}): adoption externally validated at ${payload.adoption.score}`)
} else {
  console.log(`Telemetry report valid (${source}): adoption not externally validated at ${payload.adoption.score}`)
}

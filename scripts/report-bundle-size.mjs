import { readdir, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import { createGzip } from 'node:zlib'

const jsonMode = process.argv.includes('--json')
const budgets = {
  largestJsBytes: 500 * 1024,
  appJsGzipBytes: 80 * 1024,
  totalJsGzipBytes: 300 * 1024,
}

async function gzipSize(path) {
  return new Promise((resolveSize, reject) => {
    let bytes = 0
    createReadStream(path)
      .pipe(createGzip())
      .on('data', (chunk) => {
        bytes += chunk.length
      })
      .on('end', () => resolveSize(bytes))
      .on('error', reject)
  })
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`
}

const assetsDir = resolve('dist/assets')
const entries = await readdir(assetsDir)
const files = []

for (const entry of entries) {
  if (!entry.endsWith('.js') && !entry.endsWith('.css')) continue
  const path = resolve(assetsDir, entry)
  const stats = await stat(path)
  files.push({
    file: entry,
    bytes: stats.size,
    gzipBytes: await gzipSize(path),
  })
}

files.sort((a, b) => b.bytes - a.bytes)

const jsFiles = files.filter((file) => file.file.endsWith('.js'))
const largestJs = jsFiles[0]
const totalJsBytes = jsFiles.reduce((total, file) => total + file.bytes, 0)
const totalJsGzipBytes = jsFiles.reduce((total, file) => total + file.gzipBytes, 0)
const appJs = files.find((file) => file.file.startsWith('index-') && file.file.endsWith('.js'))

if (!appJs) {
  console.error('Could not find app index JS asset in dist/assets.')
  process.exit(1)
}

const budgetChecks = [
  {
    id: 'largest-js-bytes',
    label: 'Largest JS chunk',
    current: largestJs.bytes,
    limit: budgets.largestJsBytes,
    passed: largestJs.bytes <= budgets.largestJsBytes,
  },
  {
    id: 'app-js-gzip-bytes',
    label: 'App JS gzip',
    current: appJs.gzipBytes,
    limit: budgets.appJsGzipBytes,
    passed: appJs.gzipBytes <= budgets.appJsGzipBytes,
  },
  {
    id: 'total-js-gzip-bytes',
    label: 'Total JS gzip',
    current: totalJsGzipBytes,
    limit: budgets.totalJsGzipBytes,
    passed: totalJsGzipBytes <= budgets.totalJsGzipBytes,
  },
]
const payload = {
  generatedAt: new Date().toISOString(),
  budgets,
  files,
  appJs,
  largestJs,
  totalJsBytes,
  totalJsGzipBytes,
  budgetChecks,
  ok: budgetChecks.every((check) => check.passed),
}

if (jsonMode) {
  console.log(JSON.stringify(payload, null, 2))
} else {
  console.log('Bundle size report')
  for (const file of files) {
    console.log(`${file.file}: ${formatKb(file.bytes)} / gzip ${formatKb(file.gzipBytes)}`)
  }

  console.log(`App JS chunk: ${appJs.file} ${formatKb(appJs.bytes)} / gzip ${formatKb(appJs.gzipBytes)}`)
  console.log(`Largest JS chunk: ${largestJs.file} ${formatKb(largestJs.bytes)} / gzip ${formatKb(largestJs.gzipBytes)}`)
  console.log(`Total JS: ${formatKb(totalJsBytes)} / gzip ${formatKb(totalJsGzipBytes)}`)

  console.log('Bundle budgets')
  for (const check of budgetChecks) {
    console.log(`${check.label}: ${formatKb(check.current)} / limit ${formatKb(check.limit)} ${check.passed ? 'OK' : 'FAIL'}`)
  }
}

if (!payload.ok) {
  const failed = budgetChecks.filter((check) => !check.passed)
  console.error(`Bundle budget failed: ${failed.map((check) => `${check.label} ${formatKb(check.current)} > ${formatKb(check.limit)}`).join(', ')}`)
  process.exit(1)
}

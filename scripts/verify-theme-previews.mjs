import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import themeMeta from '../src/docs/themeMeta.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const baselineDir = join(root, 'public/previews')
const actualDir = join(root, '.tmp/theme-preview-check')
const baseUrl = process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:5175'
const scope = process.env.THEME_PREVIEW_SCOPE ?? process.env.THEME_E2E_SCOPE ?? 'smoke'
const threshold = Number(process.env.THEME_PREVIEW_THRESHOLD ?? '0.08')
const explicitThemes = process.env.THEME_PREVIEW_STYLES?.split(',').map((style) => style.trim()).filter(Boolean)
const smokeThemes = ['bento', 'shadcn', 'enterprise', 'terminal', 'cyberpunk']
const allThemes = themeMeta.map((theme) => theme.style)
const themes = explicitThemes ?? (scope === 'full' ? allThemes : smokeThemes)
const unknownThemes = themes.filter((theme) => !allThemes.includes(theme))

if (unknownThemes.length > 0) {
  console.error(`Unknown theme style${unknownThemes.length === 1 ? '' : 's'}: ${unknownThemes.join(', ')}`)
  process.exit(1)
}

function run(args, options = {}) {
  return execFileSync('agent-browser', ['--session', 'base-themes-preview-check', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  })
}

function readPng(path) {
  return PNG.sync.read(readFileSync(path))
}

rmSync(actualDir, { recursive: true, force: true })
mkdirSync(actualDir, { recursive: true })

const failures = []

try {
  run(['set', 'viewport', '1280', '720'])

  for (const theme of themes) {
    const baselinePath = join(baselineDir, `base-themes-${theme}.png`)
    const actualPath = join(actualDir, `base-themes-${theme}.png`)

    if (!existsSync(baselinePath)) {
      failures.push(`${theme}: missing baseline preview ${baselinePath}`)
      continue
    }

    run(['open', `${baseUrl}/themes?style=${theme}&theme=light`], { stdio: 'inherit' })
    run(['wait', '700'])
    run(['screenshot', actualPath])

    const baseline = readPng(baselinePath)
    const actual = readPng(actualPath)

    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      failures.push(`${theme}: preview size changed from ${baseline.width}x${baseline.height} to ${actual.width}x${actual.height}`)
      continue
    }

    const diffPixels = pixelmatch(baseline.data, actual.data, null, baseline.width, baseline.height, { threshold: 0.12 })
    const ratio = diffPixels / (baseline.width * baseline.height)

    if (ratio > threshold) {
      failures.push(`${theme}: visual diff ${(ratio * 100).toFixed(2)}% exceeds ${(threshold * 100).toFixed(2)}%`)
    }
  }
} finally {
  try {
    run(['close'], { stdio: 'ignore' })
  } catch {
    // Browser may already be closed after a failed command.
  }
}

if (failures.length) {
  console.error('Theme preview verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  console.error(`Actual screenshots are in ${actualDir}`)
  process.exit(1)
}

console.log(`Theme preview verification passed for ${themes.length} styles (${scope} scope).`)

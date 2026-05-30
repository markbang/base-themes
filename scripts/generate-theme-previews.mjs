import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import themeMeta from '../src/docs/themeMeta.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public/previews')
const port = process.env.PREVIEW_PORT ?? '5175'
const baseUrl = process.env.PREVIEW_BASE_URL ?? `http://127.0.0.1:${port}`

const themes = themeMeta.map((theme) => theme.style)

function run(args) {
  execFileSync('agent-browser', args, { stdio: 'inherit', cwd: root })
}

mkdirSync(outDir, { recursive: true })
run(['--session', 'base-themes-previews', 'set', 'viewport', '1280', '720'])

for (const theme of themes) {
  const url = `${baseUrl}/themes?style=${theme}&theme=light`
  const screenshot = join(outDir, `base-themes-${theme}.png`)
  run(['--session', 'base-themes-previews', 'open', url])
  run(['--session', 'base-themes-previews', 'wait', '700'])
  run(['--session', 'base-themes-previews', 'screenshot', screenshot])
}

run(['--session', 'base-themes-previews', 'close'])

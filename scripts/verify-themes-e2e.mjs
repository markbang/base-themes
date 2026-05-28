import { execFileSync } from 'node:child_process'

const baseUrl = process.env.PREVIEW_BASE_URL ?? 'http://127.0.0.1:5175'
let session = 'base-themes-e2e'

const themes = [
  'bento',
  'shadcn',
  'neo-brutalism',
  'minimal',
  'enterprise',
  'linear',
  'glass',
  'terminal',
  'material',
  'fluent',
  'retro',
  'cyberpunk',
  'editorial',
  'calm',
  'data-dense',
  'playful',
  'luxury',
  'soft-ui',
  'bauhaus',
  'mono',
]

function run(args, options = {}) {
  return execFileSync('agent-browser', ['--session', session, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  })
}

function withSession(nextSession, fn) {
  const prev = session
  session = nextSession
  try {
    return fn()
  } finally {
    try {
      run(['close'], { stdio: 'ignore' })
    } catch {
      // Browser may already be closed after a failed command.
    }
    session = prev
  }
}

function evalJson(script) {
  const output = run(['eval', script])
  const normalized = output.replace(/\\"/g, '"')
  const match = normalized.match(/\{[\s\S]*\}|\[[\s\S]*\]|true|false|null|-?\d+(?:\.\d+)?/)
  if (!match) throw new Error(`No JSON result in eval output: ${output}`)
  return JSON.parse(match[0])
}

const failures = []
for (const theme of themes) {
  for (const mode of ['light', 'dark']) {
    withSession(`base-themes-e2e-${theme}-${mode}`, () => {
      run(['set', 'viewport', '1280', '720'])
      const url = `${baseUrl}/components/select?style=${theme}&theme=${mode}`
      run(['open', url], { stdio: 'inherit' })
      run(['wait', '300'])
      const result = evalJson(`(() => {
        const root = document.documentElement
        const styles = getComputedStyle(root)
        const body = getComputedStyle(document.body)
        const select = document.querySelector('.bento-select-trigger')
        return JSON.stringify({
          style: root.getAttribute('data-style'),
          theme: root.getAttribute('data-theme'),
          bg: body.backgroundColor,
          text: body.color,
          accent: styles.getPropertyValue('--accent').trim(),
          selectBg: select ? getComputedStyle(select).backgroundColor : '',
          hasSelect: Boolean(select),
        })
      })()`)
      if (result.style !== theme) failures.push(`${theme}/${mode}: expected data-style ${theme}, got ${result.style}`)
      if (result.theme !== mode) failures.push(`${theme}/${mode}: expected data-theme ${mode}, got ${result.theme}`)
      if (!result.hasSelect) failures.push(`${theme}/${mode}: missing select control`)
      if (!result.accent) failures.push(`${theme}/${mode}: missing accent token`)
      if (result.bg === result.text) failures.push(`${theme}/${mode}: body text and background match`)
    })
  }
}

withSession('base-themes-e2e-select-popup', () => {
  run(['set', 'viewport', '1280', '720'])
  run(['open', `${baseUrl}/components/select?style=terminal&theme=dark`], { stdio: 'inherit' })
  run(['wait', '400'])
  run(['click', '.bento-select-trigger'], { stdio: 'inherit' })
  run(['wait', '250'])
  const selectState = evalJson(`(() => {
    const popup = document.querySelector('.bento-select-popup')
    const item = document.querySelector('.bento-select-item')
    return JSON.stringify({
      popupVisible: Boolean(popup),
      popupBg: popup ? getComputedStyle(popup).backgroundColor : '',
      popupColor: popup ? getComputedStyle(popup).color : '',
      itemColor: item ? getComputedStyle(item).color : '',
    })
  })()`)
  if (!selectState.popupVisible) failures.push('select interaction: popup did not open')
  if (selectState.popupBg === selectState.popupColor) failures.push('select interaction: popup text and background match')
})

withSession('base-themes-e2e-active-state', () => {
  run(['set', 'viewport', '1280', '720'])
  run(['open', `${baseUrl}/components/tabs?style=bauhaus&theme=light`], { stdio: 'inherit' })
  run(['wait', '400'])
  const activeState = evalJson(`(() => {
    const selected = document.querySelector('.bento-tabs-tab[data-selected], .bento-tabs-tab[data-active], .bento-tabs-tab[aria-selected="true"]')
    const indicator = document.querySelector('.bento-tabs-indicator')
    const tab = document.querySelector('.topbar-nav a.active')
    return JSON.stringify({
      selected: Boolean(selected),
      indicator: Boolean(indicator),
      indicatorBg: indicator ? getComputedStyle(indicator).backgroundColor : '',
      selectedColor: selected ? getComputedStyle(selected).color : '',
      navActive: Boolean(tab),
    })
  })()`)
  if (!activeState.selected) failures.push('tabs interaction: no selected tab')
  if (!activeState.indicator) failures.push('tabs interaction: missing active indicator')
  if (activeState.indicatorBg === activeState.selectedColor) failures.push('tabs interaction: selected text and indicator match')
  if (!activeState.navActive) failures.push('navigation state: active topbar link missing')
  const errors = run(['errors']).trim()
  if (errors && !/No page errors|No errors/i.test(errors)) failures.push(`browser errors: ${errors}`)
})

if (failures.length) {
  console.error('Theme E2E verification failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Theme E2E verification passed for ${themes.length} styles in light and dark modes.`)

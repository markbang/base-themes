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

function formatContrast(value) {
  return Number(value).toFixed(2)
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
        const parseRgb = (value) => {
          const match = value.match(/rgba?\\(([^)]+)\\)/)
          if (!match) return null
          const [r, g, b, a = '1'] = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
          return { r, g, b, a }
        }
        const blend = (fg, bg) => {
          if (!fg || fg.a >= 1) return fg
          return {
            r: fg.r * fg.a + bg.r * (1 - fg.a),
            g: fg.g * fg.a + bg.g * (1 - fg.a),
            b: fg.b * fg.a + bg.b * (1 - fg.a),
            a: 1,
          }
        }
        const luminance = ({ r, g, b }) => {
          const linear = (channel) => {
            const value = channel / 255
            return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
          }
          return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
        }
        const contrast = (fgValue, bgValue) => {
          const tokenBgProbe = document.createElement('div')
          tokenBgProbe.style.position = 'fixed'
          tokenBgProbe.style.left = '-9999px'
          tokenBgProbe.style.background = 'var(--bg)'
          document.body.append(tokenBgProbe)
          const tokenBg = getComputedStyle(tokenBgProbe).backgroundColor
          tokenBgProbe.remove()
          const pageBg = parseRgb(tokenBg) ?? parseRgb(body.backgroundColor) ?? { r: 255, g: 255, b: 255, a: 1 }
          const fg = blend(parseRgb(fgValue), pageBg)
          const bg = blend(parseRgb(bgValue), pageBg)
          if (!fg || !bg) return 0
          const fgLum = luminance(fg)
          const bgLum = luminance(bg)
          const lighter = Math.max(fgLum, bgLum)
          const darker = Math.min(fgLum, bgLum)
          return (lighter + 0.05) / (darker + 0.05)
        }
        const buttonContrast = (className) => {
          const button = document.createElement('button')
          button.className = className
          button.textContent = 'Aa'
          button.style.position = 'fixed'
          button.style.left = '-9999px'
          button.style.top = '0'
          document.body.append(button)
          const computed = getComputedStyle(button)
          const value = contrast(computed.color, computed.backgroundColor)
          button.remove()
          return value
        }
        const cssColor = (cssValue, property = 'color') => {
          const probe = document.createElement('div')
          probe.style.position = 'fixed'
          probe.style.left = '-9999px'
          probe.style[property] = cssValue
          document.body.append(probe)
          const value = getComputedStyle(probe)[property]
          probe.remove()
          return value
        }
        const contrastToken = (foregroundToken, backgroundToken) => contrast(
          cssColor('var(' + foregroundToken + ')'),
          cssColor('var(' + backgroundToken + ')', 'backgroundColor'),
        )
        const codeTokens = [
          '--code-text',
          '--code-keyword',
          '--code-string',
          '--code-component',
          '--code-tag',
          '--code-number',
          '--code-comment',
        ]
        const codeContrasts = Object.fromEntries(
          codeTokens.map((token) => [token, contrastToken(token, '--code-bg')]),
        )
        const brand = document.querySelector('.topbar-brand-mark')
        const brandStyle = brand ? getComputedStyle(brand) : null
        const activeStyle = document.querySelector('.style-switcher button.active')
        const activeStyleComputed = activeStyle ? getComputedStyle(activeStyle) : null
        return JSON.stringify({
          style: root.getAttribute('data-style'),
          theme: root.getAttribute('data-theme'),
          bg: body.backgroundColor,
          text: body.color,
          accent: styles.getPropertyValue('--accent').trim(),
          selectBg: select ? getComputedStyle(select).backgroundColor : '',
          hasSelect: Boolean(select),
          buttonContrasts: {
            primary: buttonContrast('bento-button'),
            accent: buttonContrast('bento-button accent'),
            teal: buttonContrast('bento-button teal'),
          },
          brandContrast: brandStyle ? contrast(brandStyle.color, brandStyle.backgroundColor) : 0,
          activeStyleContrast: activeStyleComputed
            ? contrast(activeStyleComputed.color, activeStyleComputed.backgroundColor)
            : 0,
          mutedContrasts: {
            bg: contrastToken('--text-muted', '--bg'),
            surface: contrastToken('--text-muted', '--surface'),
            mutedSurface: contrastToken('--text-muted', '--surface-muted'),
          },
          codeContrasts,
        })
      })()`)
      if (result.style !== theme) failures.push(`${theme}/${mode}: expected data-style ${theme}, got ${result.style}`)
      if (result.theme !== mode) failures.push(`${theme}/${mode}: expected data-theme ${mode}, got ${result.theme}`)
      if (!result.hasSelect) failures.push(`${theme}/${mode}: missing select control`)
      if (!result.accent) failures.push(`${theme}/${mode}: missing accent token`)
      if (result.bg === result.text) failures.push(`${theme}/${mode}: body text and background match`)
      for (const [variant, contrast] of Object.entries(result.buttonContrasts)) {
        if (contrast < 4.5) {
          failures.push(`${theme}/${mode}: ${variant} button contrast ${formatContrast(contrast)} is below 4.5`)
        }
      }
      if (result.brandContrast > 0 && result.brandContrast < 3) {
        failures.push(`${theme}/${mode}: topbar brand mark contrast ${formatContrast(result.brandContrast)} is below 3`)
      }
      if (result.activeStyleContrast > 0 && result.activeStyleContrast < 4.5) {
        failures.push(`${theme}/${mode}: active style switcher contrast ${formatContrast(result.activeStyleContrast)} is below 4.5`)
      }
      for (const [surface, contrast] of Object.entries(result.mutedContrasts)) {
        if (contrast < 4.5) {
          failures.push(`${theme}/${mode}: muted text on ${surface} contrast ${formatContrast(contrast)} is below 4.5`)
        }
      }
      for (const [token, contrast] of Object.entries(result.codeContrasts)) {
        if (contrast < 4.5) {
          failures.push(`${theme}/${mode}: ${token} contrast ${formatContrast(contrast)} is below 4.5 on code background`)
        }
      }
      run(['click', '.bento-select-trigger'])
      run(['wait', '150'])
      const popupState = evalJson(`(() => {
        const popup = document.querySelector('.bento-select-popup')
        const probe = document.createElement('div')
        probe.style.position = 'fixed'
        probe.style.left = '-9999px'
        probe.style.background = 'var(--theme-popup-bg, var(--surface))'
        document.body.append(probe)
        const expectedBg = getComputedStyle(probe).backgroundColor
        probe.remove()
        return JSON.stringify({
          visible: Boolean(popup),
          bg: popup ? getComputedStyle(popup).backgroundColor : '',
          color: popup ? getComputedStyle(popup).color : '',
          expectedBg,
        })
      })()`)
      if (!popupState.visible) failures.push(`${theme}/${mode}: select popup did not open`)
      if (popupState.bg === popupState.color) failures.push(`${theme}/${mode}: select popup text and background match`)
      if (popupState.bg !== popupState.expectedBg) {
        failures.push(`${theme}/${mode}: select popup background ${popupState.bg} does not match theme popup ${popupState.expectedBg}`)
      }
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

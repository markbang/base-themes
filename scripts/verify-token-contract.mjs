import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import registry from '../registry/registry.json' with { type: 'json' }
import tokenContract from '../src/styles/tokenContract.json' with { type: 'json' }

const root = process.cwd()
const tokensPath = join(root, 'src/styles/tokens.css')
const tokensSource = readFileSync(tokensPath, 'utf8')

function fail(message, details = []) {
  console.error(`Token contract invalid: ${message}`)
  for (const detail of details) console.error(`- ${detail}`)
  process.exit(1)
}

function allPublicTokens() {
  return Object.entries(tokenContract.publicTokens)
    .filter(([group]) => group !== 'docsOnly')
    .flatMap(([group, tokens]) => tokens.map((token) => ({ ...token, group })))
}

function tokenDefined(name) {
  return new RegExp(`${name.replaceAll('-', '\\-')}\\s*:`).test(tokensSource)
}

function legacyReferenced(token) {
  return token.legacy ? tokensSource.includes(`var(${token.legacy}`) || tokenDefined(token.legacy) : true
}

const publicTokens = allPublicTokens()
const publicTokenNames = new Set(publicTokens.map((token) => token.name))
const missingTokens = publicTokens.filter((token) => !tokenDefined(token.name)).map((token) => `${token.group}: ${token.name}`)
const missingLegacyReferences = publicTokens.filter((token) => !legacyReferenced(token)).map((token) => `${token.name} -> ${token.legacy}`)
const malformedTokens = publicTokens.filter((token) => !token.name.startsWith(tokenContract.stablePrefix) || !token.description).map((token) => token.name)

if (tokenContract.version !== '0.1.0') fail('expected token contract version 0.1.0')
if (!tokenContract.dataAttributes.includes('data-style') || !tokenContract.dataAttributes.includes('data-theme')) fail('data-style and data-theme must be part of the token contract')
if (missingTokens.length) fail('public --bt-* tokens missing from src/styles/tokens.css', missingTokens)
if (missingLegacyReferences.length) fail('public tokens must map to existing legacy compatibility tokens', missingLegacyReferences)
if (malformedTokens.length) fail('public tokens must use --bt-* prefix and descriptions', malformedTokens)

const missingStyleBlocks = registry.style.variants.filter((style) => style !== registry.style.default && !tokensSource.includes(`[data-style='${style}']`))
if (missingStyleBlocks.length) fail('registry styles missing token blocks in src/styles/tokens.css', missingStyleBlocks)

const missingThemeModeBlocks = registry.style.variants.filter((style) => {
  if (style === registry.style.default) return false
  return !tokensSource.includes(`[data-style='${style}'][data-theme='dark']`) && !tokensSource.includes(`[data-style='${style}'][data-theme='light']`)
})
if (missingThemeModeBlocks.length) fail('registry styles missing light/dark mode token blocks in src/styles/tokens.css', missingThemeModeBlocks)

const requiredDocs = ['docs/theme-token-contract.md', 'docs/theme-contribution-checklist.md']
const missingDocs = requiredDocs.filter((file) => !existsSync(join(root, file)))
if (missingDocs.length) fail('token contract docs missing', missingDocs)

const docsSource = requiredDocs.map((file) => readFileSync(join(root, file), 'utf8')).join('\n')
const undocumentedTokens = publicTokens.filter((token) => !docsSource.includes(token.name)).map((token) => token.name)
if (undocumentedTokens.length) fail('public tokens missing from token contract docs', undocumentedTokens)

const appSource = readFileSync(join(root, 'src/App.tsx'), 'utf8')
const requiredThemeGalleryPhrases = [
  'getThemePackageSnippet',
  'getThemeCssSnippet',
  'getThemeRegistryItemUrl',
  'theme_snippet_copy',
  'base-themes/styles.css',
  '/items/theme-${themeStyle}.json',
  '--bt-primary',
  '--bt-bg',
]
const missingThemeGalleryPhrases = requiredThemeGalleryPhrases.filter((phrase) => !appSource.includes(phrase))
if (missingThemeGalleryPhrases.length) fail('theme gallery must expose package, registry, copy, and --bt-* customization guidance', missingThemeGalleryPhrases)

function collectPackageFacingFiles(dir) {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const file = join(dir, entry)
    const absolute = join(root, file)
    if (statSync(absolute).isDirectory()) return collectPackageFacingFiles(file)
    return /\.(css|tsx)$/.test(file) ? [file] : []
  })
}

const packageFacingFiles = ['src/index.css', ...collectPackageFacingFiles('src/components/ui'), ...collectPackageFacingFiles('src/blocks')]
const unknownBtReferences = packageFacingFiles.flatMap((file) => {
  const source = readFileSync(join(root, file), 'utf8')
  return [...source.matchAll(/--bt-[a-z0-9-]+/g)]
    .map(([name]) => name)
    .filter((name) => !publicTokenNames.has(name))
    .map((name) => `${file}: ${name}`)
})
if (unknownBtReferences.length) fail('package-facing styles reference unknown --bt-* tokens', [...new Set(unknownBtReferences)])

console.log(`Token contract valid: ${publicTokens.length} public tokens, ${registry.style.variants.length} styles, version ${tokenContract.version}`)

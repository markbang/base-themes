import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { absoluteUrl, getSeoPages } from './seo-pages.mjs'
import sourceBlockMeta from '../src/docs/blockMeta.json' with { type: 'json' }
import sourceComponentMeta from '../src/docs/componentMeta.json' with { type: 'json' }
import sourceRegistry from '../registry/registry.json' with { type: 'json' }
import sourceStaticPageMeta from '../src/docs/staticPageMeta.json' with { type: 'json' }
import sourceThemeMeta from '../src/docs/themeMeta.json' with { type: 'json' }

const outDir = resolve('dist')
const pages = getSeoPages()
const failures = []

function fail(message) {
  failures.push(message)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function readRequired(path, label) {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    fail(`Missing ${label}: ${path}`)
    return null
  }
}

async function readJsonRequired(path, label) {
  const json = await readRequired(path, label)
  if (!json) return null

  try {
    return JSON.parse(json)
  } catch (error) {
    fail(`Invalid JSON for ${label}: ${path}`)
    return null
  }
}

function routeHtmlPath(routePath) {
  if (routePath === '/') return resolve(outDir, 'index.html')
  return resolve(outDir, `.${routePath}`, 'index.html')
}

function assertContains(html, expected, label, routePath) {
  if (!html.includes(expected)) {
    fail(`${routePath} is missing ${label}: ${expected}`)
  }
}

function assertMetaContent(html, selector, expected, routePath) {
  const pattern = selector.kind === 'name'
    ? new RegExp(`<meta\\s+name="${escapeRegExp(selector.value)}"\\s+content="${escapeRegExp(expected)}"\\s*/?>`)
    : new RegExp(`<meta\\s+property="${escapeRegExp(selector.value)}"\\s+content="${escapeRegExp(expected)}"\\s*/?>`)

  if (!pattern.test(html)) {
    fail(`${routePath} is missing ${selector.kind} meta ${selector.value}: ${expected}`)
  }
}

function expectedImageForRoute(routePath) {
  if (routePath.startsWith('/themes/')) {
    const style = routePath.split('/').pop()
    return absoluteUrl(`/previews/base-themes-${style}.png`)
  }

  return absoluteUrl('/previews/base-themes-bento.png')
}

function extractStructuredData(html, routePath) {
  const match = html.match(/<script type="application\/ld\+json" id="structured-data">([\s\S]*?)<\/script>/)
  if (!match) {
    fail(`${routePath} is missing structured data script.`)
    return null
  }

  try {
    return JSON.parse(match[1])
  } catch (error) {
    fail(`${routePath} has invalid structured data JSON.`)
    return null
  }
}

const sitemapPath = resolve(outDir, 'sitemap.xml')
const robotsPath = resolve(outDir, 'robots.txt')
const llmsPath = resolve(outDir, 'llms.txt')
const llmsFullPath = resolve(outDir, 'llms-full.txt')
const hostedRegistryPath = resolve(outDir, 'registry/registry.json')
const hostedBlockMetaPath = resolve(outDir, 'registry/block-meta.json')
const hostedComponentMetaPath = resolve(outDir, 'registry/component-meta.json')
const hostedStaticPageMetaPath = resolve(outDir, 'registry/static-page-meta.json')
const hostedThemeMetaPath = resolve(outDir, 'registry/theme-meta.json')
const staticDocsSourcePath = resolve('src/docs/StaticDocsPages.tsx')
const appSourcePath = resolve('src/App.tsx')
const sitemap = await readRequired(sitemapPath, 'sitemap')
const robots = await readRequired(robotsPath, 'robots.txt')
const llms = await readRequired(llmsPath, 'llms.txt')
const llmsFull = await readRequired(llmsFullPath, 'llms-full.txt')
const staticDocsSource = await readRequired(staticDocsSourcePath, 'static docs source')
const appSource = await readRequired(appSourcePath, 'app source')
const hostedRegistry = await readJsonRequired(hostedRegistryPath, 'hosted registry')
const hostedBlockMeta = await readJsonRequired(hostedBlockMetaPath, 'hosted block metadata')
const hostedComponentMeta = await readJsonRequired(hostedComponentMetaPath, 'hosted component metadata')
const hostedStaticPageMeta = await readJsonRequired(hostedStaticPageMetaPath, 'hosted static page metadata')
const hostedThemeMeta = await readJsonRequired(hostedThemeMetaPath, 'hosted theme metadata')
const requiredCommunityActionUrls = [
  'https://github.com/markbang/base-themes',
  'https://github.com/markbang/base-themes/fork',
  'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
  'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
  'https://github.com/markbang/base-themes/issues/new?template=bug_report.yml',
  'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
  'https://github.com/markbang/base-themes/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22',
]

if (hostedRegistry) {
  if (hostedRegistry.name !== sourceRegistry.name) fail('Hosted registry name does not match source registry.')
  if (hostedRegistry.components?.length !== sourceRegistry.components.length) fail(`Hosted registry has ${hostedRegistry.components?.length ?? 'n/a'} components, expected ${sourceRegistry.components.length}.`)
  if (hostedRegistry.blocks?.length !== sourceRegistry.blocks.length) fail(`Hosted registry has ${hostedRegistry.blocks?.length ?? 'n/a'} blocks, expected ${sourceRegistry.blocks.length}.`)
  if (hostedRegistry.pages?.length !== sourceRegistry.pages.length) fail(`Hosted registry has ${hostedRegistry.pages?.length ?? 'n/a'} pages, expected ${sourceRegistry.pages.length}.`)
  if (hostedRegistry.style?.variants?.length !== sourceRegistry.style.variants.length) fail(`Hosted registry has ${hostedRegistry.style?.variants?.length ?? 'n/a'} style variants, expected ${sourceRegistry.style.variants.length}.`)
}

if (hostedComponentMeta && hostedComponentMeta.length !== sourceComponentMeta.length) {
  fail(`Hosted component metadata has ${hostedComponentMeta.length} entries, expected ${sourceComponentMeta.length}.`)
}

if (hostedBlockMeta && hostedBlockMeta.length !== sourceBlockMeta.length) {
  fail(`Hosted block metadata has ${hostedBlockMeta.length} entries, expected ${sourceBlockMeta.length}.`)
}

if (hostedStaticPageMeta && hostedStaticPageMeta.length !== sourceStaticPageMeta.length) {
  fail(`Hosted static page metadata has ${hostedStaticPageMeta.length} entries, expected ${sourceStaticPageMeta.length}.`)
}

if (hostedStaticPageMeta && !hostedStaticPageMeta.some((page) => page.path === '/docs/security')) {
  fail('Hosted static page metadata is missing /docs/security.')
}

if (hostedThemeMeta && hostedThemeMeta.length !== sourceThemeMeta.length) {
  fail(`Hosted theme metadata has ${hostedThemeMeta.length} entries, expected ${sourceThemeMeta.length}.`)
}

if (sitemap) {
  const locMatches = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
  const expectedUrls = pages.map((page) => absoluteUrl(page.path))
  const duplicateUrls = locMatches.filter((url, index) => locMatches.indexOf(url) !== index)

  if (locMatches.length !== pages.length) {
    fail(`Sitemap contains ${locMatches.length} routes, expected ${pages.length}.`)
  }

  for (const url of expectedUrls) {
    if (!locMatches.includes(url)) {
      fail(`Sitemap is missing ${url}`)
    }
  }

  for (const url of duplicateUrls) {
    fail(`Sitemap contains duplicate route ${url}`)
  }
}

if (robots && !robots.includes(`Sitemap: ${absoluteUrl('/sitemap.xml')}`)) {
  fail(`robots.txt does not reference ${absoluteUrl('/sitemap.xml')}`)
}

if (llms) {
  const requiredLlmsLinks = [
    absoluteUrl('/docs/installation'),
    absoluteUrl('/docs/registry'),
    absoluteUrl('/docs/cli'),
    absoluteUrl('/docs/agent-usage'),
    absoluteUrl('/docs/examples'),
    absoluteUrl('/docs/security'),
    absoluteUrl('/registry/registry.json'),
    absoluteUrl('/registry/block-meta.json'),
    absoluteUrl('/registry/component-meta.json'),
    absoluteUrl('/registry/static-page-meta.json'),
    absoluteUrl('/registry/theme-meta.json'),
    absoluteUrl('/llms-full.txt'),
  ]

  for (const link of requiredLlmsLinks) {
    if (!llms.includes(link)) {
      fail(`llms.txt is missing ${link}`)
    }
  }

  for (const command of ['npx base-themes list --json', 'npx base-themes plan button select block:dashboard-shell theme:enterprise --json', 'npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json', 'npx base-themes doctor . --json']) {
    if (!llms.includes(command)) {
      fail(`llms.txt is missing ${command}`)
    }
  }

  for (const url of requiredCommunityActionUrls) {
    if (!llms.includes(url)) {
      fail(`llms.txt is missing community action URL ${url}`)
    }
  }
}

if (llmsFull) {
  const requiredFullText = [
    'Base Themes Full Agent Context',
    'npx base-themes list --json',
    'npx base-themes plan button select block:dashboard-shell theme:enterprise',
    'npx base-themes plan button select block:dashboard-shell theme:enterprise --json',
    'npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run',
    'npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json',
    'npx base-themes doctor . --json',
    "import tokenContract from 'base-themes/token-contract.json'",
    "import buttonItem from 'base-themes/registry/items/button.json'",
    "import dashboardItem from 'base-themes/registry/items/block-dashboard-shell.json'",
    absoluteUrl('/registry/items/block-dashboard-shell.json'),
    absoluteUrl('/themes/bento'),
    absoluteUrl('/components/button'),
    'meta.agent.packageInstall',
    'meta.agent.registryItems',
    'Do not scrape JSX when JSON metadata is available.',
  ]

  for (const text of requiredFullText) {
    if (!llmsFull.includes(text)) {
      fail(`llms-full.txt is missing ${text}`)
    }
  }

  for (const url of requiredCommunityActionUrls) {
    if (!llmsFull.includes(url)) {
      fail(`llms-full.txt is missing community action URL ${url}`)
    }
  }
}

if (staticDocsSource && !staticDocsSource.includes('/registry/block-meta.json')) {
  fail('Registry docs page is missing the hosted block metadata URL.')
}

if (staticDocsSource && !staticDocsSource.includes('base-themes/block-meta.json')) {
  fail('Registry docs page is missing the package block metadata export.')
}

for (const requiredRegistryDocsText of ['meta.agent.packageInstall', 'meta.agent.sourceCopy', 'meta.agent.registryItems']) {
  if (staticDocsSource && !staticDocsSource.includes(requiredRegistryDocsText)) {
    fail(`Registry docs page is missing ${requiredRegistryDocsText}.`)
  }
}

for (const requiredRegistryDocsImport of ["base-themes/registry/items/button.json", "base-themes/registry/items/block-dashboard-shell.json"]) {
  if (staticDocsSource && !staticDocsSource.includes(requiredRegistryDocsImport)) {
    fail(`Registry docs page is missing ${requiredRegistryDocsImport}.`)
  }
}

const requiredContributingActionText = [
  'Public contribution path',
  'Fork-to-first-change',
  'npm run example:theme-customization:build',
  'npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json',
  'goodFirstIssuesUrl',
  'docs-contributing',
  'good-first-issues',
  'feature-request',
  'show-and-tell',
  'gallery-submission',
  'repo-fork',
]

for (const text of requiredContributingActionText) {
  if (staticDocsSource && !staticDocsSource.includes(text)) {
    fail(`Contributing docs page is missing public adoption action: ${text}`)
  }
}

if (appSource) {
  if (!appSource.includes("return 'not-found'")) {
    fail('App source is missing the not-found fallback in getPage.')
  }
  if (!appSource.includes('Page Not Found')) {
    fail('App source is missing the not-found page view.')
  }
  if (!appSource.includes("'noindex'")) {
    fail('App source is missing noindex robots handling for not-found pages.')
  }
}

for (const page of pages) {
  const htmlPath = routeHtmlPath(page.path)
  try {
    await access(htmlPath)
  } catch (error) {
    fail(`Missing route HTML for ${page.path}: ${htmlPath}`)
    continue
  }

  const html = await readRequired(htmlPath, `${page.path} route HTML`)
  if (!html) continue

  const pageUrl = absoluteUrl(page.path)
  const pageImage = expectedImageForRoute(page.path)
  assertContains(html, `<title>${page.title}</title>`, 'title', page.path)
  assertMetaContent(html, { kind: 'name', value: 'description' }, page.description, page.path)
  assertMetaContent(html, { kind: 'property', value: 'og:title' }, page.title, page.path)
  assertMetaContent(html, { kind: 'property', value: 'og:url' }, pageUrl, page.path)
  assertMetaContent(html, { kind: 'property', value: 'og:image' }, pageImage, page.path)
  assertMetaContent(html, { kind: 'name', value: 'twitter:image' }, pageImage, page.path)
  assertContains(html, `<link rel="canonical" href="${pageUrl}" />`, 'canonical link', page.path)

  const structuredData = extractStructuredData(html, page.path)
  if (structuredData) {
    if (structuredData.name !== page.title) fail(`${page.path} structured data name does not match title.`)
    if (structuredData.description !== page.description) fail(`${page.path} structured data description does not match page description.`)
    if (structuredData.url !== pageUrl) fail(`${page.path} structured data URL does not match canonical URL.`)
    if (structuredData.image !== pageImage) fail(`${page.path} structured data image does not match expected image.`)
  }
}

if (failures.length > 0) {
  console.error(`SEO coverage check failed with ${failures.length} issue${failures.length === 1 ? '' : 's'}:`)
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`SEO coverage verified for ${pages.length} routes.`)

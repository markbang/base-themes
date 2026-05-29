import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const siteUrl = process.env.SITE_URL ?? 'https://base-themes.bangwu.me'
const outDir = resolve('dist')
const docsRoot = '/components'

const staticPages = [
  {
    path: '/',
    title: 'Base Themes — Themeable Base UI React Components',
    description: 'Typed Base UI React component wrappers with production CSS tokens, 20 visual themes, registry metadata, and ready-to-use product UI blocks.',
    priority: '1.0',
  },
  {
    path: '/blocks',
    title: 'Application Blocks — Base Themes',
    description: 'Composable dashboard and settings blocks built from accessible Base UI React primitives and themeable product UI tokens.',
    priority: '0.8',
  },
  {
    path: '/themes',
    title: 'Theme System — Base Themes',
    description: 'Explore Bento, shadcn, neo brutalism, minimal, enterprise, glass, terminal, and other token-based React UI themes.',
    priority: '0.9',
  },
  {
    path: '/docs/installation',
    title: 'Install Base Themes for React',
    description: 'Install base-themes from npm, import the bundled styles, and use typed Base UI React wrappers in Vite, Next.js, Remix, or any React app.',
    priority: '0.9',
  },
]

function absoluteUrl(path) {
  return new URL(path, siteUrl).toString()
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function extractComponentPages(source) {
  const pages = []
  const matcher = /id: '([^']+)'[\s\S]*?title: '([^']+)'[\s\S]*?summary: '([^']+)'/g
  let match

  while ((match = matcher.exec(source))) {
    const [, id, title, summary] = match
    pages.push({
      path: `${docsRoot}/${id}`,
      title: `${title} React Component — Base Themes`,
      description: `${summary} Includes interactive examples, API reference, keyboard interactions, and themeable Base UI styling.`,
      priority: '0.7',
    })
  }

  return pages
}

function renderSitemap(pages) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = pages.map((page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`
}

function injectSeo(html, page) {
  const type = page.path.startsWith('/components/') ? 'article' : 'website'

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${absoluteUrl(page.path)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${absoluteUrl(page.path)}" />`)
}

async function writeRouteHtml(indexHtml, page) {
  if (page.path === '/') return
  const filePath = resolve(outDir, `.${page.path}`, 'index.html')
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, injectSeo(indexHtml, page))
}

const appSource = await readFile('src/App.tsx', 'utf8')
const componentPages = extractComponentPages(appSource)
const pages = [...staticPages, ...componentPages]
const indexPath = resolve(outDir, 'index.html')
const indexHtml = await readFile(indexPath, 'utf8')

await Promise.all([
  writeFile(resolve(outDir, 'sitemap.xml'), renderSitemap(pages)),
  writeFile(resolve(outDir, 'robots.txt'), renderRobots()),
  ...pages.map((page) => writeRouteHtml(indexHtml, page)),
])

console.log(`Generated SEO files for ${pages.length} routes.`)

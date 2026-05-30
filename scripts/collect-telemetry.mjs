import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import packageJson from '../package.json' with { type: 'json' }

const repo = process.env.GITHUB_REPOSITORY ?? 'markbang/base-themes'
const packageName = packageJson.name
const today = new Date().toISOString().slice(0, 10)
const execFileAsync = promisify(execFile)
const searchConsoleExportPath = process.env.SEARCH_CONSOLE_EXPORT
const analyticsExportPath = process.env.ANALYTICS_EXPORT
const registryAccessExportPath = process.env.REGISTRY_ACCESS_EXPORT
const communityProofExportPath = process.env.COMMUNITY_PROOF_EXPORT
const bundleReportExportPath = process.env.BUNDLE_REPORT_EXPORT
const jsonMode = process.argv.includes('--json')
const writeReport = !process.argv.includes('--no-write')

const registryAccessPaths = [
  '/registry/registry.json',
  '/registry/shadcn-registry.json',
  '/registry/items',
  '/registry/block-meta.json',
  '/registry/component-meta.json',
  '/registry/theme-meta.json',
  '/llms.txt',
  '/llms-full.txt',
  '/docs/registry',
  '/docs/cli',
  '/docs/agent-usage',
]

async function fetchJson(url, options = {}) {
  const headers = {
    'accept': 'application/json',
    'user-agent': 'base-themes-telemetry-script',
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(15000),
      ...options,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`${response.status} ${response.statusText} for ${url}${body ? `: ${body.slice(0, 240)}` : ''}`)
    }

    return response.json()
  } catch (fetchError) {
    return fetchJsonWithCurl(url, headers, fetchError)
  }
}

async function fetchJsonWithCurl(url, headers, fetchError) {
  const args = ['--fail', '--silent', '--show-error', '--location', '--max-time', '20']
  for (const [key, value] of Object.entries(headers)) {
    args.push('--header', `${key}: ${value}`)
  }
  args.push(url)

  try {
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 20 * 1024 * 1024 })
    return JSON.parse(stdout)
  } catch (curlError) {
    const fetchMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
    const curlMessage = curlError instanceof Error ? curlError.message : String(curlError)
    throw new Error(`fetch failed (${fetchMessage}); curl fallback failed (${curlMessage})`)
  }
}

function metric(value) {
  return value === undefined || value === null || value === '' ? 'n/a' : String(value)
}

function issueCount(searchResult) {
  return typeof searchResult.total_count === 'number' ? searchResult.total_count : undefined
}

function isExternalHumanSignal(item, owner) {
  const login = item?.user?.login
  const userType = item?.user?.type
  const association = item?.author_association

  if (!login || login.toLowerCase() === owner.toLowerCase()) return false
  if (userType === 'Bot' || login.endsWith('[bot]')) return false
  return !['OWNER', 'MEMBER', 'COLLABORATOR'].includes(association)
}

function externalHumanCount(searchResults, owner) {
  return searchResults.reduce((total, result) => {
    const items = Array.isArray(result?.items) ? result.items : []
    return total + items.filter((item) => isExternalHumanSignal(item, owner)).length
  }, 0)
}

async function collectGitHub() {
  const [owner, name] = repo.split('/')
  const token = process.env.GITHUB_TOKEN
  const authHeaders = token ? { authorization: `Bearer ${token}` } : {}
  const base = `https://api.github.com/repos/${owner}/${name}`
  const searchBase = 'https://api.github.com/search/issues'
  const search = (query) => fetchJson(`${searchBase}?q=${encodeURIComponent(query)}&per_page=100`, { headers: authHeaders })

  const [repoInfo, openIssues, closedIssues, openPrs, closedPrs, contributors, releases] = await Promise.all([
    fetchJson(base, { headers: authHeaders }),
    search(`repo:${repo} type:issue state:open`),
    search(`repo:${repo} type:issue state:closed`),
    search(`repo:${repo} type:pr state:open`),
    search(`repo:${repo} type:pr state:closed`),
    fetchJson(`${base}/contributors?per_page=100`, { headers: authHeaders }).catch(() => []),
    fetchJson(`${base}/releases?per_page=20`, { headers: authHeaders }).catch(() => []),
  ])

  const traffic = token ? await collectGitHubTraffic(base, authHeaders).catch((error) => ({ error: error.message })) : undefined

  const releaseDownloadCount = Array.isArray(releases)
    ? releases.reduce((total, release) => total + (release.assets ?? []).reduce((assetTotal, asset) => assetTotal + (asset.download_count ?? 0), 0), 0)
    : undefined

  return {
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    watchers: repoInfo.subscribers_count,
    openIssues: issueCount(openIssues),
    closedIssues: issueCount(closedIssues),
    openPrs: issueCount(openPrs),
    closedPrs: issueCount(closedPrs),
    externalHumanSignals: externalHumanCount([openIssues, closedIssues, openPrs, closedPrs], owner),
    contributors: Array.isArray(contributors) ? contributors.length : undefined,
    releases: Array.isArray(releases) ? releases.length : undefined,
    releaseDownloads: releaseDownloadCount,
    traffic,
    pushedAt: repoInfo.pushed_at,
    defaultBranch: repoInfo.default_branch,
    privateTrafficAvailable: Boolean(token),
  }
}

async function collectGitHubTraffic(base, authHeaders) {
  const [views, clones, referrers, paths] = await Promise.all([
    fetchJson(`${base}/traffic/views`, { headers: authHeaders }),
    fetchJson(`${base}/traffic/clones`, { headers: authHeaders }),
    fetchJson(`${base}/traffic/popular/referrers`, { headers: authHeaders }),
    fetchJson(`${base}/traffic/popular/paths`, { headers: authHeaders }),
  ])

  return {
    viewsCount: views.count,
    viewsUniques: views.uniques,
    clonesCount: clones.count,
    clonesUniques: clones.uniques,
    topReferrers: Array.isArray(referrers) ? referrers.slice(0, 5) : [],
    topPaths: Array.isArray(paths) ? paths.slice(0, 5) : [],
  }
}

async function collectNpm() {
  const encoded = encodeURIComponent(packageName)
  const [lastWeek, lastMonth, packageInfo] = await Promise.all([
    fetchJson(`https://api.npmjs.org/downloads/point/last-week/${encoded}`),
    fetchJson(`https://api.npmjs.org/downloads/point/last-month/${encoded}`),
    fetchJson(`https://registry.npmjs.org/${encoded}`),
  ])

  const versions = Object.keys(packageInfo.versions ?? {})
  const latest = packageInfo['dist-tags']?.latest
  const latestVersion = latest ? packageInfo.versions?.[latest] : undefined

  return {
    weeklyDownloads: lastWeek.downloads,
    monthlyDownloads: lastMonth.downloads,
    latest,
    versionCount: versions.length,
    createdAt: packageInfo.time?.created,
    modifiedAt: packageInfo.time?.modified,
    unpackedSize: latestVersion?.dist?.unpackedSize,
    integrityPresent: Boolean(latestVersion?.dist?.integrity),
  }
}

async function collectSearchConsole() {
  if (!searchConsoleExportPath) return undefined

  const absolutePath = resolve(searchConsoleExportPath)
  const source = await readFile(absolutePath, 'utf8')
  const rows = parseSearchConsoleExport(source, absolutePath)
  const normalizedRows = rows.map(normalizeSearchConsoleRow).filter(Boolean)
  const clicks = sum(normalizedRows, 'clicks')
  const impressions = sum(normalizedRows, 'impressions')
  const positionRows = normalizedRows.filter((row) => Number.isFinite(row.position) && row.impressions > 0)
  const positionImpressions = sum(positionRows, 'impressions')
  const weightedPositionImpressions = positionRows.reduce((total, row) => total + row.position * row.impressions, 0)

  return {
    source: absolutePath,
    rowCount: normalizedRows.length,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : undefined,
    position: positionImpressions > 0 ? weightedPositionImpressions / positionImpressions : undefined,
    topQueries: topSearchRows(normalizedRows.filter((row) => row.query), 'query'),
    topPages: topSearchRows(normalizedRows.filter((row) => row.page), 'page'),
  }
}

function parseSearchConsoleExport(source, absolutePath) {
  const trimmed = source.trim()
  if (!trimmed) return []

  if (absolutePath.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed.rows)) return parsed.rows
    if (Array.isArray(parsed.data)) return parsed.data
    throw new Error('Search Console JSON export must be an array or include rows/data array')
  }

  return parseCsv(trimmed)
}

function parseCsv(source) {
  const records = []
  let record = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      record.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1
      record.push(field)
      if (record.some((value) => value.trim() !== '')) records.push(record)
      record = []
      field = ''
    } else {
      field += char
    }
  }

  record.push(field)
  if (record.some((value) => value.trim() !== '')) records.push(record)
  if (records.length < 2) return []

  const headers = records[0].map((header) => header.trim())
  return records.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ''])))
}

function normalizeSearchConsoleRow(row) {
  const keys = Array.isArray(row.keys) ? row.keys : []
  const firstKey = keys[0]
  const query = firstString(row.query, row.Query, row['Top queries'], inferQuery(firstKey))
  const page = firstString(row.page, row.Page, row['Top pages'], inferPage(firstKey))
  const clicks = parseNumber(firstValue(row.clicks, row.Clicks))
  const impressions = parseNumber(firstValue(row.impressions, row.Impressions))

  if (!query && !page) return undefined
  if (!Number.isFinite(clicks) && !Number.isFinite(impressions)) return undefined

  return {
    query,
    page,
    clicks: Number.isFinite(clicks) ? clicks : 0,
    impressions: Number.isFinite(impressions) ? impressions : 0,
    ctr: parsePercentOrNumber(firstValue(row.ctr, row.CTR)),
    position: parseNumber(firstValue(row.position, row.Position)),
  }
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function firstString(...values) {
  const value = firstValue(...values)
  return typeof value === 'string' ? value.trim() : undefined
}

function inferQuery(value) {
  if (typeof value !== 'string') return undefined
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return undefined
  return value
}

function inferPage(value) {
  if (typeof value !== 'string') return undefined
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
  return undefined
}

function parseNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.replace(/,/g, '').trim()
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parsePercentOrNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.replace(/,/g, '').trim()
  if (!normalized) return undefined
  const parsed = Number(normalized.endsWith('%') ? normalized.slice(0, -1) : normalized)
  if (!Number.isFinite(parsed)) return undefined
  return normalized.endsWith('%') ? parsed / 100 : parsed
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + row[key], 0)
}

function topSearchRows(rows, key) {
  return [...rows]
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, 5)
    .map((row) => ({
      value: row[key],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }))
}

async function collectAnalytics() {
  if (!analyticsExportPath) return undefined

  const absolutePath = resolve(analyticsExportPath)
  const source = await readFile(absolutePath, 'utf8')
  const rows = parseAnalyticsExport(source, absolutePath)
  const events = rows.map(normalizeAnalyticsEvent).filter(Boolean)
  const countsByEvent = countBy(events, (event) => event.name)
  const routeViews = events.filter((event) => event.name === 'route_view')
  const githubClicks = events.filter((event) => event.name === 'github_outbound_click')
  const installCopies = events.filter((event) => event.name === 'install_command_copy')

  return {
    source: absolutePath,
    eventCount: events.length,
    routeViews: routeViews.length,
    installCopies: installCopies.length,
    githubOutboundClicks: githubClicks.length,
    blockShareCopies: countsByEvent.block_share_copy ?? 0,
    themeSnippetCopies: countsByEvent.theme_snippet_copy ?? 0,
    themeSelections: (countsByEvent.theme_style_select ?? 0) + (countsByEvent.theme_style_cycle ?? 0),
    countsByEvent,
    topRoutes: topAnalyticsRows(countBy(events, (event) => event.path || '/')),
    topGithubClickTargets: topAnalyticsRows(countBy(githubClicks, (event) => event.properties?.target ?? event.properties?.source ?? 'unknown')),
    topCampaigns: topAnalyticsRows(countBy(routeViews, (event) => event.properties?.campaign ?? event.properties?.utm_campaign)),
    topSources: topAnalyticsRows(countBy(routeViews, (event) => event.properties?.source ?? event.properties?.utm_source)),
    topMediums: topAnalyticsRows(countBy(routeViews, (event) => event.properties?.medium ?? event.properties?.utm_medium)),
    topGithubClickSources: topAnalyticsRows(countBy(githubClicks, (event) => event.properties?.source ?? event.properties?.utm_source ?? 'unknown')),
    topInstallCopySources: topAnalyticsRows(countBy(installCopies, (event) => event.properties?.source ?? event.properties?.utm_source ?? 'unknown')),
    campaignFunnels: attributionFunnels(events, (event) => event.properties?.campaign ?? event.properties?.utm_campaign),
    sourceFunnels: attributionFunnels(events, (event) => event.properties?.source ?? event.properties?.utm_source),
  }
}

async function collectBundleReport() {
  if (!bundleReportExportPath) return undefined

  const absolutePath = resolve(bundleReportExportPath)
  const source = await readFile(absolutePath, 'utf8')
  const report = JSON.parse(source)
  const budgetChecks = Array.isArray(report.budgetChecks) ? report.budgetChecks : []

  return {
    source: absolutePath,
    ok: Boolean(report.ok),
    appJs: normalizeBundleAsset(report.appJs),
    largestJs: normalizeBundleAsset(report.largestJs),
    totalJsBytes: parseNumber(firstValue(report.totalJsBytes)),
    totalJsGzipBytes: parseNumber(firstValue(report.totalJsGzipBytes)),
    budgets: report.budgets && typeof report.budgets === 'object' ? report.budgets : {},
    budgetChecks: budgetChecks.map((check) => ({
      id: firstString(check.id),
      label: firstString(check.label),
      current: parseNumber(firstValue(check.current)),
      limit: parseNumber(firstValue(check.limit)),
      passed: Boolean(check.passed),
    })),
  }
}

function normalizeBundleAsset(asset) {
  if (!asset || typeof asset !== 'object') return undefined

  return {
    file: firstString(asset.file),
    bytes: parseNumber(firstValue(asset.bytes)),
    gzipBytes: parseNumber(firstValue(asset.gzipBytes)),
  }
}

function parseAnalyticsExport(source, absolutePath) {
  const trimmed = source.trim()
  if (!trimmed) return []
  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  if (lines.length > 1 && lines.every((line) => line.startsWith('{'))) {
    return lines.map((line) => JSON.parse(line))
  }

  if (absolutePath.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed.events)) return parsed.events
    if (Array.isArray(parsed.rows)) return parsed.rows
    if (Array.isArray(parsed.data)) return parsed.data
    return [parsed]
  }

  if (lines.every((line) => line.startsWith('{'))) {
    return lines.map((line) => JSON.parse(line))
  }

  return parseCsv(trimmed)
}

function normalizeAnalyticsEvent(row) {
  const nested = row.event && typeof row.event === 'object' ? row.event : row
  const name = firstString(nested.name, nested.event, nested.eventName, row.name, row.event, row.eventName)
  if (!name) return undefined

  const properties = normalizeAnalyticsProperties(nested.properties ?? row.properties)
  const path = firstString(nested.path, row.path, properties.path) ?? '/'

  return {
    name,
    path,
    timestamp: firstString(nested.timestamp, row.timestamp, row.datetime, row.date),
    properties,
  }
}

function normalizeAnalyticsProperties(properties) {
  if (!properties) return {}
  if (typeof properties === 'string') {
    try {
      const parsed = JSON.parse(properties)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return typeof properties === 'object' && !Array.isArray(properties) ? properties : {}
}

function countBy(rows, getKey) {
  return rows.reduce((counts, row) => {
    const key = getKey(row)
    if (!key) return counts
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function topAnalyticsRows(counts) {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([value, count]) => ({ value, count }))
}

function attributionFunnels(events, getKey) {
  const funnels = new Map()

  for (const event of events) {
    const key = getKey(event)
    if (!key) continue

    const current = funnels.get(key) ?? {
      value: key,
      routeViews: 0,
      installCopies: 0,
      githubClicks: 0,
    }

    if (event.name === 'route_view') current.routeViews += 1
    if (event.name === 'install_command_copy') current.installCopies += 1
    if (event.name === 'github_outbound_click') current.githubClicks += 1
    funnels.set(key, current)
  }

  return [...funnels.values()]
    .map((row) => ({
      ...row,
      installCopyRate: row.routeViews > 0 ? row.installCopies / row.routeViews : undefined,
      githubClickRate: row.routeViews > 0 ? row.githubClicks / row.routeViews : undefined,
    }))
    .sort((a, b) => b.routeViews - a.routeViews || b.githubClicks - a.githubClicks || b.installCopies - a.installCopies)
    .slice(0, 8)
}

async function collectCommunityProof() {
  if (!communityProofExportPath) return undefined

  const absolutePath = resolve(communityProofExportPath)
  const source = await readFile(absolutePath, 'utf8')
  const rows = parseCommunityProofExport(source, absolutePath)
  const signals = rows.map(normalizeCommunityProof).filter(Boolean)

  return {
    source: absolutePath,
    rowCount: rows.length,
    signalCount: signals.length,
    discussions: signals.filter((signal) => signal.type === 'discussion').length,
    gallerySubmissions: signals.filter((signal) => signal.type === 'gallery').length,
    externalRepos: signals.filter((signal) => signal.type === 'repo').length,
    externalUrls: signals.filter((signal) => signal.type === 'url').length,
    prs: signals.filter((signal) => signal.type === 'pr').length,
    issues: signals.filter((signal) => signal.type === 'issue').length,
    permissionedGallery: signals.filter((signal) => signal.permissionToFeature).length,
    topStyles: topAnalyticsRows(countBy(signals, (signal) => signal.style ?? 'unknown')),
    topTypes: topAnalyticsRows(countBy(signals, (signal) => signal.type)),
    recentSignals: signals.slice(0, 8),
  }
}

function parseCommunityProofExport(source, absolutePath) {
  const trimmed = source.trim()
  if (!trimmed) return []
  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  if (lines.length > 1 && lines.every((line) => line.startsWith('{'))) {
    return lines.map((line) => JSON.parse(line))
  }

  if (absolutePath.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed.signals)) return parsed.signals
    if (Array.isArray(parsed.items)) return parsed.items
    if (Array.isArray(parsed.rows)) return parsed.rows
    if (Array.isArray(parsed.data)) return parsed.data
    return [parsed]
  }

  if (lines.every((line) => line.startsWith('{'))) {
    return lines.map((line) => JSON.parse(line))
  }

  return parseCsv(trimmed)
}

function normalizeCommunityProof(row) {
  const type = normalizeCommunityType(firstString(row.type, row.Type, row.kind, row.Kind, row.signal, row.Signal))
  const title = firstString(row.title, row.Title, row.name, row.Name, row.project, row.Project)
  const url = firstString(row.url, row.URL, row.link, row.Link, row.repo, row.Repository)
  if (!type || (!title && !url)) return undefined

  return {
    type,
    title,
    url,
    author: firstString(row.author, row.Author, row.user, row.User, row.login, row.Login),
    style: normalizeStyle(firstString(row.style, row.Style, row.theme, row.Theme, row['data-style'])),
    source: firstString(row.source, row.Source),
    permissionToFeature: parseBoolean(firstValue(row.permissionToFeature, row.permission, row.Permission, row.featurePermission, row.FeaturePermission)),
    timestamp: firstString(row.timestamp, row.datetime, row.date, row.Date),
  }
}

function normalizeCommunityType(value) {
  if (!value) return undefined
  const normalized = value.toLowerCase().replace(/[ _-]+/g, '-')
  if (['discussion', 'show-and-tell', 'showcase'].includes(normalized)) return 'discussion'
  if (['gallery', 'gallery-submission', 'submission'].includes(normalized)) return 'gallery'
  if (['repo', 'repository', 'external-repo'].includes(normalized)) return 'repo'
  if (['url', 'site', 'project', 'external-url'].includes(normalized)) return 'url'
  if (['pr', 'pull-request', 'pullrequest'].includes(normalized)) return 'pr'
  if (['issue', 'bug', 'feature-request'].includes(normalized)) return 'issue'
  return normalized
}

function normalizeStyle(value) {
  return value ? value.trim().toLowerCase() : undefined
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return false
  return ['1', 'true', 'yes', 'y', 'permission', 'permitted'].includes(value.trim().toLowerCase())
}

async function collectRegistryAccess() {
  if (!registryAccessExportPath) return undefined

  const absolutePath = resolve(registryAccessExportPath)
  const source = await readFile(absolutePath, 'utf8')
  const rows = parseRegistryAccessExport(source, absolutePath)
  const requests = rows.map(normalizeAccessRequest).filter(Boolean)
  const registryRequests = requests.filter((request) => isRegistryAccessPath(request.path))

  return {
    source: absolutePath,
    rowCount: requests.length,
    matchedRequests: registryRequests.length,
    registryJsonRequests: countPathPrefix(registryRequests, '/registry/registry.json'),
    shadcnRegistryRequests: countPathPrefix(registryRequests, '/registry/shadcn-registry.json'),
    registryItemRequests: countPathPrefix(registryRequests, '/registry/items'),
    componentItemRequests: countRegistryItemType(registryRequests, 'component'),
    blockItemRequests: countRegistryItemType(registryRequests, 'block'),
    themeItemRequests: countRegistryItemType(registryRequests, 'theme'),
    blockMetaRequests: countPathPrefix(registryRequests, '/registry/block-meta.json'),
    componentMetaRequests: countPathPrefix(registryRequests, '/registry/component-meta.json'),
    themeMetaRequests: countPathPrefix(registryRequests, '/registry/theme-meta.json'),
    llmsTxtRequests: countPathPrefix(registryRequests, '/llms.txt'),
    llmsFullTxtRequests: countPathPrefix(registryRequests, '/llms-full.txt'),
    docsRegistryRequests: countPathPrefix(registryRequests, '/docs/registry'),
    cliDocsRequests: countPathPrefix(registryRequests, '/docs/cli'),
    agentDocsRequests: countPathPrefix(registryRequests, '/docs/agent-usage'),
    topPaths: topAnalyticsRows(countBy(registryRequests, (request) => request.path)),
    topRegistryItems: topAnalyticsRows(countBy(registryRequests.filter((request) => request.path.startsWith('/registry/items/')), (request) => request.path)),
    topReferers: topAnalyticsRows(countBy(registryRequests, (request) => request.referer ?? 'direct/unknown')),
    topUserAgents: topAnalyticsRows(countBy(registryRequests, (request) => request.userAgent ?? 'unknown')),
  }
}

function parseRegistryAccessExport(source, absolutePath) {
  const trimmed = source.trim()
  if (!trimmed) return []
  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  if (lines.length > 1 && lines.every((line) => line.startsWith('{'))) {
    return lines.map((line) => JSON.parse(line))
  }

  if (absolutePath.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
    if (Array.isArray(parsed.requests)) return parsed.requests
    if (Array.isArray(parsed.rows)) return parsed.rows
    if (Array.isArray(parsed.data)) return parsed.data
    return [parsed]
  }

  if (lines.every((line) => line.startsWith('{'))) {
    return lines.map((line) => JSON.parse(line))
  }

  return parseCsv(trimmed)
}

function normalizeAccessRequest(row) {
  const nested = row.request && typeof row.request === 'object' ? row.request : row
  const url = firstString(nested.url, nested.URL, nested.requestUrl, row.url, row.URL, row.requestUrl)
  const path = normalizeAccessPath(firstString(nested.path, nested.Path, nested.uri, nested.URI, row.path, row.Path, row.uri, row.URI) ?? url)
  if (!path) return undefined

  return {
    path,
    status: parseNumber(firstValue(nested.status, nested.Status, row.status, row.Status)),
    referer: firstString(nested.referer, nested.referrer, nested.Referer, nested.Referrer, row.referer, row.referrer, row.Referer, row.Referrer),
    userAgent: firstString(nested.userAgent, nested.user_agent, nested['User-Agent'], row.userAgent, row.user_agent, row['User-Agent']),
    timestamp: firstString(nested.timestamp, nested.datetime, nested.date, row.timestamp, row.datetime, row.date),
  }
}

function normalizeAccessPath(value) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return new URL(trimmed).pathname
    }
  } catch {
    return undefined
  }

  const requestPath = trimmed.split(/\s+/).find((part) => part.startsWith('/')) ?? trimmed
  const pathOnly = requestPath.split('?')[0]
  return pathOnly.startsWith('/') ? pathOnly : undefined
}

function isRegistryAccessPath(path) {
  return registryAccessPaths.some((trackedPath) => path === trackedPath || path.startsWith(`${trackedPath}/`))
}

function countPathPrefix(requests, path) {
  return requests.filter((request) => request.path === path || request.path.startsWith(`${path}/`)).length
}

function countRegistryItemType(requests, type) {
  return requests.filter((request) => {
    if (!request.path.startsWith('/registry/items/')) return false
    const itemName = request.path.split('/').pop()?.replace(/\.json$/, '') ?? ''
    if (type === 'block') return itemName.startsWith('block-')
    if (type === 'theme') return itemName.startsWith('theme-')
    return Boolean(itemName) && !itemName.startsWith('block-') && !itemName.startsWith('theme-')
  }).length
}

function adoptionSignalStatus({ github, npm }) {
  return [
    {
      id: 'npm-weekly-downloads',
      label: 'npm weekly downloads >= 100',
      threshold: '>= 100',
      current: npm?.weeklyDownloads ?? null,
      passed: (npm?.weeklyDownloads ?? 0) >= 100,
    },
    {
      id: 'github-stars',
      label: 'GitHub stars >= 10',
      threshold: '>= 10',
      current: github?.stars ?? null,
      passed: (github?.stars ?? 0) >= 10,
    },
    {
      id: 'external-human-issue-or-pr',
      label: 'External human issue or PR present',
      threshold: '> 0 external non-maintainer, non-bot issue or PR',
      current: github?.externalHumanSignals ?? null,
      passed: (github?.externalHumanSignals ?? 0) > 0,
      detail: {
        openIssues: github?.openIssues ?? null,
        closedIssues: github?.closedIssues ?? null,
        openPrs: github?.openPrs ?? null,
        closedPrs: github?.closedPrs ?? null,
      },
    },
    {
      id: 'forks',
      label: 'At least one fork',
      threshold: '> 0',
      current: github?.forks ?? null,
      passed: (github?.forks ?? 0) > 0,
    },
  ]
}

function adoptionSignalValue(signal) {
  if (signal.id !== 'external-human-issue-or-pr') return metric(signal.current)
  return `${metric(signal.current)} external human signals (${metric(signal.detail.openIssues)} open issues / ${metric(signal.detail.closedIssues)} closed issues / ${metric(signal.detail.openPrs)} open PRs / ${metric(signal.detail.closedPrs)} closed PRs)`
}

function buildTelemetryPayload({ github, npm, searchConsole, analytics, registryAccess, communityProof, bundleReport, errors }) {
  const signals = adoptionSignalStatus({ github, npm })
  const passedSignals = signals.filter((signal) => signal.passed).length

  return {
    generatedAt: today,
    repo,
    packageName,
    adoption: {
      completionThreshold: 3,
      passedSignals,
      signalCount: signals.length,
      score: `${passedSignals}/${signals.length}`,
      externallyValidated: passedSignals >= 3,
      signals,
    },
    github,
    npm,
    searchConsole,
    analytics,
    registryAccess,
    communityProof,
    bundleReport,
    errors,
  }
}

function renderReport(payload) {
  const { github, npm, searchConsole, analytics, registryAccess, communityProof, bundleReport, errors } = payload
  const adoptionSignals = payload.adoption.signals
  const passedSignals = payload.adoption.passedSignals

  return `# Telemetry Baseline: ${today}

> Scope: public GitHub and npm adoption signals for \`${packageName}\`. GitHub traffic is collected when \`GITHUB_TOKEN\` has repository traffic permission. Search Console, website analytics, registry/agent access, community proof, and bundle performance can be summarized from local \`SEARCH_CONSOLE_EXPORT\`, \`ANALYTICS_EXPORT\`, \`REGISTRY_ACCESS_EXPORT\`, \`COMMUNITY_PROOF_EXPORT\`, and \`BUNDLE_REPORT_EXPORT\` CSV/JSON files.

## Summary

This is a baseline, not proof of product-market pull. The strategic goal remains external adoption: increasing installs, stars, issues/PRs, website traffic, and registry/agent usage over repeated telemetry passes.

## Adoption Status

| Signal | Current | Status |
| --- | --- | --- |
${adoptionSignals.map((signal) => `| ${signal.label} | ${adoptionSignalValue(signal)} | ${signal.passed ? 'Pass' : 'Not yet'} |`).join('\n')}

Current adoption signal score: **${passedSignals}/${adoptionSignals.length}**. Treat this as directional only; strong adoption requires sustained slope across npm downloads, GitHub activity, website/search traffic, and real usage feedback.

## GitHub

| Metric | Value |
| --- | --- |
| Repository | \`${repo}\` |
| Stars | ${metric(github?.stars)} |
| Forks | ${metric(github?.forks)} |
| Watchers/subscribers | ${metric(github?.watchers)} |
| Open issues | ${metric(github?.openIssues)} |
| Closed issues | ${metric(github?.closedIssues)} |
| Open PRs | ${metric(github?.openPrs)} |
| Closed PRs | ${metric(github?.closedPrs)} |
| External human issue/PR signals | ${metric(github?.externalHumanSignals)} |
| Contributors returned by API | ${metric(github?.contributors)} |
| Releases returned by API | ${metric(github?.releases)} |
| Release asset downloads | ${metric(github?.releaseDownloads)} |
| Traffic views / uniques | ${github?.traffic?.viewsCount !== undefined ? `${metric(github.traffic.viewsCount)} / ${metric(github.traffic.viewsUniques)}` : 'n/a'} |
| Traffic clones / uniques | ${github?.traffic?.clonesCount !== undefined ? `${metric(github.traffic.clonesCount)} / ${metric(github.traffic.clonesUniques)}` : 'n/a'} |
| Default branch | ${metric(github?.defaultBranch)} |
| Last pushed | ${metric(github?.pushedAt)} |
| Private traffic/clones | ${github?.traffic?.error ? `GITHUB_TOKEN present, but traffic endpoints failed: ${github.traffic.error}` : github?.privateTrafficAvailable ? 'Collected when token has repository traffic permission.' : 'Unavailable without repository traffic permission.'} |

${renderTrafficTables(github?.traffic)}

## npm

| Metric | Value |
| --- | --- |
| Package | \`${packageName}\` |
| Latest version | ${metric(npm?.latest)} |
| Versions | ${metric(npm?.versionCount)} |
| Downloads last week | ${metric(npm?.weeklyDownloads)} |
| Downloads last month | ${metric(npm?.monthlyDownloads)} |
| Created | ${metric(npm?.createdAt)} |
| Modified | ${metric(npm?.modifiedAt)} |
| Latest unpacked size | ${npm?.unpackedSize ? `${Math.round(npm.unpackedSize / 1024)} kB` : 'n/a'} |
| Integrity metadata | ${npm?.integrityPresent ? 'present' : 'missing'} |

${renderSearchConsole(searchConsole)}

${renderAnalytics(analytics)}

${renderRegistryAccess(registryAccess)}

${renderCommunityProof(communityProof)}

${renderBundlePerformance(bundleReport)}

## Website / Search / Registry / Community Gaps

| Category | Status | Needed Evidence |
| --- | --- | --- |
| Website analytics | ${analytics ? `Imported ${metric(analytics.eventCount)} events from ANALYTICS_EXPORT` : 'Receiver optional; private counts not collected here'} | Configure VITE_ANALYTICS_ENDPOINT with workers/analytics-receiver.mjs, then compare route views, install CTA clicks, GitHub outbound clicks, theme/block page depth |
| Search analytics | ${searchConsole ? `Imported ${metric(searchConsole.rowCount)} rows from SEARCH_CONSOLE_EXPORT` : 'Missing unless manually exported from Search Console'} | Follow docs/search-console-setup.md, then record impressions, CTR, indexed pages, top queries, and top landing pages |
| GitHub traffic | Missing unless authenticated with repo traffic access | clones, visitors, referring sites, popular content |
| Registry usage | ${registryAccess ? `Imported ${metric(registryAccess.matchedRequests)} registry/agent requests from REGISTRY_ACCESS_EXPORT` : 'Hosted artifacts available; request counts not collected here'} | Compare requests to /registry/registry.json, /registry/shadcn-registry.json, /registry/items/*.json, /registry/block-meta.json, /registry/component-meta.json, /registry/theme-meta.json, /llms.txt, /llms-full.txt, CLI docs, agent docs, and copy/install issues |
| Community proof | ${communityProof ? `Imported ${metric(communityProof.signalCount)} community signals from COMMUNITY_PROOF_EXPORT` : 'Missing unless manually exported from Discussions, gallery issues, or external repos'} | Show and tell Discussions, gallery submissions with permission, external repos, public project URLs, and user-submitted issues/PRs |
| Bundle performance | ${bundleReport ? `Imported ${bundleReport.ok ? 'passing' : 'failing'} bundle budgets from BUNDLE_REPORT_EXPORT` : 'Missing unless bundle:report JSON is imported'} | Run npm run build, export npm run bundle:report -- --json, and compare app JS, largest JS, total JS, and gzip budget checks against conversion telemetry |
| Competitor baseline | Missing in this pass | shadcn registries, Radix Themes, Tremor, MUI templates, Tailwind UI kits |

## Errors

${errors.length ? errors.map((error) => `- ${error}`).join('\n') : '- None for public GitHub/npm collection.'}

## Next Actions

- Repeat this report after releases and docs changes to measure slope, not one-time values.
- Export Cloudflare Worker logs or analytics events and rerun with ANALYTICS_EXPORT=path/to/events.jsonl.
- Export CDN/server access logs for registry and agent routes, then rerun with REGISTRY_ACCESS_EXPORT=path/to/access-log.jsonl.
- Export accepted Discussions, gallery submissions, external repos, and community project URLs, then rerun with COMMUNITY_PROOF_EXPORT=path/to/community-proof.csv.
- Export bundle performance after npm run build with npm run bundle:report -- --json > path/to/bundle-report.json, then rerun with BUNDLE_REPORT_EXPORT=path/to/bundle-report.json.
- Add GitHub traffic collection when a token with repository traffic permissions is available.
- Submit the sitemap and inspect high-intent routes with docs/search-console-setup.md after every docs deploy, then rerun with SEARCH_CONSOLE_EXPORT=path/to/export.csv.
- Use npm weekly/monthly download trend and fresh example builds as release-readiness gates.
`
}

function renderSearchConsole(searchConsole) {
  if (!searchConsole) {
    return `## Search Console

Search Console data was not collected. Export query or page performance from Search Console and rerun with \`SEARCH_CONSOLE_EXPORT=path/to/export.csv npm run telemetry:collect\`.`
  }

  return `## Search Console

| Metric | Value |
| --- | --- |
| Source | \`${searchConsole.source}\` |
| Imported rows | ${metric(searchConsole.rowCount)} |
| Clicks | ${metric(searchConsole.clicks)} |
| Impressions | ${metric(searchConsole.impressions)} |
| CTR | ${formatPercent(searchConsole.ctr)} |
| Average position | ${formatDecimal(searchConsole.position)} |

Top queries:

| Query | Clicks | Impressions | CTR | Position |
| --- | --- | --- | --- | --- |
${renderSearchRows(searchConsole.topQueries)}

Top pages:

| Page | Clicks | Impressions | CTR | Position |
| --- | --- | --- | --- | --- |
${renderSearchRows(searchConsole.topPages)}`
}

function renderSearchRows(rows) {
  return rows.length
    ? rows.map((row) => `| ${metric(row.value)} | ${metric(row.clicks)} | ${metric(row.impressions)} | ${formatPercent(row.ctr)} | ${formatDecimal(row.position)} |`).join('\n')
    : '| n/a | n/a | n/a | n/a | n/a |'
}

function renderAnalytics(analytics) {
  if (!analytics) {
    return `## Website Analytics

Website analytics were not collected. Export sanitized Worker logs or event rows and rerun with \`ANALYTICS_EXPORT=path/to/events.jsonl npm run telemetry:collect\`.`
  }

  return `## Website Analytics

| Metric | Value |
| --- | --- |
| Source | \`${analytics.source}\` |
| Imported events | ${metric(analytics.eventCount)} |
| Route views | ${metric(analytics.routeViews)} |
| Install command copies | ${metric(analytics.installCopies)} |
| GitHub outbound clicks | ${metric(analytics.githubOutboundClicks)} |
| Block share copies | ${metric(analytics.blockShareCopies)} |
| Theme snippet copies | ${metric(analytics.themeSnippetCopies)} |
| Theme selections/cycles | ${metric(analytics.themeSelections)} |

Event counts:

| Event | Count |
| --- | --- |
${renderCountRows(analytics.countsByEvent)}

Top routes:

| Route | Events |
| --- | --- |
${renderAnalyticsRows(analytics.topRoutes)}

Top GitHub click targets:

| Target | Clicks |
| --- | --- |
${renderAnalyticsRows(analytics.topGithubClickTargets)}

Top launch campaigns:

| Campaign | Route views |
| --- | --- |
${renderAnalyticsRows(analytics.topCampaigns)}

Top launch sources:

| Source | Route views |
| --- | --- |
${renderAnalyticsRows(analytics.topSources)}

Top launch mediums:

| Medium | Route views |
| --- | --- |
${renderAnalyticsRows(analytics.topMediums)}

Top GitHub click sources:

| Source | Clicks |
| --- | --- |
${renderAnalyticsRows(analytics.topGithubClickSources)}

Top install-copy sources:

| Source | Copies |
| --- | --- |
${renderAnalyticsRows(analytics.topInstallCopySources)}

Campaign conversion funnel:

| Campaign | Route views | Install copies | GitHub clicks | Install copy rate | GitHub click rate |
| --- | --- | --- | --- | --- | --- |
${renderAttributionFunnels(analytics.campaignFunnels)}

Source conversion funnel:

| Source | Route views | Install copies | GitHub clicks | Install copy rate | GitHub click rate |
| --- | --- | --- | --- | --- | --- |
${renderAttributionFunnels(analytics.sourceFunnels)}`
}

function renderCountRows(counts) {
  const rows = Object.entries(counts).sort(([, a], [, b]) => b - a)
  return rows.length ? rows.map(([event, count]) => `| ${event} | ${count} |`).join('\n') : '| n/a | n/a |'
}

function renderAnalyticsRows(rows) {
  return rows.length ? rows.map((row) => `| ${metric(row.value)} | ${metric(row.count)} |`).join('\n') : '| n/a | n/a |'
}

function renderAttributionFunnels(rows) {
  return rows.length
    ? rows.map((row) => `| ${metric(row.value)} | ${metric(row.routeViews)} | ${metric(row.installCopies)} | ${metric(row.githubClicks)} | ${formatPercent(row.installCopyRate)} | ${formatPercent(row.githubClickRate)} |`).join('\n')
    : '| n/a | n/a | n/a | n/a | n/a | n/a |'
}

function renderRegistryAccess(registryAccess) {
  if (!registryAccess) {
    return `## Registry / Agent Access

Registry and agent access logs were not collected. Export CDN or server access rows and rerun with \`REGISTRY_ACCESS_EXPORT=path/to/access-log.jsonl npm run telemetry:collect\`.`
  }

  return `## Registry / Agent Access

| Metric | Value |
| --- | --- |
| Source | \`${registryAccess.source}\` |
| Imported access rows | ${metric(registryAccess.rowCount)} |
| Matched registry/agent requests | ${metric(registryAccess.matchedRequests)} |
| /registry/registry.json requests | ${metric(registryAccess.registryJsonRequests)} |
| /registry/shadcn-registry.json requests | ${metric(registryAccess.shadcnRegistryRequests)} |
| /registry/items/*.json requests | ${metric(registryAccess.registryItemRequests)} |
| Component item requests | ${metric(registryAccess.componentItemRequests)} |
| Block item requests | ${metric(registryAccess.blockItemRequests)} |
| Theme item requests | ${metric(registryAccess.themeItemRequests)} |
| /registry/block-meta.json requests | ${metric(registryAccess.blockMetaRequests)} |
| /registry/component-meta.json requests | ${metric(registryAccess.componentMetaRequests)} |
| /registry/theme-meta.json requests | ${metric(registryAccess.themeMetaRequests)} |
| /llms.txt requests | ${metric(registryAccess.llmsTxtRequests)} |
| /llms-full.txt requests | ${metric(registryAccess.llmsFullTxtRequests)} |
| /docs/registry requests | ${metric(registryAccess.docsRegistryRequests)} |
| /docs/cli requests | ${metric(registryAccess.cliDocsRequests)} |
| /docs/agent-usage requests | ${metric(registryAccess.agentDocsRequests)} |

Top registry/agent paths:

| Path | Requests |
| --- | --- |
${renderAnalyticsRows(registryAccess.topPaths)}

Top registry item paths:

| Item path | Requests |
| --- | --- |
${renderAnalyticsRows(registryAccess.topRegistryItems)}

Top registry/agent referrers:

| Referrer | Requests |
| --- | --- |
${renderAnalyticsRows(registryAccess.topReferers)}

Top registry/agent user agents:

| User agent | Requests |
| --- | --- |
${renderAnalyticsRows(registryAccess.topUserAgents)}`
}

function renderCommunityProof(communityProof) {
  if (!communityProof) {
    return `## Community Proof

Community proof was not collected. Export accepted Show and tell Discussions, gallery submissions, external repos, project URLs, or public community follow-ups and rerun with \`COMMUNITY_PROOF_EXPORT=path/to/community-proof.csv npm run telemetry:collect\`.`
  }

  return `## Community Proof

Community proof is supporting evidence. It helps explain the adoption funnel, but it does not replace the public completion gate.

| Metric | Value |
| --- | --- |
| Source | \`${communityProof.source}\` |
| Imported rows | ${metric(communityProof.rowCount)} |
| Accepted community signals | ${metric(communityProof.signalCount)} |
| Show and tell Discussions | ${metric(communityProof.discussions)} |
| Gallery submissions | ${metric(communityProof.gallerySubmissions)} |
| Permissioned gallery submissions | ${metric(communityProof.permissionedGallery)} |
| External repos | ${metric(communityProof.externalRepos)} |
| External project URLs | ${metric(communityProof.externalUrls)} |
| Community PRs | ${metric(communityProof.prs)} |
| Community issues | ${metric(communityProof.issues)} |

Signal types:

| Type | Count |
| --- | --- |
${renderAnalyticsRows(communityProof.topTypes)}

Theme styles in community proof:

| Style | Signals |
| --- | --- |
${renderAnalyticsRows(communityProof.topStyles)}

Recent community proof:

| Type | Title | Style | URL |
| --- | --- | --- | --- |
${renderCommunityRows(communityProof.recentSignals)}`
}

function renderCommunityRows(rows) {
  return rows.length
    ? rows.map((row) => `| ${metric(row.type)} | ${metric(row.title)} | ${metric(row.style)} | ${metric(row.url)} |`).join('\n')
    : '| n/a | n/a | n/a | n/a |'
}

function renderBundlePerformance(bundleReport) {
  if (!bundleReport) {
    return `## Bundle Performance

Bundle performance was not collected. Generate and import a JSON bundle report when comparing website performance with adoption telemetry:

\`\`\`bash
npm run build
npm run bundle:report -- --json > path/to/bundle-report.json
BUNDLE_REPORT_EXPORT=path/to/bundle-report.json npm run telemetry:collect
\`\`\``
  }

  return `## Bundle Performance

Bundle performance is release-health evidence. It helps explain conversion changes, but it does not replace the public completion gate.

| Metric | Value |
| --- | --- |
| Source | \`${bundleReport.source}\` |
| Budget status | ${bundleReport.ok ? 'Pass' : 'Fail'} |
| App JS | ${formatBundleAsset(bundleReport.appJs)} |
| Largest JS | ${formatBundleAsset(bundleReport.largestJs)} |
| Total JS bytes | ${formatBytes(bundleReport.totalJsBytes)} |
| Total JS gzip bytes | ${formatBytes(bundleReport.totalJsGzipBytes)} |

Budget checks:

| Check | Current | Limit | Status |
| --- | --- | --- | --- |
${renderBundleBudgetRows(bundleReport.budgetChecks)}`
}

function renderBundleBudgetRows(rows = []) {
  return rows.length
    ? rows.map((row) => `| ${metric(row.label || row.id)} | ${formatBytes(row.current)} | ${formatBytes(row.limit)} | ${row.passed ? 'Pass' : 'Fail'} |`).join('\n')
    : '| n/a | n/a | n/a | n/a |'
}

function formatBundleAsset(asset) {
  if (!asset) return 'n/a'
  return `${metric(asset.file)} (${formatBytes(asset.bytes)} / ${formatBytes(asset.gzipBytes)} gzip)`
}

function formatBytes(value) {
  return value === undefined ? 'n/a' : `${metric(value)} B`
}

function formatPercent(value) {
  return value === undefined ? 'n/a' : `${(value * 100).toFixed(2)}%`
}

function formatDecimal(value) {
  return value === undefined ? 'n/a' : value.toFixed(1)
}

function renderTrafficTables(traffic) {
  if (!traffic || traffic.error || (traffic.viewsCount === undefined && traffic.clonesCount === undefined)) {
    return `## GitHub Traffic Detail

Traffic detail was not collected. Provide a \`GITHUB_TOKEN\` with repository traffic permission to collect views, clones, popular referrers, and popular paths.`
  }

  const referrers = traffic.topReferrers.length
    ? traffic.topReferrers.map((item) => `| ${metric(item.referrer)} | ${metric(item.count)} | ${metric(item.uniques)} |`).join('\n')
    : '| n/a | n/a | n/a |'
  const paths = traffic.topPaths.length
    ? traffic.topPaths.map((item) => `| ${metric(item.path)} | ${metric(item.title)} | ${metric(item.count)} | ${metric(item.uniques)} |`).join('\n')
    : '| n/a | n/a | n/a | n/a |'

  return `## GitHub Traffic Detail

Top referrers:

| Referrer | Views | Unique visitors |
| --- | --- | --- |
${referrers}

Top paths:

| Path | Title | Views | Unique visitors |
| --- | --- | --- | --- |
${paths}`
}

const errors = []
const [github, npm, searchConsole, analytics, registryAccess, communityProof, bundleReport] = await Promise.all([
  collectGitHub().catch((error) => {
    errors.push(`GitHub: ${error.message}`)
    return undefined
  }),
  collectNpm().catch((error) => {
    errors.push(`npm: ${error.message}`)
    return undefined
  }),
  collectSearchConsole().catch((error) => {
    errors.push(`Search Console: ${error.message}`)
    return undefined
  }),
  collectAnalytics().catch((error) => {
    errors.push(`Website analytics: ${error.message}`)
    return undefined
  }),
  collectRegistryAccess().catch((error) => {
    errors.push(`Registry access: ${error.message}`)
    return undefined
  }),
  collectCommunityProof().catch((error) => {
    errors.push(`Community proof: ${error.message}`)
    return undefined
  }),
  collectBundleReport().catch((error) => {
    errors.push(`Bundle report: ${error.message}`)
    return undefined
  }),
])

const payload = buildTelemetryPayload({ github, npm, searchConsole, analytics, registryAccess, communityProof, bundleReport, errors })
const report = renderReport(payload)
const outputPath = resolve('research', `telemetry-${today}.md`)
const jsonOutputPath = resolve('research', `telemetry-${today}.json`)
if (writeReport) {
  await mkdir(resolve('research'), { recursive: true })
  await writeFile(outputPath, report)
  await writeFile(jsonOutputPath, `${JSON.stringify(payload, null, 2)}\n`)
}

if (jsonMode) {
  console.log(JSON.stringify(payload, null, 2))
} else {
  console.log(report)
  if (writeReport) {
    console.log(`Saved telemetry report to ${outputPath}`)
    console.log(`Saved telemetry JSON to ${jsonOutputPath}`)
  } else {
    console.log('Telemetry report not written because --no-write was provided')
  }
}

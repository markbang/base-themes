import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const fixtureEnv = {
  SEARCH_CONSOLE_EXPORT: resolve('research/telemetry-fixtures/search-console-export.csv'),
  ANALYTICS_EXPORT: resolve('research/telemetry-fixtures/analytics-events.jsonl'),
  REGISTRY_ACCESS_EXPORT: resolve('research/telemetry-fixtures/registry-access.jsonl'),
  COMMUNITY_PROOF_EXPORT: resolve('research/telemetry-fixtures/community-proof.csv'),
  BUNDLE_REPORT_EXPORT: resolve('research/telemetry-fixtures/bundle-report.json'),
}

function fail(message, details = []) {
  console.error(`Telemetry fixture import invalid: ${message}`)
  for (const detail of details) console.error(`- ${detail}`)
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(execFileSync('node', ['scripts/collect-telemetry.mjs', '--json', '--no-write'], {
    encoding: 'utf8',
    env: { ...process.env, ...fixtureEnv },
    maxBuffer: 20 * 1024 * 1024,
  }))
} catch (error) {
  fail('collect-telemetry --json must import fixture exports and emit valid JSON', [error.message])
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) fail(`${label} should be ${expected}`, [`got ${actual}`])
}

expectEqual('Search Console row count', payload.searchConsole?.rowCount, 3)
expectEqual('Search Console clicks', payload.searchConsole?.clicks, 23)
expectEqual('Search Console impressions', payload.searchConsole?.impressions, 490)
expectEqual('Website analytics event count', payload.analytics?.eventCount, 9)
expectEqual('Website analytics install command copies', payload.analytics?.installCopies, 1)
expectEqual('Website analytics GitHub outbound clicks', payload.analytics?.githubOutboundClicks, 4)
expectEqual('Website analytics theme snippet copies', payload.analytics?.themeSnippetCopies, 1)
expectEqual('Website analytics top campaigns', payload.analytics?.topCampaigns?.[0]?.value, 'launch-0-1-2')
expectEqual('Website analytics top sources', payload.analytics?.topSources?.[0]?.value, 'github-release')
expectEqual('Website analytics top mediums', payload.analytics?.topMediums?.[0]?.value, 'release-notes')
expectEqual('Website analytics top GitHub click sources', payload.analytics?.topGithubClickSources?.[0]?.value, 'github-release')
expectEqual('Website analytics top install-copy sources', payload.analytics?.topInstallCopySources?.[0]?.value, 'github-release')
expectEqual('Website analytics campaign funnel value', payload.analytics?.campaignFunnels?.[0]?.value, 'launch-0-1-2')
expectEqual('Website analytics campaign funnel route views', payload.analytics?.campaignFunnels?.[0]?.routeViews, 1)
expectEqual('Website analytics campaign funnel install copies', payload.analytics?.campaignFunnels?.[0]?.installCopies, 1)
expectEqual('Website analytics campaign funnel GitHub clicks', payload.analytics?.campaignFunnels?.[0]?.githubClicks, 4)
expectEqual('Website analytics source funnel value', payload.analytics?.sourceFunnels?.[0]?.value, 'github-release')
expectEqual('Website analytics source funnel install copies', payload.analytics?.sourceFunnels?.[0]?.installCopies, 1)
expectEqual('Website analytics source funnel GitHub clicks', payload.analytics?.sourceFunnels?.[0]?.githubClicks, 4)
expectEqual('Registry access imported rows', payload.registryAccess?.rowCount, 10)
expectEqual('Registry access matched requests', payload.registryAccess?.matchedRequests, 9)
expectEqual('Registry access component item requests', payload.registryAccess?.componentItemRequests, 1)
expectEqual('Registry access block item requests', payload.registryAccess?.blockItemRequests, 1)
expectEqual('Registry access theme item requests', payload.registryAccess?.themeItemRequests, 1)
expectEqual('Community proof signals', payload.communityProof?.signalCount, 4)
expectEqual('Community proof discussions', payload.communityProof?.discussions, 1)
expectEqual('Community proof permissioned gallery', payload.communityProof?.permissionedGallery, 2)
expectEqual('Community proof external repos', payload.communityProof?.externalRepos, 1)
expectEqual('Community proof external URLs', payload.communityProof?.externalUrls, 1)
expectEqual('Bundle report budget status', payload.bundleReport?.ok, true)
expectEqual('Bundle report app JS gzip bytes', payload.bundleReport?.appJs?.gzipBytes, 21000)
expectEqual('Bundle report largest JS bytes', payload.bundleReport?.largestJs?.bytes, 350000)
expectEqual('Bundle report budget check count', payload.bundleReport?.budgetChecks?.length, 3)

if (!payload.bundleReport?.budgetChecks?.every((check) => check.passed)) {
  fail('Bundle report fixture budget checks should all pass')
}

const githubTargets = payload.analytics?.topGithubClickTargets?.map((row) => row.value) ?? []
for (const target of ['repo-star', 'repo-fork', 'feature-request', 'good-first-issues']) {
  if (!githubTargets.includes(target)) fail('GitHub outbound click fixture targets were not summarized', [target])
}

const topRegistryItems = payload.registryAccess?.topRegistryItems?.map((row) => row.value) ?? []
for (const itemPath of ['/registry/items/button.json', '/registry/items/block-dashboard-shell.json', '/registry/items/theme-enterprise.json']) {
  if (!topRegistryItems.includes(itemPath)) fail('Registry item fixture paths were not summarized', [itemPath])
}

if (payload.adoption?.completionThreshold !== 3 || payload.adoption?.signalCount !== 4) {
  fail('fixture import must preserve the public adoption gate shape')
}

console.log('Telemetry fixture import valid: search, analytics, registry, community, and bundle exports summarized correctly')

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { handleAnalyticsRequest } from '../workers/analytics-receiver.mjs'

async function request(body, init = {}) {
  return handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://base-themes.bangwu.me', ...init.headers },
    body: JSON.stringify(body),
    ...init,
  }))
}

const writes = []
const valid = await request({
  name: 'install_command_copy',
  path: '/docs/installation',
  timestamp: '2026-05-29T00:00:00.000Z',
  properties: {
    source: 'docs',
    ignored: 'private-ish',
    target: '/docs/cli',
  },
}, {
  // Request only accepts standard fields; env is passed below through the handler directly.
})

assert.equal(valid.status, 200)
assert.deepEqual(await valid.json(), { ok: true })
assert.equal(valid.headers.get('access-control-allow-origin'), 'https://base-themes.bangwu.me')

const withEnv = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: 'github_outbound_click',
    path: '/themes/bento',
    properties: { source: 'theme-detail', detail: 'bento', target: 'repo-star' },
  }),
}), {
  ANALYTICS_QUEUE: {
    send(event) {
      writes.push(event)
    },
  },
})

assert.equal(withEnv.status, 200)
assert.equal(writes.length, 1)
assert.deepEqual(writes[0].properties, { source: 'theme-detail', detail: 'bento', target: 'repo-star' })

const snippetCopy = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: 'theme_snippet_copy',
    path: '/themes/enterprise',
    properties: { source: 'theme-detail', detail: 'enterprise', label: 'Copy CSS', themeStyle: 'enterprise' },
  }),
}), {
  ANALYTICS_QUEUE: {
    send(event) {
      writes.push(event)
    },
  },
})

assert.equal(snippetCopy.status, 200)
assert.equal(writes.length, 2)
assert.deepEqual(writes[1].properties, { source: 'theme-detail', detail: 'enterprise', label: 'Copy CSS', themeStyle: 'enterprise' })

const componentFeedback = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: 'github_outbound_click',
    path: '/components/button',
    properties: { source: 'component-docs', component: 'button', target: 'feature-request' },
  }),
}), {
  ANALYTICS_QUEUE: {
    send(event) {
      writes.push(event)
    },
  },
})

assert.equal(componentFeedback.status, 200)
assert.equal(writes.length, 3)
assert.deepEqual(writes[2].properties, { source: 'component-docs', component: 'button', target: 'feature-request' })

const attributedRouteView = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: 'route_view',
    path: '/docs/installation',
    properties: { campaign: 'base-themes-0-1-2', source: 'github-release', medium: 'release-notes', content: 'install-docs' },
  }),
}), {
  ANALYTICS_QUEUE: {
    send(event) {
      writes.push(event)
    },
  },
})

assert.equal(attributedRouteView.status, 200)
assert.equal(writes.length, 4)
assert.deepEqual(writes[3].properties, { campaign: 'base-themes-0-1-2', source: 'github-release', medium: 'release-notes', content: 'install-docs' })

const badEvent = await request({ name: 'email_capture', path: '/pricing' })
assert.equal(badEvent.status, 400)
assert.match((await badEvent.text()), /Unknown event name/)

const badOrigin = await request({ name: 'route_view', path: '/docs/cli' }, {
  headers: { origin: 'https://example.com' },
})
assert.equal(badOrigin.status, 403)
assert.match((await badOrigin.text()), /Origin not allowed/)

const configuredOrigin = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://preview.example.test' },
  body: JSON.stringify({ name: 'route_view', path: '/blocks' }),
}), {
  ALLOWED_ORIGINS: 'https://preview.example.test,https://base-themes.bangwu.me',
})
assert.equal(configuredOrigin.status, 200)
assert.equal(configuredOrigin.headers.get('access-control-allow-origin'), 'https://preview.example.test')

const badMethod = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', { method: 'GET' }))
assert.equal(badMethod.status, 405)

const badType = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'POST',
  headers: { 'content-type': 'text/plain' },
  body: 'route_view',
}))
assert.equal(badType.status, 415)

const options = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'OPTIONS',
  headers: { origin: 'https://base-themes.bangwu.me' },
}))
assert.equal(options.status, 204)
assert.equal(options.headers.get('access-control-allow-methods'), 'POST, OPTIONS')

const blockedOptions = await handleAnalyticsRequest(new Request('https://analytics.example.test/events', {
  method: 'OPTIONS',
  headers: { origin: 'https://example.com' },
}))
assert.equal(blockedOptions.status, 403)

const appSource = readFileSync('src/App.tsx', 'utf8')
const requiredGithubTargets = [
  'repo-star',
  'repo-fork',
  'show-and-tell',
  'feature-request',
  'good-first-issues',
  'gallery-submission',
]
for (const target of requiredGithubTargets) {
  assert.ok(appSource.includes(`'${target}'`), `App should track ${target} GitHub outbound clicks`)
}
assert.doesNotMatch(appSource, /target:\s*'repo'\b/, 'Use repo-star instead of ambiguous repo target')
assert.doesNotMatch(appSource, /target:\s*'feature-issue'\b/, 'Use feature-request instead of feature-issue target')
assert.doesNotMatch(appSource, /github_outbound_click'\s*,\s*\{\s*source:\s*'topbar'\s*\}/, 'Topbar GitHub click should include target')

const analyticsSource = readFileSync('src/analytics.ts', 'utf8')
for (const attributionField of ['utm_campaign', 'utm_source', 'utm_medium', 'utm_content']) {
  assert.ok(analyticsSource.includes(attributionField), `Route view tracking should capture ${attributionField}`)
}
assert.match(analyticsSource, /sanitizeProperties\(\{\s*\.\.\.attributionProperties\(\),\s*\.\.\.properties\s*\}\)/s, 'All analytics events should include launch attribution properties')
assert.doesNotMatch(analyticsSource, /trackEvent\('route_view',\s*\{\s*path,\s*\.\.\.attributionProperties\(\)/, 'Attribution should be applied once in trackEvent, not only route_view')

console.log('Analytics receiver valid: accepted whitelisted funnel events and properties, rejected invalid input, enforced origin allowlist, returned CORS headers, and verified GitHub outbound target names')

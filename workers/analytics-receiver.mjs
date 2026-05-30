const allowedEvents = new Set([
  'route_view',
  'internal_navigation',
  'install_command_copy',
  'github_outbound_click',
  'theme_style_cycle',
  'theme_style_select',
  'theme_snippet_copy',
  'color_theme_toggle',
  'block_share_copy',
])

const allowedProperties = new Set([
  'block',
  'campaign',
  'component',
  'content',
  'detail',
  'from',
  'label',
  'medium',
  'path',
  'source',
  'target',
  'themeStyle',
  'to',
])

const defaultAllowedOrigins = [
  'https://base-themes.bangwu.me',
  'http://localhost:5175',
  'http://localhost:5176',
]

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(init.request, init.env),
      ...init.headers,
    },
  })
}

function getAllowedOrigins(env = {}) {
  const configured = typeof env.ALLOWED_ORIGINS === 'string'
    ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []
  return configured.length ? configured : defaultAllowedOrigins
}

function requestOriginAllowed(request, env = {}) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  return getAllowedOrigins(env).includes(origin)
}

function corsHeaders(request, env = {}) {
  const origin = request?.headers.get('origin')
  const allowedOrigin = origin && getAllowedOrigins(env).includes(origin) ? origin : defaultAllowedOrigins[0]
  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  }
}

function sanitizeString(value, maxLength) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

function sanitizePath(value) {
  const path = sanitizeString(value, 256)
  if (!path || !path.startsWith('/')) return '/'
  return path
}

function sanitizeProperties(properties) {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return {}

  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => allowedProperties.has(key) && ['string', 'number', 'boolean'].includes(typeof value))
      .map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 160) : value]),
  )
}

function parseEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Expected a JSON object.' }
  }

  const name = sanitizeString(body.name, 80)
  if (!name || !allowedEvents.has(name)) {
    return { error: 'Unknown event name.' }
  }

  const timestamp = sanitizeString(body.timestamp, 64) || new Date().toISOString()

  return {
    event: {
      name,
      path: sanitizePath(body.path),
      timestamp,
      properties: sanitizeProperties(body.properties),
    },
  }
}

async function persistEvent(env, event) {
  const line = JSON.stringify(event)

  if (env.BASE_THEMES_ANALYTICS?.writeDataPoint) {
    env.BASE_THEMES_ANALYTICS.writeDataPoint({
      blobs: [event.name, event.path],
      doubles: [1],
      indexes: [event.name],
    })
  }

  if (env.ANALYTICS_QUEUE?.send) {
    await env.ANALYTICS_QUEUE.send(event)
  }

  console.log(line)
}

export async function handleAnalyticsRequest(request, env = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: requestOriginAllowed(request, env) ? 204 : 403, headers: corsHeaders(request, env) })
  }

  if (!requestOriginAllowed(request, env)) {
    return json({ error: 'Origin not allowed.' }, { status: 403, request, env })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, { status: 405, request, env })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return json({ error: 'Expected application/json.' }, { status: 415, request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400, request, env })
  }

  const result = parseEvent(body)
  if (result.error) {
    return json({ error: result.error }, { status: 400, request, env })
  }

  await persistEvent(env, result.event)
  return json({ ok: true }, { request, env })
}

export default {
  fetch: handleAnalyticsRequest,
}

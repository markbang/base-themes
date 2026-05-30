type AnalyticsValue = string | number | boolean | null | undefined

type AnalyticsProperties = Record<string, AnalyticsValue>

const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined

function sanitizeProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )),
  )
}

function attributionProperties() {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  return {
    campaign: params.get('utm_campaign') ?? undefined,
    source: params.get('utm_source') ?? undefined,
    medium: params.get('utm_medium') ?? undefined,
    content: params.get('utm_content') ?? undefined,
  }
}

export function trackEvent(name: string, properties?: AnalyticsProperties) {
  if (!endpoint || typeof window === 'undefined') return

  const payload = JSON.stringify({
    name,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    properties: sanitizeProperties({ ...attributionProperties(), ...properties }),
  })

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }))
    if (sent) return
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

export function trackRouteView(path: string, properties?: AnalyticsProperties) {
  trackEvent('route_view', { path, ...properties })
}

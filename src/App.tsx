import { lazy, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Blocks,
  Code2,
  Copy,
  Eye,
  GitFork,
  ImagePlus,
  Languages,
  ListChecks,
  MessageCircle,
  MessageSquarePlus,
  Moon,
  Package,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react'
import {
  Button,
  Input,
  Tooltip,
} from './components/ui'
import { ComponentDemo } from './components/ComponentDemo'
import { useLocale, useT } from './i18n'
import { useTheme } from './hooks/useTheme'
import { trackEvent, trackRouteView } from './analytics'
import { blockDemos } from './docs/blockDocs'
import { componentMeta } from './docs/componentMeta'
import { staticPageMeta } from './docs/staticPageMeta'
import type { StaticDocsPageId } from './docs/StaticDocsPages'
import { docsRoot, navigateTo, routeChangeEvent, toComponentPath } from './docs/routing'
import { themeStyleDescriptions, themeStyleLabels, themeStyles, type ThemeStyle } from './styles/themeList'
import './App.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const StaticDocsPages = lazy(() => import('./docs/StaticDocsPages'))
const ComponentDocsPage = lazy(() => import('./docs/ComponentDocsPage'))

const PROJECT_REPO_URL = 'https://github.com/markbang/base-themes'
const PROJECT_FORK_URL = `${PROJECT_REPO_URL}/fork`
const SHOW_AND_TELL_URL = `${PROJECT_REPO_URL}/discussions/new?category=show-and-tell`
const FEATURE_REQUEST_URL = `${PROJECT_REPO_URL}/issues/new?template=feature_request.yml`
const GALLERY_SUBMISSION_URL = `${PROJECT_REPO_URL}/issues/new?template=gallery_submission.yml`
const GOOD_FIRST_ISSUES_URL = `${PROJECT_REPO_URL}/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22`

type SeoPage = {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  keywords?: string[]
  notFound?: boolean
}

const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://base-themes.bangwu.me'
const siteName = 'Base Themes'
const registryBaseUrl = `${siteUrl}/registry`
const defaultSeoImage = '/previews/base-themes-bento.png'
const defaultKeywords = [
  'Base UI React components',
  'React component library',
  'themeable React components',
  'Bento UI components',
  'shadcn themes',
  'accessible React components',
]

const staticSeoPages = Object.fromEntries(staticPageMeta.map((meta) => {
  const { id, title, description, path, image, type, keywords } = meta
  return [id, { title, description, path, image, type, keywords }]
})) as Record<string, SeoPage>
const staticPageIdByPath = new Map(staticPageMeta.map((page) => [page.path, page.id]))

const notFoundSeoPage: SeoPage = {
  title: 'Page Not Found — Base Themes',
  description: 'The page you requested could not be found, or it may have moved. Check the URL and try again.',
  path: '/404',
  type: 'website',
  notFound: true,
}

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString()
}

function setMetaAttribute(selector: string, attr: 'content' | 'href', value: string) {
  let element = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)
  if (!element) {
    element = selector.startsWith('link') ? document.createElement('link') : document.createElement('meta')

    const nameMatch = selector.match(/name="([^"]+)"/)
    const propertyMatch = selector.match(/property="([^"]+)"/)
    const relMatch = selector.match(/rel="([^"]+)"/)
    if (nameMatch) element.setAttribute('name', nameMatch[1])
    if (propertyMatch) element.setAttribute('property', propertyMatch[1])
    if (relMatch) element.setAttribute('rel', relMatch[1])
    document.head.appendChild(element)
  }
  element.setAttribute(attr, value)
}

function useSeo(page: SeoPage) {
  useEffect(() => {
    document.title = page.title
    setMetaAttribute('meta[name="description"]', 'content', page.description)

    if (page.notFound) {
      // Unknown routes must not be indexed: noindex, no canonical, no JSON-LD.
      setMetaAttribute('meta[name="robots"]', 'content', 'noindex')
      document.head.querySelector('link[rel="canonical"]')?.remove()
      document.head.querySelector('script#structured-data')?.remove()
      return
    }

    const canonical = absoluteUrl(page.path)
    const image = absoluteUrl(page.image ?? defaultSeoImage)
    const keywords = [...defaultKeywords, ...(page.keywords ?? [])].join(', ')

    setMetaAttribute('meta[name="keywords"]', 'content', keywords)
    setMetaAttribute('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large')
    setMetaAttribute('link[rel="canonical"]', 'href', canonical)
    setMetaAttribute('meta[property="og:site_name"]', 'content', siteName)
    setMetaAttribute('meta[property="og:type"]', 'content', page.type ?? 'website')
    setMetaAttribute('meta[property="og:title"]', 'content', page.title)
    setMetaAttribute('meta[property="og:description"]', 'content', page.description)
    setMetaAttribute('meta[property="og:url"]', 'content', canonical)
    setMetaAttribute('meta[property="og:image"]', 'content', image)
    setMetaAttribute('meta[property="og:image:alt"]', 'content', `${siteName} theme preview`)
    setMetaAttribute('meta[name="twitter:title"]', 'content', page.title)
    setMetaAttribute('meta[name="twitter:description"]', 'content', page.description)
    setMetaAttribute('meta[name="twitter:image"]', 'content', image)
  }, [page])
}

function getSeoPage(page: string, componentId: string, themeStyle?: ThemeStyle): SeoPage {
  if (page === 'not-found') return notFoundSeoPage
  const meta = componentMeta.find((component) => component.id === componentId) ?? componentMeta[0]
  const seoPage = page === 'components'
    ? {
        title: `${meta.title} React Component — Base Themes`,
        description: `${meta.summary} Includes interactive examples, API reference, keyboard interactions, and themeable Base UI styling.`,
        path: toComponentPath(meta.id),
        type: 'article' as const,
        keywords: [meta.title, `${meta.title} React component`, `${meta.title} Base UI`, `${meta.group} component`],
      }
    : page === 'block-detail'
      ? getBlockSeoPage(componentId)
    : page === 'theme-detail' && themeStyle
      ? getThemeSeoPage(themeStyle)
    : staticSeoPages[page] ?? staticSeoPages.landing

  return seoPage
}

function handleInternalNavigation(path: string, source: string) {
  trackEvent('internal_navigation', { source, target: path })
  navigateTo(path)
}

function usePathname() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('popstate', callback)
      window.addEventListener(routeChangeEvent, callback)
      return () => {
        window.removeEventListener('popstate', callback)
        window.removeEventListener(routeChangeEvent, callback)
      }
    },
    () => window.location.pathname,
    () => docsRoot,
  )
}

function toThemePath(style: ThemeStyle) {
  return `/themes/${style}`
}

function toBlockPath(id: string) {
  return `/blocks/${id}`
}

function getThemeStyleFromPath(pathname: string) {
  const match = pathname.match(/^\/themes\/([^/]+)\/?$/)
  const style = match?.[1]
  return style && themeStyles.includes(style as ThemeStyle) ? style as ThemeStyle : undefined
}

function getBlockIdFromPath(pathname: string) {
  const match = pathname.match(/^\/blocks\/([^/]+)\/?$/)
  return blockDemos.some((block) => block.id === match?.[1]) ? match?.[1] : undefined
}

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

function getThemeSeoPage(style: ThemeStyle): SeoPage {
  const label = themeStyleLabels[style]
  const description = themeStyleDescriptions[style]
  return {
    title: `${label} React UI Theme — Base Themes`,
    description: `${description} Preview the ${label} visual style for typed Base UI React components, CSS tokens, and registry-ready product UI workflows.`,
    path: toThemePath(style),
    keywords: [label, `${label} React theme`, `${label} UI components`, 'Base UI theme', 'CSS variable theme'],
  }
}

function getBlockSeoPage(id: string): SeoPage {
  const block = blockDemos.find((item) => item.id === id) ?? blockDemos[0]
  return {
    title: `${block.title} React UI Block — Base Themes`,
    description: `${block.description} Copy the ${block.title} block from Base Themes with accessible Base UI components, CSS tokens, and registry metadata.`,
    path: toBlockPath(block.id),
    type: 'article',
    keywords: [block.title, `${block.title} React block`, `${block.category} UI block`, 'Base UI blocks'],
  }
}

function getCurrentId(pathname: string, fallback: string) {
  const match = pathname.match(/^\/components\/([^/]+)\/?$/)
  return match?.[1] ?? fallback
}

function getPage(pathname: string) {
  const normalizedPathname = normalizePathname(pathname)
  if (getBlockIdFromPath(normalizedPathname)) return 'block-detail'
  if (normalizedPathname.startsWith('/blocks/')) return 'blocks'
  if (getThemeStyleFromPath(normalizedPathname)) return 'theme-detail'
  if (normalizedPathname.startsWith('/themes/')) return 'themes'
  const staticPageId = staticPageIdByPath.get(normalizedPathname)
  if (staticPageId) return staticPageId
  if (normalizedPathname === '/components' || normalizedPathname.startsWith('/components/')) return 'components'
  return 'not-found'
}

function Topbar({ activeId, page }: { activeId: string; page: string }) {
  const t = useT()
  const { setTheme, resolved, style, setStyle } = useTheme()
  const { locale, setLocale } = useLocale()
  const currentStyleIndex = themeStyles.indexOf(style)
  const nextStyle = themeStyles[(currentStyleIndex + 1) % themeStyles.length]
  const styleLabel = themeStyleLabels[style]
  const cycleStyle = () => {
    trackEvent('theme_style_cycle', { from: style, to: nextStyle, source: 'topbar' })
    setStyle(nextStyle)
    if (page === 'theme-detail') {
      navigateTo(toThemePath(nextStyle))
    }
  }
  const toggleTheme = () => {
    const nextTheme = resolved === 'light' ? 'dark' : 'light'
    trackEvent('color_theme_toggle', { from: resolved, to: nextTheme, source: 'topbar' })
    setTheme(nextTheme)
  }

  return (
    <header className="topbar">
      <a className="topbar-brand" href="/" onClick={(event) => { event.preventDefault(); handleInternalNavigation('/', 'topbar-brand') }}>
        <span className="topbar-brand-mark"><Blocks size={16} /></span>
        Base Themes
      </a>
      <nav className="topbar-nav">
        <a href={toComponentPath(activeId)} className={page === 'components' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation(toComponentPath(activeId), 'topbar-components') }}>{t.nav.components}</a>
        <a href="/blocks" className={page === 'blocks' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/blocks', 'topbar-blocks') }}>Blocks</a>
        <a href="/themes" className={page === 'themes' || page === 'theme-detail' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/themes', 'topbar-themes') }}>Themes</a>
        <a href="/docs/installation" className={page === 'installation' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/docs/installation', 'topbar-installation') }}>Installation</a>
        <a href="/docs/why-base-themes" className={page === 'whyBaseThemes' || page === 'baseUiVsShadcn' || page === 'accessibility' || page === 'securityTrust' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/docs/why-base-themes', 'topbar-learn') }}>Learn</a>
        <a href="/docs/theme-customization" className={page === 'themeCustomization' || page === 'theming' || page === 'tokenSystem' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/docs/theme-customization', 'topbar-customization') }}>Customize</a>
        <a href="/docs/registry" className={page === 'registry' || page === 'agentUsage' || page === 'cliUsage' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/docs/registry', 'topbar-registry') }}>Registry</a>
        <a href="/docs/examples" className={page === 'examples' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleInternalNavigation('/docs/examples', 'topbar-examples') }}>Examples</a>
      </nav>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button type="button" className="topbar-icon-btn" onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>
          <Languages size={15} />
          {locale === 'en' ? '中文' : 'EN'}
        </button>
        <button type="button" className="topbar-icon-btn" onClick={cycleStyle}>
          <Sparkles size={15} />
          {styleLabel}
        </button>
        <button type="button" className="topbar-ghost-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {resolved === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <a className="topbar-ghost-btn" href={PROJECT_REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub" onClick={() => trackEvent('github_outbound_click', { source: 'topbar', target: 'repo-star' })}>
          <Code2 size={18} />
        </a>
      </div>
    </header>
  )
}

function BlockShareActions({ id, title }: { id: string; title: string }) {
  const copyUrl = () => {
    const url = absoluteUrl(toBlockPath(id))
    trackEvent('block_share_copy', { block: id })
    void navigator.clipboard?.writeText(url)
  }

  return (
    <div className="block-actions">
      <Button variant="outline" onClick={copyUrl}><Copy size={15} /> Copy URL</Button>
      <Button onClick={() => handleInternalNavigation(toBlockPath(id), 'block-card-detail')}><Eye size={15} /> {title}</Button>
    </div>
  )
}

function AdoptionSignalCta({ source, detail }: { source: string; detail?: string }) {
  const trackSignalClick = (target: string) => {
    trackEvent('github_outbound_click', { source, detail, target })
  }

  return (
    <section className="doc-feedback-cta" aria-labelledby={`${source}-signal-title`}>
      <div>
        <div className="doc-kicker">Public signal</div>
        <h2 id={`${source}-signal-title`}>Useful in your product?</h2>
        <p>Leave a small public signal after trying this route: star or fork the repo, discuss what worked, request the missing piece, or submit a build for the future gallery.</p>
      </div>
      <div className="doc-feedback-actions compact">
        <a href={PROJECT_REPO_URL} target="_blank" rel="noreferrer" onClick={() => trackSignalClick('repo-star')}>
          <Star size={17} /> Star
        </a>
        <a href={PROJECT_FORK_URL} target="_blank" rel="noreferrer" onClick={() => trackSignalClick('repo-fork')}>
          <GitFork size={17} /> Fork
        </a>
        <a href={SHOW_AND_TELL_URL} target="_blank" rel="noreferrer" onClick={() => trackSignalClick('show-and-tell')}>
          <MessageCircle size={17} /> Discuss
        </a>
        <a href={FEATURE_REQUEST_URL} target="_blank" rel="noreferrer" onClick={() => trackSignalClick('feature-request')}>
          <MessageSquarePlus size={17} /> Request
        </a>
        <a href={GOOD_FIRST_ISSUES_URL} target="_blank" rel="noreferrer" onClick={() => trackSignalClick('good-first-issues')}>
          <ListChecks size={17} /> Good first
        </a>
        <a href={GALLERY_SUBMISSION_URL} target="_blank" rel="noreferrer" onClick={() => trackSignalClick('gallery-submission')}>
          <ImagePlus size={17} /> Gallery
        </a>
      </div>
    </section>
  )
}

function BlocksPage({ selectedBlockId }: { selectedBlockId?: string }) {
  const activeBlock = selectedBlockId ? blockDemos.find((block) => block.id === selectedBlockId) : undefined

  if (activeBlock) {
    return (
      <article className="component-page">
        <div className="page-hero component-hero">
          <div className="doc-kicker">{activeBlock.category}</div>
          <h1>{activeBlock.title}</h1>
          <p>{activeBlock.description}</p>
        </div>
        <div className="block-detail-nav">
          <Button variant="outline" onClick={() => handleInternalNavigation('/blocks', 'block-detail-back')}>All blocks</Button>
          <BlockShareActions id={activeBlock.id} title="Share block" />
        </div>
        <ComponentDemo
          code={activeBlock.code}
          preview={activeBlock.preview}
          title={`${activeBlock.title} usage`}
        />
        <AdoptionSignalCta source="block-detail" detail={activeBlock.id} />
      </article>
    )
  }

  return (
    <article className="component-page blocks-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Blocks</div>
        <h1>Application Blocks</h1>
        <p>Composable page sections built from the same Base Themes primitives, registry metadata, and theme tokens.</p>
      </div>
      <div className="blocks-grid">
        {blockDemos.map((block) => (
          <div className="block-gallery-card" key={block.id}>
            <div className="block-gallery-header">
              <div>
                <span>{block.category}</span>
                <h2>{block.title}</h2>
              </div>
            </div>
            <div className="block-gallery-preview">
              {block.preview}
            </div>
            <p>{block.description}</p>
            <BlockShareActions id={block.id} title="Open" />
          </div>
        ))}
      </div>
      <AdoptionSignalCta source="blocks" />
    </article>
  )
}

const landingPreviews = [
  { style: 'bento', label: 'Bento', src: '/previews/base-themes-bento.png' },
  { style: 'shadcn', label: 'shadcn', src: '/previews/base-themes-shadcn.png' },
  { style: 'neo', label: 'Neo Brutalism', src: '/previews/base-themes-neo-brutalism.png' },
  { style: 'data', label: 'Data Dense', src: '/previews/base-themes-data-dense.png' },
]

const themeUseCases: Partial<Record<ThemeStyle, string>> = {
  bento: 'SaaS dashboards, docs tools, and AI product surfaces that need warmth without losing structure.',
  shadcn: 'Teams that want a neutral shadcn-like baseline while keeping Base UI primitives and package installs.',
  enterprise: 'Internal tools, admin consoles, approval flows, and operational products with repeated daily use.',
  terminal: 'Developer tools, observability consoles, CLI-adjacent apps, and technical onboarding flows.',
  'data-dense': 'Analytics, back-office tables, monitoring views, and filter-heavy workflows.',
  minimal: 'Editorial product docs, portfolio admin, and quiet interfaces where content leads the page.',
  glass: 'Marketing-adjacent product demos and immersive tools where translucency is part of the brand.',
  mono: 'High-contrast writing tools, technical docs, and interfaces that should not depend on color semantics.',
}

const defaultThemeUseCase = 'Product interfaces that need accessible Base UI components, shared tokens, and a distinct visual direction without custom component styling from scratch.'

function getThemeUseCase(themeStyle: ThemeStyle) {
  return themeUseCases[themeStyle] ?? defaultThemeUseCase
}

function getThemeHighlights(themeStyle: ThemeStyle) {
  const shared = ['Semantic surface and text tokens', 'Light and dark mode support', 'Shared radius, focus, and action tokens']

  if (themeStyle === 'terminal') return ['Monospace typography tokens', 'High-contrast command surfaces', 'Green action and focus accents']
  if (themeStyle === 'data-dense') return ['Compact control sizing', 'Strong table and divider contrast', 'Muted secondary surfaces for dense scans']
  if (themeStyle === 'enterprise') return ['Blue action hierarchy', 'Explicit borders for operational clarity', 'Readable muted text states']
  if (themeStyle === 'neo-brutalism') return ['Hard border contract', 'Loud accent actions', 'Graphic shadows for high recall']
  if (themeStyle === 'glass') return ['Translucent surface tokens', 'Blur-friendly border contrast', 'Luminous focus states']
  if (themeStyle === 'mono') return ['Color-independent hierarchy', 'Ink-first contrast', 'Strict neutral surfaces']

  return shared
}

function getThemeRegistryItemUrl(themeStyle: ThemeStyle) {
  return `${registryBaseUrl}/items/theme-${themeStyle}.json`
}

function getThemePackageSnippet(themeStyle: ThemeStyle, mode: 'light' | 'dark') {
  return `import 'base-themes/styles.css'
import { Button, Input, Select } from 'base-themes'

export function ${themeStyle.replace(/(^|-)([a-z])/g, (_match, _prefix, letter: string) => letter.toUpperCase())}Preview() {
  return (
    <main data-style="${themeStyle}" data-theme="${mode}">
      <Button variant="accent">Create project</Button>
      <Input label="Workspace" placeholder="Acme Studio" />
      <Select
        label="Density"
        defaultValue="comfortable"
        items={{ compact: 'Compact', comfortable: 'Comfortable' }}
      />
    </main>
  )
}`
}

function getThemeCssSnippet(themeStyle: ThemeStyle) {
  return `.brand-shell[data-style='${themeStyle}'] {
  --bt-primary: #2563eb;
  --bt-primary-hover: #1d4ed8;
  --bt-secondary: #0f766e;
  --bt-radius: 10px;
  --bt-radius-sm: 8px;
  --bt-font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
}

.brand-shell[data-style='${themeStyle}'][data-theme='dark'] {
  --bt-bg: #0b1120;
  --bt-surface: #111827;
  --bt-fg: #f8fafc;
  --bt-primary: #60a5fa;
}`
}

function CopySnippetButton({ value, label, source, detail }: { value: string; label: string; source: string; detail: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    trackEvent('theme_snippet_copy', { source, detail, label })
    void navigator.clipboard?.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return <Button variant="outline" onClick={handleCopy}><Copy size={16} /> {copied ? 'Copied' : label}</Button>
}

function LandingPage() {
  const landingRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !landingRef.current) return

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    timeline
      .from('.landing-eyebrow, .landing-title, .landing-copy, .landing-actions, .landing-install', {
        y: 18,
        opacity: 0,
        duration: 0.72,
        stagger: 0.08,
      })
      .from('.landing-preview-card', {
        y: 38,
        rotate: -2,
        opacity: 0,
        duration: 0.84,
        stagger: 0.08,
      }, '-=0.42')

    gsap.to('.landing-preview-card', {
      y: (index) => (index % 2 === 0 ? -10 : 10),
      rotate: (index) => (index % 2 === 0 ? 1.4 : -1.4),
      duration: 3.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2,
    })

    // Reveal below-the-fold sections once as they enter the viewport.
    landingRef.current.querySelectorAll<HTMLElement>(
      '.landing-stats, .landing-quickstart, .landing-band, .landing-community',
    ).forEach((section) => {
      gsap.from(section, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 88%', once: true },
      })
    })

    // Hero preview cards drift at slightly different rates while scrolling
    // past the hero, adding depth without layout-affecting properties.
    gsap.to('.landing-preview-card', {
      yPercent: (index) => (index % 2 === 0 ? -4 : 4),
      ease: 'none',
      scrollTrigger: {
        trigger: '.landing-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })
  }, { scope: landingRef })

  const copyInstallCommand = () => {
    trackEvent('install_command_copy', { source: 'landing' })
    void navigator.clipboard?.writeText('npm install base-themes @base-ui/react')
  }

  const trackCommunityClick = (target: string) => {
    trackEvent('github_outbound_click', { source: 'landing-community', target })
  }

  return (
    <article className="landing-page" ref={landingRef}>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy-wrap">
          <div className="landing-eyebrow"><Sparkles size={15} /> Themeable Base UI for React</div>
          <h1 className="landing-title" id="landing-title">Base Themes</h1>
          <p className="landing-copy">Typed Base UI wrappers, production theme tokens, registry metadata, and ready-to-use visual styles in one npm package.</p>
          <div className="landing-actions">
            <Button onClick={() => handleInternalNavigation('/docs/installation', 'landing-install-cta')}><Package size={16} /> Install</Button>
            <Button variant="outline" onClick={() => handleInternalNavigation('/themes', 'landing-themes-cta')}><Eye size={16} /> View themes</Button>
          </div>
          <div className="landing-install" aria-label="Install command">
            <code>npm install base-themes @base-ui/react</code>
            <button type="button" aria-label="Copy install command" onClick={copyInstallCommand}><Copy size={15} /></button>
          </div>
        </div>
        <div className="landing-stage" aria-label="Theme preview gallery">
          {landingPreviews.map((preview) => (
            <figure className={`landing-preview-card ${preview.style}`} key={preview.style}>
              <img src={preview.src} alt={`${preview.label} theme preview`} width="1280" height="720" loading="eager" decoding="async" />
              <figcaption>{preview.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="landing-stats" aria-label="Project stats">
        <div className="landing-stat"><strong>40</strong><span>components</span></div>
        <div className="landing-stat"><strong>20</strong><span>themes</span></div>
        <div className="landing-stat"><strong>8</strong><span>blocks</span></div>
      </section>
      <section className="landing-quickstart" aria-labelledby="quickstart-title">
        <div className="landing-quickstart-copy">
          <div className="doc-kicker">30-second quick start</div>
          <h2 id="quickstart-title">Install, import, render.</h2>
          <p>Use the package CSS once, then place Base Themes components inside any `data-style` and `data-theme` container.</p>
          <div className="landing-quickstart-code" aria-label="Quick start code">
            <code>npm install base-themes @base-ui/react</code>
            <code>import 'base-themes/styles.css'</code>
            <code>{'<main data-style="bento" data-theme="light">'}</code>
          </div>
          <div className="landing-actions compact">
            <Button onClick={() => handleInternalNavigation('/docs/installation', 'landing-quickstart-install')}><Code2 size={16} /> Full install guide</Button>
            <Button variant="outline" onClick={() => handleInternalNavigation('/components/button', 'landing-quickstart-components')}><Eye size={16} /> Component docs</Button>
          </div>
        </div>
        <div className="landing-quickstart-preview" data-style="bento" data-theme="light">
          <div className="quickstart-preview-bar">
            <span>Live preview</span>
            <Button variant="accent">Deploy</Button>
          </div>
          <div className="theme-sample">
            <Input id="landing-quickstart-workspace" label="Workspace" placeholder="Acme Cloud" />
            <Button>Save</Button>
            <Button variant="outline">Preview</Button>
          </div>
        </div>
      </section>
      <section className="landing-band" aria-label="Feature summary">
        <div><strong>Package-first install</strong><span>Import components and CSS directly from npm.</span></div>
        <div><strong>Theme audit coverage</strong><span>Contrast checks cover buttons, popups, code tokens, and muted text.</span></div>
        <div><strong>Agent-ready registry</strong><span>Components, blocks, dependencies, and skill guidance ship with the package.</span></div>
      </section>
      <section className="landing-community" aria-labelledby="community-title">
        <div className="landing-community-copy">
          <div className="doc-kicker">Community signal</div>
          <h2 id="community-title">Try it, then leave a public signal.</h2>
          <p>Stars, forks, discussions, issues, and real usage examples are the evidence that decides the next roadmap: deeper OSS components, blocks, or agent-native registry workflows.</p>
        </div>
        <div className="landing-community-actions" aria-label="Community actions">
          <a href={PROJECT_REPO_URL} target="_blank" rel="noreferrer" onClick={() => trackCommunityClick('repo-star') }>
            <Star size={18} />
            <span><strong>Star the repo</strong><small>Mark the Base UI-first direction as useful.</small></span>
          </a>
          <a href={PROJECT_FORK_URL} target="_blank" rel="noreferrer" onClick={() => trackCommunityClick('repo-fork') }>
            <GitFork size={18} />
            <span><strong>Fork the repo</strong><small>Try a theme, block, or docs change in public.</small></span>
          </a>
          <a href={SHOW_AND_TELL_URL} target="_blank" rel="noreferrer" onClick={() => trackCommunityClick('show-and-tell') }>
            <MessageCircle size={18} />
            <span><strong>Show and tell</strong><small>Share what worked and what was missing.</small></span>
          </a>
          <a href={FEATURE_REQUEST_URL} target="_blank" rel="noreferrer" onClick={() => trackCommunityClick('feature-request') }>
            <MessageSquarePlus size={18} />
            <span><strong>Request a component</strong><small>Tell us what would make it usable in a real app.</small></span>
          </a>
          <a href={GOOD_FIRST_ISSUES_URL} target="_blank" rel="noreferrer" onClick={() => trackCommunityClick('good-first-issues') }>
            <ListChecks size={18} />
            <span><strong>Pick a good first issue</strong><small>Comment before opening a focused PR.</small></span>
          </a>
          <a href={GALLERY_SUBMISSION_URL} target="_blank" rel="noreferrer" onClick={() => trackCommunityClick('gallery-submission') }>
            <ImagePlus size={18} />
            <span><strong>Submit a build</strong><small>Share a screenshot or repo for the future gallery.</small></span>
          </a>
        </div>
      </section>
    </article>
  )
}

function ThemesPage({ selectedStyle }: { selectedStyle?: ThemeStyle }) {
  const swatches = ['--bt-bg', '--bt-surface', '--bt-fg', '--bt-primary', '--bt-secondary', '--bt-info', '--bt-success']
  const { style, setStyle, resolved, setTheme } = useTheme()
  const activeStyle = selectedStyle ?? style
  const activeLabel = themeStyleLabels[activeStyle]
  const activeMode = resolved === 'dark' ? 'dark' : 'light'
  const packageSnippet = getThemePackageSnippet(activeStyle, activeMode)
  const cssSnippet = getThemeCssSnippet(activeStyle)
  const registryItemUrl = getThemeRegistryItemUrl(activeStyle)

  useEffect(() => {
    if (selectedStyle && style !== selectedStyle) {
      setStyle(selectedStyle)
    }
  }, [selectedStyle, setStyle, style])

  const selectStyle = (themeStyle: ThemeStyle) => {
    trackEvent('theme_style_select', { from: style, to: themeStyle, source: selectedStyle ? 'theme-detail' : 'themes-page' })
    setStyle(themeStyle)
    navigateTo(toThemePath(themeStyle))
  }

  const toggleMode = () => {
    const nextMode = resolved === 'light' ? 'dark' : 'light'
    trackEvent('color_theme_toggle', { from: resolved, to: nextMode, source: selectedStyle ? 'theme-detail' : 'themes-page' })
    setTheme(nextMode)
  }

  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Themes</div>
        <h1>{selectedStyle ? `${activeLabel} Theme` : 'Theme System'}</h1>
        <p>{selectedStyle ? getThemeSeoPage(selectedStyle).description : 'Theme tokens are centralized CSS variables. Choose from practical product styles, expressive visual systems, and dense operational modes.'}</p>
      </div>
      <div className="theme-actions">
        <Button variant="outline" onClick={toggleMode}>{resolved === 'light' ? <Moon size={16} /> : <Sun size={16} />} {resolved === 'light' ? 'Dark preview' : 'Light preview'}</Button>
        <Button onClick={() => handleInternalNavigation('/docs/theme-customization', 'theme-detail-customize')}><Code2 size={16} /> Customize tokens</Button>
      </div>
      <div className="style-switcher" aria-label="Theme style">
        {themeStyles.map((themeStyle) => (
          <a
            className={activeStyle === themeStyle ? 'active' : ''}
            href={toThemePath(themeStyle)}
            key={themeStyle}
            onClick={(event) => {
              event.preventDefault()
              selectStyle(themeStyle)
            }}
            title={themeStyleDescriptions[themeStyle]}
          >
            {themeStyleLabels[themeStyle]}
          </a>
        ))}
      </div>
      <div className="theme-description" role="status">{themeStyleDescriptions[activeStyle]}</div>
      {selectedStyle && (
        <section className="theme-detail-panel" aria-label={`${activeLabel} theme details`}>
          <div>
            <h2>Best fit</h2>
            <p>{getThemeUseCase(activeStyle)}</p>
          </div>
          <div>
            <h2>Token highlights</h2>
            <ul>
              {getThemeHighlights(activeStyle).map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
          </div>
          <div className="theme-install-snippet">
            <h2>Install snippet</h2>
            <code>{`<main data-style="${activeStyle}" data-theme="${activeMode}">`}</code>
            <div className="theme-detail-actions">
              <CopySnippetButton value={packageSnippet} label="Copy JSX" source={selectedStyle ? 'theme-detail' : 'themes'} detail={activeStyle} />
              <CopySnippetButton value={cssSnippet} label="Copy CSS" source={selectedStyle ? 'theme-detail' : 'themes'} detail={activeStyle} />
            </div>
          </div>
          <div className="theme-registry-snippet">
            <h2>Registry item</h2>
            <p>Use this item when an agent or source-copy workflow needs theme metadata, files, and install guidance.</p>
            <code>{registryItemUrl}</code>
          </div>
        </section>
      )}
      <div className="theme-grid">
        {swatches.map((token) => <div className="theme-swatch" key={token}><span style={{ background: `var(${token})` }} /> <code>{token}</code></div>)}
      </div>
      <ComponentDemo
        title={`${activeLabel} Package Usage`}
        preview={<div className="theme-sample"><Button variant="accent">Accent</Button><Button variant="teal">Teal</Button><Input label="Tokenized input" placeholder="Theme aware" /></div>}
        code={`${packageSnippet}

${cssSnippet}`} />
      <AdoptionSignalCta source={selectedStyle ? 'theme-detail' : 'themes'} detail={selectedStyle ?? activeStyle} />
    </article>
  )
}

function isStaticDocsPage(page: string): page is StaticDocsPageId {
  return staticPageMeta.some((meta) => meta.id === page && meta.path.startsWith('/docs/'))
}

function StaticDocsFallback() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Docs</div>
        <h1>Loading docs</h1>
      </div>
    </article>
  )
}

function NotFoundPage({ activeId }: { activeId: string }) {
  return (
    <article className="component-page not-found-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">404</div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist or has moved. Check the URL, or head back to a page that does.</p>
      </div>
      <div className="not-found-actions">
        <Button onClick={() => handleInternalNavigation('/', 'not-found-home')}><Blocks size={16} /> Back to home</Button>
        <Button variant="outline" onClick={() => handleInternalNavigation(toComponentPath(activeId), 'not-found-components')}><Package size={16} /> Browse components</Button>
      </div>
    </article>
  )
}

export default function App() {
  const pathname = usePathname()
  const page = getPage(pathname)
  const themeStyleFromPath = getThemeStyleFromPath(pathname)
  const blockIdFromPath = getBlockIdFromPath(pathname)
  const firstId = componentMeta[0]?.id ?? 'button'
  const activeId = getCurrentId(pathname, firstId)
  const activeComponent = componentMeta.find((item) => item.id === activeId) ?? componentMeta[0]
  const seoTargetId = page === 'block-detail' ? blockIdFromPath ?? blockDemos[0].id : activeComponent.id
  const seo = useMemo(() => getSeoPage(page, seoTargetId, themeStyleFromPath), [page, seoTargetId, themeStyleFromPath])
  useSeo(seo)
  useEffect(() => {
    trackRouteView(pathname, { page, component: page === 'components' ? activeComponent.id : undefined, block: page === 'block-detail' ? blockIdFromPath : undefined, themeStyle: themeStyleFromPath })
  }, [activeComponent.id, blockIdFromPath, page, pathname, themeStyleFromPath])

  return (
    <Tooltip.Provider>
      <Topbar activeId={activeComponent.id} page={page} />
      <main className={`main-content${page !== 'components' ? ' no-sidebar' : ''}${page === 'landing' ? ' landing-main' : ''}`}>
        {page === 'landing' && <LandingPage />}
        {page === 'not-found' && <NotFoundPage activeId={firstId} />}
        {(page === 'blocks' || page === 'block-detail') && <BlocksPage selectedBlockId={blockIdFromPath} />}
        {(page === 'themes' || page === 'theme-detail') && <ThemesPage selectedStyle={themeStyleFromPath} />}
        {isStaticDocsPage(page) && (
          <Suspense fallback={<StaticDocsFallback />}>
            <StaticDocsPages page={page} />
          </Suspense>
        )}
        {page === 'components' && (
          <Suspense fallback={<StaticDocsFallback />}>
            <ComponentDocsPage activeId={activeComponent.id} />
          </Suspense>
        )}
      </main>
    </Tooltip.Provider>
  )
}

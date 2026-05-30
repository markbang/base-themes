import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function loadRegistry(path = resolve('registry/registry.json')) {
  const registryPath = path instanceof URL ? fileURLToPath(path) : path
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
  Object.defineProperty(registry, '__baseThemesRegistryPath', {
    enumerable: false,
    value: registryPath,
  })
  return registry
}

function registryItemsRoot(registry) {
  const registryPath = registry.__baseThemesRegistryPath
  return registryPath ? join(dirname(registryPath), 'items') : resolve('registry/items')
}

function registryPackageRoot(registry) {
  const registryPath = registry.__baseThemesRegistryPath
  return registryPath ? dirname(dirname(registryPath)) : process.cwd()
}

function itemNameForBlock(blockName) {
  return `block-${blockName}`
}

function itemNameForTheme(themeName) {
  return `theme-${themeName}`
}

function readRegistryItem(registry, name) {
  const itemPath = join(registryItemsRoot(registry), `${name}.json`)
  if (!existsSync(itemPath)) return undefined
  return JSON.parse(readFileSync(itemPath, 'utf8'))
}

function createPlanItem(registry, name, requestedAs) {
  const item = readRegistryItem(registry, name)
  return {
    name,
    requestedAs,
    type: item?.type,
    title: item?.title,
    packageImport: `base-themes/registry/items/${name}.json`,
    hostedUrl: `/registry/items/${name}.json`,
    registryItems: item?.meta?.agent?.registryItems ?? [],
    packageInstall: item?.meta?.agent?.packageInstall ?? [],
    sourceCopy: item?.meta?.agent?.sourceCopy ?? [],
  }
}

export function createRegistryPlan(registry, requested) {
  const components = new Map(registry.components.map((component) => [component.name, component]))
  const blocks = new Map(registry.blocks.map((block) => [block.name, block]))
  const themeStyles = new Set(registry.style.variants)
  const componentRequests = requested.filter((name) => !name.startsWith('block:') && !name.startsWith('theme:'))
  const blockRequests = requested
    .filter((name) => name.startsWith('block:'))
    .map((name) => name.slice('block:'.length))
  const themeRequests = requested
    .filter((name) => name.startsWith('theme:'))
    .map((name) => name.slice('theme:'.length))
  const missingComponents = componentRequests.filter((name) => !components.has(name))
  const missingBlocks = blockRequests.filter((name) => !blocks.has(name))
  const missingThemes = themeRequests.filter((name) => !themeStyles.has(name))

  if (missingComponents.length > 0 || missingBlocks.length > 0 || missingThemes.length > 0) {
    return {
      ok: false,
      missingComponents,
      missingBlocks,
      missingThemes,
      availableComponents: [...components.keys()],
      availableBlocks: [...blocks.keys()],
      availableThemes: [...themeStyles],
    }
  }

  const selectedComponents = new Set(componentRequests)
  const selectedBlocks = blockRequests.map((name) => blocks.get(name))
  const selectedThemes = [...new Set(themeRequests)]
  const componentFiles = new Set()
  const blockFiles = new Set()

  for (const block of selectedBlocks) {
    for (const name of block.components) {
      selectedComponents.add(name)
    }
    for (const file of block.files) {
      blockFiles.add(file)
    }
  }

  for (const name of selectedComponents) {
    for (const file of components.get(name).files) {
      componentFiles.add(file)
    }
  }

  const registryItems = [
    ...[...selectedComponents].map((name) => createPlanItem(registry, name, name)),
    ...selectedBlocks.map((block) => createPlanItem(registry, itemNameForBlock(block.name), `block:${block.name}`)),
    ...selectedThemes.map((name) => createPlanItem(registry, itemNameForTheme(name), `theme:${name}`)),
  ]

  return {
    ok: true,
    components: [...selectedComponents],
    blocks: selectedBlocks.map((block) => block.name),
    themes: selectedThemes,
    registryItems,
    dependencies: registry.dependencies,
    defaultStyle: registry.style.default,
    availableStyles: registry.style.variants,
    styleFiles: registry.style.files ?? [registry.style.global, registry.style.tokens],
    blockFiles: [...blockFiles],
    componentFiles: [...componentFiles],
  }
}

export function formatRegistryPlan(plan) {
  if (!plan.ok) {
    const lines = []
    if (plan.missingComponents.length > 0) lines.push(`Unknown component${plan.missingComponents.length === 1 ? '' : 's'}: ${plan.missingComponents.join(', ')}`)
    if (plan.missingBlocks.length > 0) lines.push(`Unknown block${plan.missingBlocks.length === 1 ? '' : 's'}: ${plan.missingBlocks.join(', ')}`)
    if (plan.missingThemes.length > 0) lines.push(`Unknown theme${plan.missingThemes.length === 1 ? '' : 's'}: ${plan.missingThemes.join(', ')}`)
    lines.push(`Available components: ${plan.availableComponents.join(', ')}`)
    lines.push(`Available blocks: ${plan.availableBlocks.join(', ')}`)
    lines.push(`Available themes: ${plan.availableThemes.join(', ')}`)
    return lines.join('\n')
  }

  const lines = [
    'Base Themes registry copy plan',
    `Components: ${plan.components.join(', ') || '(none)'}`,
    `Blocks: ${plan.blocks.join(', ') || '(none)'}`,
    `Themes: ${plan.themes.join(', ') || '(none)'}`,
    `Dependencies: ${plan.dependencies.join(', ')}`,
    `Default style: ${plan.defaultStyle}`,
    `Available styles: ${plan.availableStyles.join(', ')}`,
    `Style files: ${plan.styleFiles.join(', ')}`,
  ]

  if (plan.blockFiles.length > 0) {
    lines.push('Block files:')
    for (const file of plan.blockFiles) lines.push(`- ${file}`)
  }

  if (plan.registryItems.length > 0) {
    lines.push('Registry item imports:')
    for (const item of plan.registryItems) lines.push(`- ${item.requestedAs}: ${item.packageImport}`)

    lines.push('Hosted registry item URLs:')
    for (const item of plan.registryItems) lines.push(`- ${item.requestedAs}: ${item.hostedUrl}`)

    const blockRegistryItems = plan.registryItems.filter((item) => item.registryItems.length > 0)
    if (blockRegistryItems.length > 0) {
      lines.push('Block registryItems metadata:')
      for (const item of blockRegistryItems) lines.push(`- ${item.requestedAs}: ${item.registryItems.join(', ')}`)
    }

    lines.push('Package install steps:')
    for (const item of plan.registryItems) {
      if (item.packageInstall.length === 0) continue
      lines.push(`- ${item.requestedAs}: ${item.packageInstall.join(' | ')}`)
    }

    lines.push('Source-copy steps:')
    for (const item of plan.registryItems) {
      if (item.sourceCopy.length === 0) continue
      lines.push(`- ${item.requestedAs}: ${item.sourceCopy.join(' | ')}`)
    }
  }

  lines.push('Component files:')
  for (const file of plan.componentFiles) lines.push(`- ${file}`)

  return lines.join('\n')
}

export function createRegistryAdd(registry, requested, options = {}) {
  const plan = createRegistryPlan(registry, requested)
  if (!plan.ok) return { ok: false, plan }

  const targetRoot = resolve(options.target ?? process.cwd())
  const sourceRoot = registryPackageRoot(registry)
  const dryRun = Boolean(options.dryRun)
  const force = Boolean(options.force)
  const files = [...new Set([...plan.styleFiles, ...plan.blockFiles, ...plan.componentFiles])]
  const copied = []
  const skipped = []
  const missingSources = []

  for (const file of files) {
    const source = join(sourceRoot, file)
    const target = join(targetRoot, file)

    if (!existsSync(source)) {
      missingSources.push({ file, source, target })
      continue
    }

    const targetExists = existsSync(target)
    if (targetExists && !force) {
      skipped.push({ file, source, target, reason: 'exists' })
      continue
    }

    copied.push({ file, source, target, overwritten: targetExists })
    if (!dryRun) {
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(source, target)
    }
  }

  return {
    ok: missingSources.length === 0,
    plan,
    targetRoot,
    sourceRoot,
    dryRun,
    force,
    copied,
    skipped,
    missingSources,
  }
}

export function formatRegistryAdd(result) {
  if (!result.plan.ok) return formatRegistryPlan(result.plan)

  const lines = [
    result.dryRun ? 'Base Themes add dry run' : 'Base Themes add',
    `Target: ${result.targetRoot}`,
    `Components: ${result.plan.components.join(', ') || '(none)'}`,
    `Blocks: ${result.plan.blocks.join(', ') || '(none)'}`,
    `Themes: ${result.plan.themes.join(', ') || '(none)'}`,
    `Dependencies: ${result.plan.dependencies.join(', ')}`,
  ]

  if (result.copied.length > 0) {
    lines.push(result.dryRun ? 'Files to copy:' : 'Copied files:')
    for (const file of result.copied) {
      const label = file.overwritten ? 'overwrite' : 'create'
      lines.push(`- ${label}: ${file.file}`)
    }
  }

  if (result.skipped.length > 0) {
    lines.push('Skipped files:')
    for (const file of result.skipped) lines.push(`- ${file.file} (${file.reason}; use --force to overwrite)`)
  }

  if (result.missingSources.length > 0) {
    lines.push('Missing source files:')
    for (const file of result.missingSources) lines.push(`- ${file.file}`)
  }

  lines.push('Next steps:')
  lines.push('- Install dependencies from the plan if they are not already installed.')
  lines.push("- Import 'base-themes/styles.css' once, or wire copied registry style files in your app entry.")
  lines.push('- Review copied imports, format the target app, then run lint, test, and build.')

  if (result.skipped.length > 0 && !result.force) {
    lines.push('Note: existing files were left untouched. Re-run with --force only after reviewing local changes.')
  }

  return lines.join('\n')
}

export function formatRegistryList(registry) {
  return [
    'Base Themes registry',
    `Components (${registry.components.length}): ${registry.components.map((component) => component.name).join(', ')}`,
    `Blocks (${registry.blocks.length}): ${registry.blocks.map((block) => block.name).join(', ')}`,
    `Styles (${registry.style.variants.length}): ${registry.style.variants.join(', ')}`,
    `Pages (${registry.pages.length}): ${registry.pages.map((page) => page.route).join(', ')}`,
  ].join('\n')
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8'))
}

function detectPackageManager(root) {
  if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn'
  if (existsSync(join(root, 'bun.lockb')) || existsSync(join(root, 'bun.lock'))) return 'bun'
  return 'npm'
}

function installCommand(packageManager) {
  if (packageManager === 'pnpm') return 'pnpm add base-themes @base-ui/react react react-dom'
  if (packageManager === 'yarn') return 'yarn add base-themes @base-ui/react react react-dom'
  if (packageManager === 'bun') return 'bun add base-themes @base-ui/react react react-dom'
  return 'npm install base-themes @base-ui/react react react-dom'
}

function walkSourceFiles(root, limit = 240) {
  const results = []
  const ignored = new Set(['.git', '.next', 'dist', 'node_modules', 'coverage', '.turbo'])

  function visit(dir) {
    if (results.length >= limit || !existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (results.length >= limit || ignored.has(entry.name)) continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(path)
        continue
      }
      if (/\.(tsx?|jsx?|html)$/.test(entry.name)) results.push(path)
    }
  }

  for (const candidate of ['src', 'app', 'pages']) {
    visit(join(root, candidate))
  }

  return results
}

export function createDoctorReport(root = process.cwd()) {
  const packagePath = resolve(root, 'package.json')
  const packageJson = readJsonIfExists(packagePath)
  const packageManager = detectPackageManager(root)
  const install = installCommand(packageManager)
  const dependencies = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
    ...packageJson?.peerDependencies,
  }
  const isBaseThemesPackage = packageJson?.name === 'base-themes'
  const sourceFiles = existsSync(root) && statSync(root).isDirectory() ? walkSourceFiles(root) : []
  const sourceText = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n')
  const hasStyleAttribute = /data-style=/.test(sourceText)
  const hasThemeAttribute = /data-theme=/.test(sourceText)
  const hasUseThemeWorkflow = /useTheme\s*\(/.test(sourceText)
  const checks = [
    {
      label: 'package.json exists',
      ok: Boolean(packageJson),
      detail: packageJson ? packagePath : 'No package.json found in current working directory.',
      fix: 'Run base-themes doctor from a Vite, Next.js, Remix, or React app root that contains package.json.',
    },
    {
      label: 'base-themes dependency is installed or declared',
      ok: Boolean(dependencies['base-themes'] || isBaseThemesPackage),
      detail: dependencies['base-themes'] ? `base-themes ${dependencies['base-themes']}` : isBaseThemesPackage ? 'Running inside the base-themes package workspace.' : 'Add base-themes to dependencies.',
      fix: install,
    },
    {
      label: '@base-ui/react peer dependency is declared',
      ok: Boolean(dependencies['@base-ui/react']),
      detail: dependencies['@base-ui/react'] ? `@base-ui/react ${dependencies['@base-ui/react']}` : 'Install @base-ui/react with base-themes.',
      fix: install,
    },
    {
      label: 'React peer dependencies are declared',
      ok: Boolean(dependencies.react && dependencies['react-dom']),
      detail: dependencies.react && dependencies['react-dom'] ? `react ${dependencies.react}, react-dom ${dependencies['react-dom']}` : 'Install react and react-dom.',
      fix: install,
    },
    {
      label: 'base-themes/styles.css import found',
      ok: sourceText.includes('base-themes/styles.css'),
      detail: sourceText.includes('base-themes/styles.css') ? 'Found package CSS import in source files.' : 'Import base-themes/styles.css once at app startup.',
      fix: "Add `import 'base-themes/styles.css'` in your app entry, such as src/main.tsx, app/layout.tsx, or pages/_app.tsx.",
    },
    {
      label: 'data-style attribute found',
      ok: hasStyleAttribute || hasUseThemeWorkflow,
      detail: hasStyleAttribute ? 'Found data-style usage.' : hasUseThemeWorkflow ? 'Found useTheme workflow, which applies data-style at runtime.' : 'Set data-style on the app root or themed container.',
      fix: 'Add `data-style="bento"` to your app root, html element, or themed container, or use the exported useTheme hook.',
    },
    {
      label: 'data-theme attribute found',
      ok: hasThemeAttribute || hasUseThemeWorkflow,
      detail: hasThemeAttribute ? 'Found data-theme usage.' : hasUseThemeWorkflow ? 'Found useTheme workflow, which applies data-theme at runtime.' : 'Set data-theme to light, dark, or use the useTheme hook workflow.',
      fix: 'Add `data-theme="light"` or `data-theme="dark"` next to data-style, or use the exported useTheme hook.',
    },
  ]

  return {
    ok: checks.every((check) => check.ok),
    root,
    packageManager,
    checkedFiles: sourceFiles.length,
    links: {
      docs: 'https://base-themes.bangwu.me/docs/installation',
      cli: 'https://base-themes.bangwu.me/docs/cli',
      repo: 'https://github.com/markbang/base-themes',
      fork: 'https://github.com/markbang/base-themes/fork',
      showAndTell: 'https://github.com/markbang/base-themes/discussions/new?category=show-and-tell',
      featureRequest: 'https://github.com/markbang/base-themes/issues/new?template=feature_request.yml',
      bugReport: 'https://github.com/markbang/base-themes/issues/new?template=bug_report.yml',
      gallerySubmission: 'https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml',
    },
    checks,
  }
}

export function formatDoctorReport(report) {
  const lines = [
    'Base Themes doctor',
    `Project: ${report.root}`,
    `Source files scanned: ${report.checkedFiles}`,
    '',
  ]

  for (const check of report.checks) {
    lines.push(`${check.ok ? 'PASS' : 'WARN'} ${check.label}`)
    lines.push(`  ${check.detail}`)
    if (!check.ok && check.fix) lines.push(`  Fix: ${check.fix}`)
  }

  lines.push('')
  if (report.ok) {
    lines.push('Result: Base Themes installation looks complete.')
    lines.push('Next: try `base-themes plan button select block:dashboard-shell theme:enterprise` or open https://base-themes.bangwu.me/docs/cli for source-copy workflows.')
    lines.push('Public signal: if this worked in a real app, star https://github.com/markbang/base-themes, fork https://github.com/markbang/base-themes/fork, or share what worked at https://github.com/markbang/base-themes/discussions/new?category=show-and-tell.')
    lines.push('Gallery: submit a screenshot or repo at https://github.com/markbang/base-themes/issues/new?template=gallery_submission.yml after permission to feature is clear.')
  } else {
    lines.push('Result: Review WARN items before shipping this integration.')
    lines.push(`Install command: ${installCommand(report.packageManager)}`)
    lines.push('Docs: https://base-themes.bangwu.me/docs/installation')
    lines.push('Feedback: https://github.com/markbang/base-themes/issues/new?template=bug_report.yml')
    lines.push('Missing component, block, or theme? Request it at https://github.com/markbang/base-themes/issues/new?template=feature_request.yml')
  }
  return lines.join('\n')
}

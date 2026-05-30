import { readFileSync } from 'node:fs'

const seedPath = 'docs/contributor-issue-seeds.md'
const repoUrl = 'https://github.com/markbang/base-themes'
const repoSlug = 'markbang/base-themes'

function usage() {
  return `Usage: node scripts/render-contributor-issues.mjs [--json|--urls|--gh]

Options:
  --json  Print parsed issue seed objects.
  --urls  Print prefilled GitHub issue URLs. This is the default.
  --gh    Print gh issue create commands for maintainers with GitHub CLI access.
`
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`
}

function parseFencedValue(section, label) {
  const fence = '```'
  const match = section.match(new RegExp(`${label}:\\s*\\n\\n${fence}(?:md|text)?\\n([\\s\\S]*?)\\n${fence}`))
  return match?.[1]?.trim()
}

function parseSeeds(source) {
  const sections = source.split(/^## Seed \d+: /m).slice(1)
  return sections.map((section, index) => {
    const title = parseFencedValue(section, 'Title')
    const labels = parseFencedValue(section, 'Labels')
      ?.split(',')
      .map((label) => label.trim())
      .filter(Boolean)
    const body = parseFencedValue(section, 'Body')

    if (!title || !labels?.length || !body) {
      throw new Error(`Seed ${index + 1} must include fenced Title, Labels, and Body blocks.`)
    }

    const search = new URLSearchParams()
    search.set('title', title)
    search.set('labels', labels.join(','))
    search.set('body', body)

    return {
      number: index + 1,
      title,
      labels,
      body,
      url: `${repoUrl}/issues/new?${search.toString()}`,
    }
  })
}

const mode = process.argv[2] ?? '--urls'
if (mode === '--help' || mode === '-h') {
  console.log(usage())
  process.exit(0)
}
if (!['--json', '--urls', '--gh'].includes(mode)) {
  console.error(`Unknown option: ${mode}`)
  console.error(usage())
  process.exit(1)
}

const seeds = parseSeeds(readFileSync(seedPath, 'utf8'))

if (mode === '--json') {
  console.log(JSON.stringify(seeds, null, 2))
  process.exit(0)
}

if (mode === '--gh') {
  console.log('# Run two or three commands before a release announcement. Do not publish the whole seed list at once.')
  for (const seed of seeds) {
    console.log(`gh issue create --repo ${shellQuote(repoSlug)} --title ${shellQuote(seed.title)} --label ${shellQuote(seed.labels.join(','))} --body ${shellQuote(seed.body)}`)
  }
  process.exit(0)
}

console.log('# Prefilled GitHub issue URLs')
console.log('# Open two or three before a release announcement; keep the rest as backlog seeds.')
for (const seed of seeds) {
  console.log(`\n${seed.number}. ${seed.title}`)
  console.log(`Labels: ${seed.labels.join(', ')}`)
  console.log(seed.url)
}

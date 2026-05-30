import { readFileSync } from 'node:fs'
import packageJson from '../package.json' with { type: 'json' }
import registry from '../registry/registry.json' with { type: 'json' }

const repoUrl = 'https://github.com/markbang/base-themes'
const docsUrl = 'https://base-themes.bangwu.me'
const registryUrl = `${docsUrl}/registry/registry.json`
const cliUrl = `${docsUrl}/docs/cli`
const blocksUrl = `${docsUrl}/blocks`
const llmsUrl = `${docsUrl}/llms.txt`
const llmsFullUrl = `${docsUrl}/llms-full.txt`
const forkUrl = `${repoUrl}/fork`
const showAndTellUrl = `${repoUrl}/discussions/new?category=show-and-tell`
const featureRequestUrl = `${repoUrl}/issues/new?template=feature_request.yml`
const gallerySubmissionUrl = `${repoUrl}/issues/new?template=gallery_submission.yml`
const goodFirstIssuesUrl = `${repoUrl}/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22`
const launchCampaign = `base-themes-${packageJson.version.replaceAll('.', '-')}`
const contributorIssueSeedPath = 'docs/contributor-issue-seeds.md'

function campaignUrl(path, source, medium, content) {
  const url = new URL(path, docsUrl)
  url.searchParams.set('utm_campaign', launchCampaign)
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', medium)
  url.searchParams.set('utm_content', content)
  return url.toString()
}

const stats = {
  version: packageJson.version,
  components: registry.components.length,
  blocks: registry.blocks.length,
  pages: registry.pages.length,
  styles: registry.style.variants.length,
}

const channelLinks = {
  githubRelease: campaignUrl('/docs/installation', 'github-release', 'release-notes', 'install-docs'),
  social: campaignUrl('/blocks/dashboard-shell', 'x-bluesky', 'social', 'dashboard-shell'),
  forum: campaignUrl('/docs/base-ui-vs-shadcn', 'hn-reddit', 'community', 'base-ui-vs-shadcn'),
  directory: campaignUrl('/docs/cli', 'devtool-directory', 'directory', 'cli-doctor'),
}

const commands = [
  'npm install base-themes @base-ui/react react react-dom',
  'npx base-themes list',
  'npx base-themes list --json',
  'npx base-themes plan button select block:dashboard-shell theme:enterprise',
  'npx base-themes plan button select block:dashboard-shell theme:enterprise --json',
  'npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run',
  'npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json',
  'npx base-themes doctor .',
  'npx base-themes doctor . --json',
]

function parseFencedValue(section, label) {
  const fence = '```'
  const match = section.match(new RegExp(`${label}:\\s*\\n\\n${fence}(?:md|text)?\\n([\\s\\S]*?)\\n${fence}`))
  return match?.[1]?.trim()
}

function parseContributorIssueSeeds(source) {
  return source.split(/^## Seed \d+: /m).slice(1).map((section, index) => {
    const title = parseFencedValue(section, 'Title')
    const labels = parseFencedValue(section, 'Labels')
      ?.split(',')
      .map((label) => label.trim())
      .filter(Boolean)
    const body = parseFencedValue(section, 'Body')

    if (!title || !labels?.length || !body) return undefined

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
  }).filter(Boolean)
}

const contributorIssueSeeds = parseContributorIssueSeeds(readFileSync(contributorIssueSeedPath, 'utf8'))
const recommendedGoodFirstIssues = contributorIssueSeeds
  .filter((issue) => issue.labels.includes('type: good first issue'))
  .slice(0, 2)

function renderRecommendedGoodFirstIssues() {
  return recommendedGoodFirstIssues.map((issue) => `- ${issue.title}: ${issue.url}`).join('\n')
}

const channelChecklist = [
  {
    channel: 'GitHub Release',
    action: 'Publish the release draft, then link the prepared good-first issues from recommendedIssueUrls in the release body or first comment.',
    measure: 'Track stars, forks, release views, linked issue comments, and external human issues or PRs at T+1 day and T+7 days.',
    primaryLink: channelLinks.githubRelease,
    recommendedIssueUrls: recommendedGoodFirstIssues.map((issue) => issue.url),
    shareAssetIds: ['dashboard-shell-block', 'enterprise-theme-preview'],
  },
  {
    channel: 'X / Bluesky',
    action: 'Share one block screenshot plus one command, and ask for a star, fork, or Show and tell reply.',
    measure: 'Track GitHub stars, forks, docs route views, GitHub outbound clicks, and Show and tell Discussions after the post.',
    primaryLink: channelLinks.social,
    shareAssetIds: ['dashboard-shell-block', 'enterprise-theme-preview'],
  },
  {
    channel: 'Hacker News / Reddit',
    action: 'Ask for feedback on the Base UI-first + registry + agent workflow instead of asking for generic promotion.',
    measure: 'Track referral traffic, external issues, missing-component requests, registry route requests, and npm weekly download slope.',
    primaryLink: channelLinks.forum,
    shareAssetIds: ['base-ui-vs-shadcn'],
  },
  {
    channel: 'Product / devtool directories',
    action: 'Submit the directory copy with docs, CLI, registry, and block URLs, then ask users to try the doctor command.',
    measure: 'Track docs visits, install command copies, doctor/CLI docs visits, registry requests, and npm download slope.',
    primaryLink: channelLinks.directory,
    shareAssetIds: ['cli-doctor-workflow', 'dashboard-shell-block'],
  },
]

const shareAssets = [
  {
    id: 'dashboard-shell-block',
    type: 'block-route',
    title: 'Dashboard Shell product block',
    url: channelLinks.social,
    imageUrl: `${docsUrl}/previews/base-themes-enterprise.png`,
    use: 'Best first social post asset: product-screen route plus one doctor command.',
  },
  {
    id: 'enterprise-theme-preview',
    type: 'theme-preview',
    title: 'Enterprise theme preview',
    url: campaignUrl('/themes/enterprise', 'x-bluesky', 'social', 'enterprise-theme'),
    imageUrl: `${docsUrl}/previews/base-themes-enterprise.png`,
    use: 'Use for operational UI audiences comparing design-system styles.',
  },
  {
    id: 'base-ui-vs-shadcn',
    type: 'docs-route',
    title: 'Base UI vs shadcn comparison',
    url: channelLinks.forum,
    imageUrl: `${docsUrl}/previews/base-themes-bento.png`,
    use: 'Use for forum posts where the discussion is about primitives, ownership, theming, and registry workflow.',
  },
  {
    id: 'cli-doctor-workflow',
    type: 'docs-route',
    title: 'CLI doctor workflow',
    url: channelLinks.directory,
    imageUrl: `${docsUrl}/previews/base-themes-data-dense.png`,
    use: 'Use for devtool directories and package-first adoption pitches.',
  },
]

function renderGitHubRelease() {
  return `Base Themes ${stats.version} ships as a Base UI-first React theme component system with:

- ${stats.components} typed React components built on \`@base-ui/react\`
- ${stats.styles} CSS-token visual styles with light and dark modes
- ${stats.blocks} source-copyable product blocks
- ${stats.pages} docs, SEO, block, theme, registry, and agent routes
- shadcn-style registry metadata for components, blocks, pages, and themes
- CLI helpers: \`list\`, \`plan\`, \`add\`, and \`doctor\`, all with JSON-friendly workflows
- Vite, dashboard, theme-customization, Next.js, and registry-copy examples
- axe, package smoke, SEO, registry, community, bundle, and theme preview checks

Try it:

\`\`\`bash
npm install base-themes @base-ui/react react react-dom
npx base-themes doctor .
\`\`\`

Useful links:

- Install guide: ${channelLinks.githubRelease}
- Docs: ${docsUrl}
- Registry: ${registryUrl}
- Agent discovery: ${llmsUrl}
- Full agent context: ${llmsFullUrl}
- Blocks: ${blocksUrl}
- CLI: ${cliUrl}

Fork-to-first-change:

1. Fork the repo: ${forkUrl}
2. Run \`npm run example:theme-customization:build\` or \`npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json\`.
3. Share the changed theme, block, or integration result in a Show and tell Discussion or focused issue.

Good-first issues to publish with this release:

${renderRecommendedGoodFirstIssues()}

If you try it and the Base UI-first direction is useful, please star the repo. If you want to adapt it, fork the repo, open an issue for missing components or rough edges, start a Show and tell Discussion, or submit a real usage example through the community gallery issue template.`
}

function renderSocial() {
  return `I shipped a stronger Base Themes release:

- Base UI-first React components
- ${stats.styles} CSS-token visual styles
- ${stats.blocks} product blocks
- shadcn-style registry metadata
- CLI: list, plan, add, doctor, and JSON output for agents
- React 18 + 19 support

Try:
npx base-themes doctor .

Dashboard block: ${channelLinks.social}
Repo: ${repoUrl}

If the Base UI-first direction is useful after trying it, please star the repo so I can measure whether to keep investing in the OSS kit.`
}

function renderForum() {
  return `Show HN: Base Themes - accessible Base UI React components with ${stats.styles} themes

Base Themes is an open-source React component system built on @base-ui/react. It provides typed wrappers, CSS-variable themes, ${stats.styles} curated visual styles, source-copyable registry metadata, product blocks, and CLI helpers for checking integration.

The project is package-first rather than template-first: install from npm, import one CSS file, set data-style/data-theme, and use the components or blocks. It also ships registry metadata for tools that prefer source-copy workflows.

The part I am most interested in getting feedback on: does the Base UI-first + registry + agent-friendly workflow solve a real gap for teams that like shadcn-style ownership but want a packaged multi-theme system?

Repo: ${repoUrl}
Docs: ${channelLinks.forum}

If you try it and the direction seems useful, please star the repo; if not, open the smallest issue that would make it usable in a real app.`
}

function renderDirectory() {
  return `Base Themes is a React component system built on Base UI. It ships accessible typed components, ${stats.styles} CSS-token visual styles, source-copyable registry metadata, product blocks, and CLI checks for integrating the package into Vite or Next.js apps.

CLI and doctor workflow: ${channelLinks.directory}
Star the repo after trying it if the Base UI-first package + registry workflow is useful: ${repoUrl}`
}

const payload = {
  stats,
  attribution: {
    campaign: launchCampaign,
    parameters: ['utm_campaign', 'utm_source', 'utm_medium', 'utm_content'],
  },
  commands,
  links: {
    repo: repoUrl,
    docs: docsUrl,
    registry: registryUrl,
    cli: cliUrl,
    blocks: blocksUrl,
    llms: llmsUrl,
    llmsFull: llmsFullUrl,
    fork: forkUrl,
    showAndTell: showAndTellUrl,
    featureRequest: featureRequestUrl,
    gallerySubmission: gallerySubmissionUrl,
    goodFirstIssues: goodFirstIssuesUrl,
  },
  githubRelease: renderGitHubRelease(),
  social: renderSocial(),
  forum: renderForum(),
  directory: renderDirectory(),
  callsToAction: [
    `Star the repo if the Base UI-first direction is useful: ${repoUrl}`,
    `Fork the repo and run the Fork-to-first-change workflow with npm run example:theme-customization:build or npm run example:registry-copy -- plan button select block:dashboard-shell theme:enterprise --json: ${forkUrl}`,
    'Run npx base-themes add button select --target . --dry-run or npx base-themes doctor . in a real app and report rough edges.',
    `Open a Show and tell Discussion with what worked, what was missing, and which data-style you used: ${showAndTellUrl}`,
    `Open a feature request for the component, block, or theme that would make Base Themes usable in a real project: ${featureRequestUrl}`,
    `Comment on a published good-first issue before opening a PR: ${goodFirstIssuesUrl}`,
    `Submit a screenshot or repo through the community gallery template after using Base Themes: ${gallerySubmissionUrl}`,
  ],
  recommendedGoodFirstIssues,
  shareAssets,
  channelChecklist,
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(payload, null, 2))
} else {
  console.log(`# Base Themes ${stats.version} Announcement Pack

## GitHub Release Draft

${payload.githubRelease}

## X / Bluesky

${payload.social}

## Hacker News / Reddit

${payload.forum}

## Product Hunt / Directory Submission

${payload.directory}

## Commands

\`\`\`bash
${payload.commands.join('\n')}
\`\`\`

## Calls To Action

${payload.callsToAction.map((call) => `- ${call}`).join('\n')}

## Recommended Good-First Issues

${payload.recommendedGoodFirstIssues.map((issue) => `- ${issue.title}: ${issue.url}`).join('\n')}

## Share Assets

${payload.shareAssets.map((asset) => `- ${asset.title}: ${asset.url} Image: ${asset.imageUrl} Use: ${asset.use}`).join('\n')}

## Channel Tracking Checklist

${payload.channelChecklist.map((item) => `- ${item.channel}: ${item.action} Assets: ${item.shareAssetIds.join(', ')} Measure: ${item.measure} Link: ${item.primaryLink}`).join('\n')}
`)
}

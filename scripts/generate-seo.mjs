import { copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import componentMeta from "../src/docs/componentMeta.json" with { type: "json" };
import blockMeta from "../src/docs/blockMeta.json" with { type: "json" };
import staticPageMeta from "../src/docs/staticPageMeta.json" with { type: "json" };
import themeMeta from "../src/docs/themeMeta.json" with { type: "json" };
import registry from "../registry/registry.json" with { type: "json" };
import { absoluteUrl, getSeoPages } from "./seo-pages.mjs";

const outDir = resolve("dist");
const repoUrl = "https://github.com/markbang/base-themes";
const forkUrl = `${repoUrl}/fork`;
const showAndTellUrl = `${repoUrl}/discussions/new?category=show-and-tell`;
const featureRequestUrl = `${repoUrl}/issues/new?template=feature_request.yml`;
const bugReportUrl = `${repoUrl}/issues/new?template=bug_report.yml`;
const gallerySubmissionUrl = `${repoUrl}/issues/new?template=gallery_submission.yml`;
const goodFirstIssuesUrl = `${repoUrl}/issues?q=is%3Aissue+state%3Aopen+label%3A%22type%3A+good+first+issue%22`;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSitemap(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}

function renderLlmsTxt() {
  const componentLinks = [
    ["Button", "/components/button"],
    ["Select", "/components/select"],
    ["Dialog", "/components/dialog"],
    ["Tabs", "/components/tabs"],
    ["Input", "/components/input"],
  ];
  const themeLinks = [
    ["Bento theme", "/themes/bento"],
    ["Enterprise theme", "/themes/enterprise"],
    ["Terminal theme", "/themes/terminal"],
    ["Data Dense theme", "/themes/data-dense"],
  ];
  const blockLinks = [
    ["Dashboard Shell block", "/blocks/dashboard-shell"],
    ["Data Table block", "/blocks/data-table"],
    ["Command Palette block", "/blocks/command-palette"],
  ];

  const linkList = (links) =>
    links
      .map(([label, path]) => `- [${label}](${absoluteUrl(path)})`)
      .join("\n");

  return `# Base Themes

Base Themes is a type-safe React component system built on Base UI. It ships accessible component wrappers, CSS-token themes, 22 curated visual styles, source-copyable registry metadata, blocks, examples, and agent-friendly customization workflows.

## Start Here

- [Install Base Themes](${absoluteUrl("/docs/installation")})
- [Why Base Themes](${absoluteUrl("/docs/why-base-themes")})
- [Base UI vs shadcn/ui](${absoluteUrl("/docs/base-ui-vs-shadcn")})
- [Registry and source-copy workflow](${absoluteUrl("/docs/registry")})
- [CLI usage](${absoluteUrl("/docs/cli")})
- [Agent usage guide](${absoluteUrl("/docs/agent-usage")})
- [Runnable examples](${absoluteUrl("/docs/examples")})
- [Security and release trust](${absoluteUrl("/docs/security")})

## Machine-Readable Metadata

- [Registry JSON](${absoluteUrl("/registry/registry.json")})
- [Shadcn-compatible registry catalog](${absoluteUrl("/registry/shadcn-registry.json")})
- [Block metadata JSON](${absoluteUrl("/registry/block-meta.json")})
- [Component metadata JSON](${absoluteUrl("/registry/component-meta.json")})
- [Static page metadata JSON](${absoluteUrl("/registry/static-page-meta.json")})
- [Theme metadata JSON](${absoluteUrl("/registry/theme-meta.json")})
- [Registry item example](${absoluteUrl("/registry/items/button.json")})
- [Full agent context](${absoluteUrl("/llms-full.txt")})
- [Sitemap](${absoluteUrl("/sitemap.xml")})

## Common Components

${linkList(componentLinks)}

## Useful Themes

${linkList(themeLinks)}

## Product Blocks

${linkList(blockLinks)}

## Package Commands

\`\`\`bash
npm install base-themes @base-ui/react react react-dom
npx base-themes list
npx base-themes list --json
npx base-themes plan button select block:dashboard-shell theme:enterprise
npx base-themes plan button select block:dashboard-shell theme:enterprise --json
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json
npx base-themes doctor .
npx base-themes doctor . --json
\`\`\`

## Integration Contract

- Import \`base-themes/styles.css\` once at app startup.
- Set \`data-style\` for visual system and \`data-theme\` for light or dark mode.
- Use \`base-themes/registry.json\`, \`base-themes/shadcn-registry.json\`, hosted registry JSON, or item JSON before source-copying files.
- Run registry, lint, test, build, SEO, and package smoke checks after applying changes.
- Use the Vite, dashboard, theme-customization, Next.js, and registry-copy examples to verify real integration paths.

## Feedback And Community Signals

- [Repository](${repoUrl})
- [Fork the repo](${forkUrl})
- [Show and tell Discussion](${showAndTellUrl})
- [Feature request](${featureRequestUrl})
- [Bug report](${bugReportUrl})
- [Community gallery submission](${gallerySubmissionUrl})
- [Good first issues](${goodFirstIssuesUrl})
`;
}

function renderLlmsFullTxt(pages) {
  const pageLinks = pages
    .map(
      (page) =>
        `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`,
    )
    .join("\n");
  const componentLinks = componentMeta
    .map(
      (component) =>
        `- [${component.title}](${absoluteUrl(`/components/${component.id}`)}): registry name \`${component.registryName}\`; group ${component.group}; ${component.summary}`,
    )
    .join("\n");
  const themeLinks = themeMeta
    .map(
      (theme) =>
        `- [${theme.label}](${absoluteUrl(`/themes/${theme.style}`)}): style \`${theme.style}\`; ${theme.description}`,
    )
    .join("\n");
  const blockLinks = blockMeta
    .map(
      (block) =>
        `- [${block.title}](${absoluteUrl(`/blocks/${block.id}`)}): registry name \`${block.registryName}\`; export \`${block.exportName}\`; category ${block.category}; ${block.description}`,
    )
    .join("\n");
  const registryItemLinks = registry.components
    .slice(0, 12)
    .map(
      (component) =>
        `- [${component.title}](${absoluteUrl(`/registry/items/${component.name}.json`)})`,
    )
    .join("\n");
  const blockItemLinks = registry.blocks
    .map(
      (block) =>
        `- [${block.title}](${absoluteUrl(`/registry/items/block-${block.name}.json`)})`,
    )
    .join("\n");
  const themeItemLinks = themeMeta
    .slice(0, 8)
    .map(
      (theme) =>
        `- [${theme.label}](${absoluteUrl(`/registry/items/theme-${theme.style}.json`)})`,
    )
    .join("\n");

  return `# Base Themes Full Agent Context

Base Themes is a package-first React component system built on Base UI primitives. It provides typed component wrappers, CSS token themes, 22 visual styles, source-copy registry metadata, product blocks, runnable examples, and agent-oriented verification workflows.

## Primary Goals

- Prefer package installs for normal React apps.
- Use registry metadata before source-copying components, blocks, or themes.
- Keep changes token-based through \`data-style\`, \`data-theme\`, and stable \`--bt-*\` variables.
- Verify with registry, token, lint, test, build, SEO, bundle, and package smoke checks.

## Install And Verify

\`\`\`bash
npm install base-themes @base-ui/react react react-dom
npx base-themes list
npx base-themes list --json
npx base-themes plan button select block:dashboard-shell theme:enterprise
npx base-themes plan button select block:dashboard-shell theme:enterprise --json
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
npx base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run --json
npx base-themes doctor .
npx base-themes doctor . --json
npm run registry:check
npm run tokens:check
npm run lint
npm run test
npm run build
npm run seo:check
npm run bundle:report
npm run package:smoke
\`\`\`

## Metadata Entrypoints

- [Registry JSON](${absoluteUrl("/registry/registry.json")})
- [Shadcn-compatible registry catalog](${absoluteUrl("/registry/shadcn-registry.json")})
- [Block metadata JSON](${absoluteUrl("/registry/block-meta.json")})
- [Component metadata JSON](${absoluteUrl("/registry/component-meta.json")})
- [Static page metadata JSON](${absoluteUrl("/registry/static-page-meta.json")})
- [Theme metadata JSON](${absoluteUrl("/registry/theme-meta.json")})
- [Compact agent discovery](${absoluteUrl("/llms.txt")})
- [Sitemap](${absoluteUrl("/sitemap.xml")})

## Standard Registry Agent Fields

- Component, block, and theme item JSON files include \`meta.agent.summary\`, \`meta.agent.packageInstall\`, \`meta.agent.sourceCopy\`, and \`meta.agent.installPlan\`.
- Block item JSON files also include \`meta.agent.registryItems\`, listing the block item URL and every component item URL needed for source-copy workflows.
- Prefer \`meta.agent.packageInstall\` for package consumers and \`meta.agent.sourceCopy\` for copy-based tools.

## Package Exports

\`\`\`ts
import { Button, Select, DashboardShell, useTheme } from 'base-themes'
import registry from 'base-themes/registry.json'
import shadcnRegistry from 'base-themes/shadcn-registry.json'
import buttonItem from 'base-themes/registry/items/button.json'
import dashboardItem from 'base-themes/registry/items/block-dashboard-shell.json'
import blockMeta from 'base-themes/block-meta.json'
import componentMeta from 'base-themes/component-meta.json'
import staticPageMeta from 'base-themes/static-page-meta.json'
import themeMeta from 'base-themes/theme-meta.json'
import tokenContract from 'base-themes/token-contract.json'
import 'base-themes/styles.css'
\`\`\`

## Docs Routes

${pageLinks}

## Components

${componentLinks}

## Product Blocks

${blockLinks}

## Themes

${themeLinks}

## Registry Item Examples

### Components

${registryItemLinks}

### Blocks

${blockItemLinks}

### Themes

${themeItemLinks}

## Agent Guardrails

- Do not scrape JSX when JSON metadata is available.
- Do not hard-code theme colors when a public \`--bt-*\` token exists.
- Do not source-copy a block without copying its registry component dependencies and style files.
- Do not mark adoption complete from local checks; use the public gate in the adoption dashboard.
- Prefer focused issues or gallery submissions when a real app exposes install, registry, block, theme, or accessibility friction.

## Feedback And Community Signals

- Repository and stars: ${repoUrl}
- Fork the repo: ${forkUrl}
- Show and tell Discussion: ${showAndTellUrl}
- Feature request: ${featureRequestUrl}
- Bug report: ${bugReportUrl}
- Community gallery submission: ${gallerySubmissionUrl}
- Good first issues: ${goodFirstIssuesUrl}
`;
}

function getPageImage(page) {
  if (page.path.startsWith("/themes/")) {
    const style = page.path.split("/").pop();
    return absoluteUrl(`/previews/base-themes-${style}.png`);
  }

  return absoluteUrl("/previews/base-themes-bento.png");
}

function getPageType(page) {
  return page.path.startsWith("/components/") ||
    page.path.startsWith("/themes/") ||
    page.path.startsWith("/docs/")
    ? "article"
    : "website";
}

function getStructuredData(page) {
  const pageUrl = absoluteUrl(page.path);
  const image = getPageImage(page);
  const base = {
    "@context": "https://schema.org",
    "@type": page.path === "/" ? "SoftwareSourceCode" : "TechArticle",
    name: page.title,
    headline: page.title,
    description: page.description,
    url: pageUrl,
    image,
    isPartOf: {
      "@type": "WebSite",
      name: "Base Themes",
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: "Base Themes",
      url: absoluteUrl("/"),
    },
  };

  if (page.path === "/") {
    return {
      ...base,
      programmingLanguage: "TypeScript",
      runtimePlatform: "React",
      codeRepository: "https://github.com/markbang/base-themes",
      license: "https://opensource.org/licenses/MIT",
      applicationCategory: "DeveloperApplication",
    };
  }

  return base;
}

function injectSeo(html, page) {
  const type = getPageType(page);
  const image = getPageImage(page);
  const structuredData = JSON.stringify(getStructuredData(page));

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="${type}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${absoluteUrl(page.path)}" />`,
    )
    .replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${image}" />`,
    )
    .replace(
      /<meta property="og:image:alt" content="[^"]*" \/>/,
      `<meta property="og:image:alt" content="${escapeHtml(page.title)} preview" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${image}" />`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${absoluteUrl(page.path)}" />`,
    )
    .replace(
      /<script type="application\/ld\+json" id="structured-data">[\s\S]*?<\/script>/,
      `<script type="application/ld+json" id="structured-data">${structuredData}</script>`,
    );
}

async function writeRouteHtml(indexHtml, page) {
  if (page.path === "/") {
    await writeFile(resolve(outDir, "index.html"), injectSeo(indexHtml, page));
    return;
  }
  const filePath = resolve(outDir, `.${page.path}`, "index.html");
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, injectSeo(indexHtml, page));
}

async function writeRegistryArtifacts() {
  const registryDir = resolve(outDir, "registry");
  await mkdir(registryDir, { recursive: true });
  await Promise.all([
    copyFile(
      resolve("registry/registry.json"),
      resolve(registryDir, "registry.json"),
    ),
    copyFile(
      resolve("registry/shadcn-registry.json"),
      resolve(registryDir, "shadcn-registry.json"),
    ),
    cp(resolve("registry/items"), resolve(registryDir, "items"), {
      recursive: true,
    }),
    copyFile(
      resolve("src/docs/blockMeta.json"),
      resolve(registryDir, "block-meta.json"),
    ),
    copyFile(
      resolve("src/docs/componentMeta.json"),
      resolve(registryDir, "component-meta.json"),
    ),
    copyFile(
      resolve("src/docs/staticPageMeta.json"),
      resolve(registryDir, "static-page-meta.json"),
    ),
    copyFile(
      resolve("src/docs/themeMeta.json"),
      resolve(registryDir, "theme-meta.json"),
    ),
  ]);
}

const pages = getSeoPages();
const indexPath = resolve(outDir, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
const llmsTxt = renderLlmsTxt();
const llmsFullTxt = renderLlmsFullTxt(pages);

await Promise.all([
  writeFile(resolve(outDir, "sitemap.xml"), renderSitemap(pages)),
  writeFile(resolve(outDir, "robots.txt"), renderRobots()),
  writeFile(resolve(outDir, "llms.txt"), llmsTxt),
  writeFile(resolve(outDir, "llms-full.txt"), llmsFullTxt),
  writeFile(resolve("llms.txt"), llmsTxt),
  writeFile(resolve("llms-full.txt"), llmsFullTxt),
  writeRegistryArtifacts(),
  ...pages.map((page) => writeRouteHtml(indexHtml, page)),
]);

console.log(`Generated SEO files for ${pages.length} routes.`);

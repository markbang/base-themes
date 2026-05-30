import type { ReactNode } from 'react'
import {
  AuthCard,
  CommandPaletteBlock,
  DashboardShell,
  DataTableBlock,
  PricingPanel,
  SettingsForm,
  TeamActivityFeed,
  ThemeShowcaseCard,
} from '../blocks'
import { blockMeta } from './blockMeta'

const blockPreviews: Record<string, ReactNode> = {
  AuthCard: <AuthCard />,
  CommandPaletteBlock: <CommandPaletteBlock />,
  DashboardShell: <DashboardShell />,
  DataTableBlock: <DataTableBlock />,
  PricingPanel: <PricingPanel />,
  SettingsForm: <SettingsForm />,
  TeamActivityFeed: <TeamActivityFeed />,
  ThemeShowcaseCard: <ThemeShowcaseCard />,
}

function usageCode(exportName: string, routeComponentName: string) {
  return `import { ${exportName} } from 'base-themes'

export function ${routeComponentName}() {
  return <${exportName} />
}`
}

const usageNames: Record<string, string> = {
  AuthCard: 'SignInPage',
  CommandPaletteBlock: 'CommandSurface',
  DashboardShell: 'DashboardPage',
  DataTableBlock: 'ProjectsPage',
  PricingPanel: 'BillingPage',
  SettingsForm: 'SettingsPage',
  TeamActivityFeed: 'ActivityPanel',
  ThemeShowcaseCard: 'ThemeMarketingCard',
}

export const blockDemos = blockMeta.map((block) => ({
  ...block,
  preview: blockPreviews[block.exportName],
  code: usageCode(block.exportName, usageNames[block.exportName] ?? `${block.exportName}Example`),
}))

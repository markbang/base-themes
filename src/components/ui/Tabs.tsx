import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './Tabs.css'

type TabPanel = {
  value: string
  label: string
  title?: string
  content: string
}

type TabsProps = Omit<ComponentPropsWithoutRef<typeof BaseTabs.Root>, 'defaultValue'> & {
  panels: TabPanel[]
  defaultValue?: string
}

export function Tabs({ panels, defaultValue, className, ...rest }: TabsProps) {
  return (
    <BaseTabs.Root
      defaultValue={defaultValue ?? panels[0]?.value}
      className={clsx('bento-tabs', className)}
      {...rest}
    >
      <BaseTabs.List className={clsx('bento-tabs-list', `cols-${panels.length}`)}>
        {panels.map((panel) => (
          <BaseTabs.Tab className="bento-tabs-tab" key={panel.value} value={panel.value}>
            {panel.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="bento-tabs-indicator" />
      </BaseTabs.List>
      {panels.map((panel) => (
        <BaseTabs.Panel className="bento-tabs-panel" key={panel.value} value={panel.value}>
          {panel.title && <strong className="bento-tabs-panel-title">{panel.title}</strong>}
          <p>{panel.content}</p>
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  )
}

export { BaseTabs }
export type { TabsProps, TabPanel }

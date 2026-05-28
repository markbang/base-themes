import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { type ReactNode } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import './Collapsible.css'

type CollapsibleProps = {
  label: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function Collapsible({ label, children, defaultOpen, className }: CollapsibleProps) {
  return (
    <BaseCollapsible.Root defaultOpen={defaultOpen} className={clsx('bento-collapsible', className)}>
      <BaseCollapsible.Trigger className="bento-collapsible-trigger">
        {label}
        <ChevronDown size={15} />
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className="bento-collapsible-panel">
        {children}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

export { BaseCollapsible }
export type { CollapsibleProps }

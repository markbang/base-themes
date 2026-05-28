import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { type ReactElement, type ReactNode } from 'react'
import clsx from 'clsx'
import './Tooltip.css'

type TooltipProps = {
  content: ReactNode
  children: ReactElement
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={8}>
          <BaseTooltip.Popup className={clsx('bento-tooltip-popup', className)}>
            {content}
            <BaseTooltip.Arrow className="bento-tooltip-arrow" />
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}

Tooltip.Provider = BaseTooltip.Provider

export { BaseTooltip }
export type { TooltipProps }

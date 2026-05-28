import { Popover as BasePopover } from '@base-ui/react/popover'
import { type ReactElement, type ReactNode } from 'react'
import clsx from 'clsx'
import './Popover.css'

type PopoverProps = {
  trigger: ReactElement
  title?: string
  description?: string
  children?: ReactNode
  className?: string
}

export function Popover({ trigger, title, description, children, className }: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={10}>
          <BasePopover.Popup className={clsx('bento-popover-popup', className)}>
            <BasePopover.Arrow className="bento-popover-arrow" />
            {title && <BasePopover.Title className="bento-popover-title">{title}</BasePopover.Title>}
            {description && (
              <BasePopover.Description className="bento-popover-description">
                {description}
              </BasePopover.Description>
            )}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}

export { BasePopover }
export type { PopoverProps }

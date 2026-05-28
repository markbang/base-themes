import { Drawer as BaseDrawer } from '@base-ui/react/drawer'
import { type ReactElement, type ReactNode } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import './Drawer.css'

type DrawerProps = {
  trigger: ReactElement
  title: string
  description?: string
  children?: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}

export function Drawer({
  trigger,
  title,
  description,
  children,
  side = 'right',
  className,
}: DrawerProps) {
  return (
    <BaseDrawer.Root>
      <BaseDrawer.Trigger render={trigger} />
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="bento-drawer-backdrop" />
        <BaseDrawer.Popup
          className={clsx('bento-drawer-popup', className)}
          {...({ 'data-side': side } as Record<string, unknown>)}
        >
          <div className="bento-drawer-header">
            <BaseDrawer.Title className="bento-drawer-title">{title}</BaseDrawer.Title>
            <BaseDrawer.Close
              className="bento-button icon"
              aria-label="Close drawer"
              render={<button type="button" />}
            >
              <X size={18} />
            </BaseDrawer.Close>
          </div>
          {description && (
            <BaseDrawer.Description className="bento-drawer-description">
              {description}
            </BaseDrawer.Description>
          )}
          <div className="bento-drawer-body">{children}</div>
        </BaseDrawer.Popup>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  )
}

export { BaseDrawer }
export type { DrawerProps }

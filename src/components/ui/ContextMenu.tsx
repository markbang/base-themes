import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import { type ReactNode } from 'react'
import clsx from 'clsx'
import './Menu.css'
import './ContextMenu.css'

export type ContextMenuItemData = {
  label: string
  icon?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

export type ContextMenuProps = {
  children: ReactNode
  items: (ContextMenuItemData | 'separator')[]
  className?: string
}

export function ContextMenu({ children, items, className }: ContextMenuProps) {
  return (
    <BaseContextMenu.Root>
      <BaseContextMenu.Trigger className="bento-context-menu-trigger">
        {children}
      </BaseContextMenu.Trigger>
      <BaseContextMenu.Portal>
        <BaseContextMenu.Positioner className="bento-menu-positioner" sideOffset={8}>
          <BaseContextMenu.Popup className={clsx('bento-menu-popup', className)}>
            {items.map((item, index) => {
              if (item === 'separator') {
                return <BaseContextMenu.Separator key={index} className="bento-menu-separator" />
              }
              return (
                <BaseContextMenu.Item key={index} className="bento-menu-item" disabled={item.disabled} onClick={item.onClick}>
                  {item.icon}
                  {item.label}
                </BaseContextMenu.Item>
              )
            })}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  )
}

export { BaseContextMenu }

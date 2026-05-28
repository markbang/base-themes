import { Menu as BaseMenu } from '@base-ui/react/menu'
import { type ReactElement, type ReactNode } from 'react'
import clsx from 'clsx'
import './Menu.css'

type MenuItemData = {
  label: string
  icon?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

type MenuProps = {
  trigger: ReactElement
  items: (MenuItemData | 'separator')[]
  className?: string
}

export function Menu({ trigger, items, className }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner className="bento-menu-positioner" sideOffset={8}>
          <BaseMenu.Popup className={clsx('bento-menu-popup', className)}>
            {items.map((item, i) => {
              if (item === 'separator') {
                return <BaseMenu.Separator key={i} className="bento-menu-separator" />
              }
              return (
                <BaseMenu.Item
                  key={i}
                  className="bento-menu-item"
                  disabled={item.disabled}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.label}
                </BaseMenu.Item>
              )
            })}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}

export { BaseMenu }
export type { MenuProps, MenuItemData }

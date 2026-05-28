import { Menubar as BaseMenubar } from '@base-ui/react/menubar'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { type ReactNode } from 'react'
import clsx from 'clsx'
import './Menu.css'
import './Menubar.css'

export type MenubarMenu = {
  label: string
  items: { label: string; icon?: ReactNode; disabled?: boolean }[]
}

export type MenubarProps = {
  menus: MenubarMenu[]
  className?: string
}

export function Menubar({ menus, className }: MenubarProps) {
  return (
    <BaseMenubar className={clsx('bento-menubar', className)}>
      {menus.map((menu) => (
        <BaseMenu.Root key={menu.label}>
          <BaseMenu.Trigger className="bento-menubar-trigger">{menu.label}</BaseMenu.Trigger>
          <BaseMenu.Portal>
            <BaseMenu.Positioner className="bento-menu-positioner" sideOffset={8}>
              <BaseMenu.Popup className="bento-menu-popup">
                {menu.items.map((item) => (
                  <BaseMenu.Item key={item.label} className="bento-menu-item" disabled={item.disabled}>
                    {item.icon}
                    {item.label}
                  </BaseMenu.Item>
                ))}
              </BaseMenu.Popup>
            </BaseMenu.Positioner>
          </BaseMenu.Portal>
        </BaseMenu.Root>
      ))}
    </BaseMenubar>
  )
}

export { BaseMenubar }

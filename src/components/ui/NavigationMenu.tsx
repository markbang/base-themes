import { NavigationMenu as BaseNavMenu } from '@base-ui/react/navigation-menu'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import './NavigationMenu.css'

type NavMenuItem = {
  label: string
  href?: string
  children?: { label: string; href: string; description?: string }[]
}

type NavigationMenuProps = {
  items: NavMenuItem[]
  className?: string
}

export function NavigationMenu({ items, className }: NavigationMenuProps) {
  return (
    <BaseNavMenu.Root className={clsx('bento-nav-menu', className)}>
      <BaseNavMenu.List className="bento-nav-menu-list">
        {items.map((item, i) => {
          if (item.children) {
            return (
              <BaseNavMenu.Item key={i}>
                <BaseNavMenu.Trigger className="bento-nav-menu-trigger">
                  {item.label}
                  <ChevronDown size={14} />
                </BaseNavMenu.Trigger>
                <BaseNavMenu.Portal>
                  <BaseNavMenu.Positioner sideOffset={8}>
                    <BaseNavMenu.Popup className="bento-nav-menu-popup">
                      {item.children.map((child, j) => (
                        <BaseNavMenu.Item
                          key={j}
                          className="bento-nav-menu-item"
                          render={<a href={child.href} />}
                        >
                          {child.label}
                        </BaseNavMenu.Item>
                      ))}
                    </BaseNavMenu.Popup>
                  </BaseNavMenu.Positioner>
                </BaseNavMenu.Portal>
              </BaseNavMenu.Item>
            )
          }
          return (
            <BaseNavMenu.Item key={i}>
              <BaseNavMenu.Link
                className="bento-nav-menu-trigger"
                href={item.href}
                render={<a href={item.href} />}
              >
                {item.label}
              </BaseNavMenu.Link>
            </BaseNavMenu.Item>
          )
        })}
      </BaseNavMenu.List>
    </BaseNavMenu.Root>
  )
}

export type { NavigationMenuProps, NavMenuItem }

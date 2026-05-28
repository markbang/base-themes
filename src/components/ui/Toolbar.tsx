import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Bold, Italic, Link, Search } from 'lucide-react'
import clsx from 'clsx'
import './Toolbar.css'

export type ToolbarProps = ComponentPropsWithoutRef<typeof BaseToolbar.Root> & {
  showSearch?: boolean
}

export function Toolbar({ className, showSearch = true, ...rest }: ToolbarProps) {
  return (
    <BaseToolbar.Root className={clsx('bento-toolbar', className)} {...rest}>
      <BaseToolbar.Group className="bento-toolbar-group">
        <ToolbarButton aria-label="Bold"><Bold size={15} /></ToolbarButton>
        <ToolbarButton aria-label="Italic"><Italic size={15} /></ToolbarButton>
        <BaseToolbar.Separator className="bento-toolbar-separator" />
        <BaseToolbar.Link className="bento-toolbar-button" href="https://base-ui.com" target="_blank" rel="noreferrer" aria-label="Base UI docs">
          <Link size={15} />
        </BaseToolbar.Link>
      </BaseToolbar.Group>
      {showSearch && (
        <div className="bento-toolbar-search">
          <Search size={14} />
          <BaseToolbar.Input className="bento-toolbar-input" placeholder="Search docs" />
        </div>
      )}
    </BaseToolbar.Root>
  )
}

function ToolbarButton({ children, ...rest }: ComponentPropsWithoutRef<typeof BaseToolbar.Button> & { children: ReactNode }) {
  return <BaseToolbar.Button className="bento-toolbar-button" {...rest}>{children}</BaseToolbar.Button>
}

export { BaseToolbar }

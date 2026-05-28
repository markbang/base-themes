import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './BentoGrid.css'

type BentoGridProps = ComponentPropsWithoutRef<'div'> & {
  cols?: 2 | 3 | 4
  autoRows?: 'sm' | 'md'
}

export function BentoGrid({
  cols = 3,
  autoRows,
  className,
  children,
  ...rest
}: BentoGridProps) {
  return (
    <div
      className={clsx(
        'bento-grid',
        `cols-${cols}`,
        autoRows && `auto-rows-${autoRows}`,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

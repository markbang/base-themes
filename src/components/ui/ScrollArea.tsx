import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './ScrollArea.css'

export type ScrollAreaProps = ComponentPropsWithoutRef<typeof BaseScrollArea.Root>

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...rest }, ref) => (
    <BaseScrollArea.Root ref={ref} className={clsx('bento-scroll-area', className)} {...rest}>
      <BaseScrollArea.Viewport className="bento-scroll-area-viewport">
        {children}
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar className="bento-scroll-area-scrollbar">
        <BaseScrollArea.Thumb className="bento-scroll-area-thumb" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Corner className="bento-scroll-area-corner" />
    </BaseScrollArea.Root>
  ),
)

ScrollArea.displayName = 'ScrollArea'

import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Separator.css'

export type SeparatorProps = ComponentPropsWithoutRef<typeof BaseSeparator>

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(({ className, ...rest }, ref) => (
  <BaseSeparator ref={ref} className={clsx('bento-separator', className)} {...rest} />
))

Separator.displayName = 'Separator'

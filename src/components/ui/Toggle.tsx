import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './ToggleGroup.css'

export type ToggleProps = ComponentPropsWithoutRef<typeof BaseToggle>

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({ className, ...rest }, ref) => (
  <BaseToggle ref={ref} className={clsx('bento-toggle', className)} {...rest} />
))

Toggle.displayName = 'Toggle'

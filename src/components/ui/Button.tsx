import { Button as BaseButton } from '@base-ui/react/button'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Button.css'

export type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'icon' | 'accent' | 'teal'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, ...rest }, ref) => (
    <BaseButton
      ref={ref}
      className={clsx('bento-button', variant !== 'primary' && variant, className)}
      {...rest}
    />
  ),
)

Button.displayName = 'Button'

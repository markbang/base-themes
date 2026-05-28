import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Switch.css'

export type SwitchProps = ComponentPropsWithoutRef<typeof BaseSwitch.Root> & {
  label?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, className, id, ...rest }, ref) => {
    const inner = (
      <BaseSwitch.Root ref={ref} id={id} className={clsx('bento-switch', className)} {...rest}>
        <BaseSwitch.Thumb className="bento-switch-thumb" />
      </BaseSwitch.Root>
    )

    if (!label) return inner

    return (
      <label className="bento-switch-label" htmlFor={id}>
        {inner}
        {label}
      </label>
    )
  },
)

Switch.displayName = 'Switch'

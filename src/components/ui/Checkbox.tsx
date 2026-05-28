import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import './Checkbox.css'

export type CheckboxProps = ComponentPropsWithoutRef<typeof BaseCheckbox.Root> & {
  label?: string
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, className, id, ...rest }, ref) => {
    const inner = (
      <BaseCheckbox.Root ref={ref} id={id} className={clsx('bento-checkbox', className)} {...rest}>
        <BaseCheckbox.Indicator>
          <Check size={14} />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    )

    if (!label) return inner

    return (
      <label className="bento-checkbox-label" htmlFor={id}>
        {inner}
        {label}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'

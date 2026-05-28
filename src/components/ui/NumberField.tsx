import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import { type ComponentPropsWithoutRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import clsx from 'clsx'
import './NumberField.css'

export type NumberFieldProps = ComponentPropsWithoutRef<typeof BaseNumberField.Root> & {
  label?: string
}

export function NumberField({ label, className, ...rest }: NumberFieldProps) {
  return (
    <BaseNumberField.Root className={clsx('bento-number-field', className)} {...rest}>
      {label && <label className="field-label">{label}</label>}
      <BaseNumberField.Group className="bento-number-field-group">
        <BaseNumberField.Decrement className="bento-number-field-button" aria-label="Decrease">
          <Minus size={14} />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input className="bento-number-field-input" />
        <BaseNumberField.Increment className="bento-number-field-button" aria-label="Increase">
          <Plus size={14} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  )
}

export { BaseNumberField }

import { Field as BaseField } from '@base-ui/react/field'
import { type ComponentPropsWithoutRef, type ReactElement } from 'react'
import clsx from 'clsx'
import './Field.css'

export type FieldProps = ComponentPropsWithoutRef<typeof BaseField.Root> & {
  label: string
  description?: string
  error?: string
  children: ReactElement
}

export function Field({ label, description, error, children, className, ...rest }: FieldProps) {
  return (
    <BaseField.Root className={clsx('bento-field', className)} invalid={Boolean(error)} {...rest}>
      <BaseField.Label className="field-label">{label}</BaseField.Label>
      <BaseField.Control render={children} />
      {description && <BaseField.Description className="bento-field-description">{description}</BaseField.Description>}
      {error && <BaseField.Error className="bento-field-error">{error}</BaseField.Error>}
    </BaseField.Root>
  )
}

export { BaseField }

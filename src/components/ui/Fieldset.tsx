import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './Fieldset.css'

export type FieldsetProps = ComponentPropsWithoutRef<typeof BaseFieldset.Root> & {
  legend: string
}

export function Fieldset({ legend, children, className, ...rest }: FieldsetProps) {
  return (
    <BaseFieldset.Root className={clsx('bento-fieldset', className)} {...rest}>
      <BaseFieldset.Legend className="bento-fieldset-legend">{legend}</BaseFieldset.Legend>
      {children}
    </BaseFieldset.Root>
  )
}

export { BaseFieldset }

import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import { Checkbox } from './Checkbox'
import './Checkbox.css'

export type CheckboxGroupOption = { value: string; label: string }

export type CheckboxGroupProps = Omit<ComponentPropsWithoutRef<typeof BaseCheckboxGroup>, 'children'> & {
  options: CheckboxGroupOption[]
}

export function CheckboxGroup({ options, className, defaultValue, ...rest }: CheckboxGroupProps) {
  return (
    <BaseCheckboxGroup className={clsx('bento-checkbox-group', className)} defaultValue={defaultValue} {...rest}>
      {options.map((option) => (
        <Checkbox key={option.value} name={option.value} value={option.value} label={option.label} />
      ))}
    </BaseCheckboxGroup>
  )
}

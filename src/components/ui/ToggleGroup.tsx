import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { Toggle } from '@base-ui/react/toggle'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './ToggleGroup.css'

type ToggleOption = { value: string; label: string }

type ToggleGroupProps = Omit<ComponentPropsWithoutRef<typeof BaseToggleGroup>, 'defaultValue'> & {
  options: ToggleOption[]
  defaultValue?: string[]
}

export function ToggleGroup({ options, defaultValue, className, ...rest }: ToggleGroupProps) {
  return (
    <BaseToggleGroup
      defaultValue={defaultValue}
      className={clsx('bento-toggle-group', className)}
      {...rest}
    >
      {options.map((opt) => (
        <Toggle className="bento-toggle" key={opt.value} value={opt.value}>
          {opt.label}
        </Toggle>
      ))}
    </BaseToggleGroup>
  )
}

export type { ToggleGroupProps, ToggleOption }

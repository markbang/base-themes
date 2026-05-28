import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { Radio } from '@base-ui/react/radio'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './RadioGroup.css'

type RadioOption = { value: string; label: string }

type RadioGroupProps = Omit<ComponentPropsWithoutRef<typeof BaseRadioGroup>, 'defaultValue'> & {
  options: RadioOption[]
  defaultValue?: string
}

export function RadioGroup({ options, defaultValue, className, ...rest }: RadioGroupProps) {
  return (
    <BaseRadioGroup defaultValue={defaultValue} className={clsx('bento-radio-group', className)} {...rest}>
      {options.map((opt) => (
        <label className="bento-radio-label" key={opt.value}>
          <Radio.Root className="bento-radio" value={opt.value}>
            <Radio.Indicator className="bento-radio-indicator" />
          </Radio.Root>
          {opt.label}
        </label>
      ))}
    </BaseRadioGroup>
  )
}

export type { RadioGroupProps, RadioOption }

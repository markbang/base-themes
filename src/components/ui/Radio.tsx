import { Radio as BaseRadio } from '@base-ui/react/radio'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './RadioGroup.css'

export type RadioProps = ComponentPropsWithoutRef<typeof BaseRadio.Root> & {
  label?: string
}

export function Radio({ label, className, ...rest }: RadioProps) {
  const radio = (
    <BaseRadio.Root className={clsx('bento-radio', className)} {...rest}>
      <BaseRadio.Indicator className="bento-radio-indicator" />
    </BaseRadio.Root>
  )

  if (!label) return radio

  return <label className="bento-radio-label">{radio}{label}</label>
}

export { BaseRadio }

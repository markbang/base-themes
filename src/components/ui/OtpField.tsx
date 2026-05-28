import { OTPFieldPreview as BaseOtpField } from '@base-ui/react/otp-field'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import './OtpField.css'

export type OtpFieldProps = ComponentPropsWithoutRef<typeof BaseOtpField.Root> & {
  length?: number
  label?: string
}

export function OtpField({ length = 6, label, className, ...rest }: OtpFieldProps) {
  return (
    <BaseOtpField.Root className={clsx('bento-otp-field', className)} length={length} {...rest}>
      {label && <label className="field-label">{label}</label>}
      <div className="bento-otp-inputs">
        {Array.from({ length }, (_, index) => (
          <BaseOtpField.Input key={index} className="bento-otp-input" />
        ))}
      </div>
    </BaseOtpField.Root>
  )
}

export { BaseOtpField }

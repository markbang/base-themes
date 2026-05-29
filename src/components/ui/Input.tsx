import { Input as BaseInput } from '@base-ui/react/input'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Input.css'

export type InputProps = ComponentPropsWithoutRef<typeof BaseInput> & {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, id, ...rest }, ref) => {
    const inner = (
      <BaseInput
        ref={ref}
        id={id}
        className={clsx('bento-input', className)}
        {...rest}
      />
    )

    if (!label) return inner

    return (
      <div className="bento-field">
        <label className="bento-field-label" htmlFor={id}>{label}</label>
        {inner}
      </div>
    )
  },
)

Input.displayName = 'Input'

export type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, ...rest }, ref) => {
    const inner = (
      <textarea
        ref={ref}
        id={id}
        className={clsx('bento-textarea', className)}
        {...rest}
      />
    )

    if (!label) return inner

    return (
      <div className="bento-field">
        <label className="bento-field-label" htmlFor={id}>{label}</label>
        {inner}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export { BaseInput }

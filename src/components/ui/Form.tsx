import { Form as BaseForm } from '@base-ui/react/form'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Form.css'

export type FormProps = ComponentPropsWithoutRef<typeof BaseForm>

export const Form = forwardRef<HTMLFormElement, FormProps>(({ className, ...rest }, ref) => (
  <BaseForm ref={ref} className={clsx('bento-form', className)} {...rest} />
))

Form.displayName = 'Form'

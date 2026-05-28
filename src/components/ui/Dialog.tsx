import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { type ReactElement, type ReactNode } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import './Dialog.css'

type DialogProps = {
  trigger: ReactElement
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function Dialog({ trigger, title, description, children, className }: DialogProps) {
  return (
    <BaseDialog.Root>
      <BaseDialog.Trigger render={trigger} />
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="bento-dialog-backdrop" />
        <BaseDialog.Popup className={clsx('bento-dialog-popup', className)}>
          <div className="bento-dialog-topline">
            <BaseDialog.Title className="bento-dialog-title">{title}</BaseDialog.Title>
            <BaseDialog.Close
              className="bento-button icon"
              aria-label="Close dialog"
              render={<button type="button" />}
            >
              <X size={18} />
            </BaseDialog.Close>
          </div>
          {description && (
            <BaseDialog.Description className="bento-dialog-description">
              {description}
            </BaseDialog.Description>
          )}
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

export { BaseDialog }
export type { DialogProps }

import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { type ReactElement } from 'react'
import clsx from 'clsx'
import './AlertDialog.css'
import './Button.css'

type AlertDialogProps = {
  trigger: ReactElement
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  className?: string
}

export function AlertDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  className,
}: AlertDialogProps) {
  return (
    <BaseAlertDialog.Root>
      <BaseAlertDialog.Trigger render={trigger} />
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop className="bento-alert-backdrop" />
        <BaseAlertDialog.Popup className={clsx('bento-alert-popup', className)}>
          <BaseAlertDialog.Title className="bento-alert-title">{title}</BaseAlertDialog.Title>
          <BaseAlertDialog.Description className="bento-alert-description">
            {description}
          </BaseAlertDialog.Description>
          <div className="bento-alert-actions">
            <BaseAlertDialog.Close className="bento-button outline"> {cancelLabel}</BaseAlertDialog.Close>
            <BaseAlertDialog.Close
              className="bento-button accent"
              onClick={onConfirm}
            >
              {confirmLabel}
            </BaseAlertDialog.Close>
          </div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  )
}

export { BaseAlertDialog }
export type { AlertDialogProps }

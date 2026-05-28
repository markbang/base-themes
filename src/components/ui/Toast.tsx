import { Toast } from '@base-ui/react/toast'
import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import './Toast.css'

type ToastProviderProps = {
  children: ReactNode
}

function ToastList() {
  const { toasts } = Toast.useToastManager()
  if (toasts.length === 0) return null

  return (
    <div className="bento-toast-provider">
      {toasts.map((toast) => (
        <Toast.Root className="bento-toast" key={toast.id} toast={toast}>
          <div>
            <Toast.Title className="bento-toast-title">{toast.title}</Toast.Title>
            {toast.description && (
              <Toast.Description className="bento-toast-description">
                {toast.description}
              </Toast.Description>
            )}
          </div>
          <Toast.Close
            className="bento-toast-close"
            aria-label="Dismiss"
            render={<button type="button" />}
          >
            <X size={15} />
          </Toast.Close>
        </Toast.Root>
      ))}
    </div>
  )
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <Toast.Provider>
      {children}
      <ToastList />
    </Toast.Provider>
  )
}

export type { ToastProviderProps }

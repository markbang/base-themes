import { Toast } from '@base-ui/react/toast'

export function useToastManager() {
  const manager = Toast.useToastManager()
  return {
    add: (title: string, description?: string) => {
      return manager.add({ title, description } as never)
    },
    close: (id?: string) => manager.close(id),
  }
}

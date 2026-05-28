import { DirectionProvider as BaseDirectionProvider, type TextDirection } from '@base-ui/react/direction-provider'
import { type ComponentProps } from 'react'

export type DirectionProviderProps = ComponentProps<typeof BaseDirectionProvider>

export function DirectionProvider({ children, direction = 'ltr' }: DirectionProviderProps) {
  return (
    <BaseDirectionProvider direction={direction}>
      <span dir={direction} style={{ display: 'contents' }}>
        {children}
      </span>
    </BaseDirectionProvider>
  )
}

export { BaseDirectionProvider }
export type { TextDirection }

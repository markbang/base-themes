import { CSPProvider as BaseCSPProvider } from '@base-ui/react/csp-provider'
import { type ComponentProps } from 'react'

export type CspProviderProps = ComponentProps<typeof BaseCSPProvider>

export function CspProvider(props: CspProviderProps) {
  return <BaseCSPProvider {...props} />
}

export { BaseCSPProvider }

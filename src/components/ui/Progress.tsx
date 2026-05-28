import { Progress as BaseProgress } from '@base-ui/react/progress'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Progress.css'

export type ProgressProps = ComponentPropsWithoutRef<typeof BaseProgress.Root> & {
  showValue?: boolean
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, showValue, className, ...rest }, ref) => (
    <div className={clsx('bento-progress', className)}>
      {showValue && (
        <div className="bento-progress-label">
          <span>{rest['aria-label'] ?? 'Progress'}</span>
          <span className="bento-progress-value">{value ?? 0}%</span>
        </div>
      )}
      <BaseProgress.Root ref={ref} value={value} {...rest}>
        <BaseProgress.Track className="bento-progress-track">
          <BaseProgress.Indicator className="bento-progress-indicator" />
        </BaseProgress.Track>
      </BaseProgress.Root>
    </div>
  ),
)

Progress.displayName = 'Progress'

import { Meter as BaseMeter } from '@base-ui/react/meter'
import { type ComponentPropsWithoutRef, forwardRef, useMemo } from 'react'
import clsx from 'clsx'
import './Meter.css'

export type MeterProps = ComponentPropsWithoutRef<typeof BaseMeter.Root> & {
  showValue?: boolean
}

export const Meter = forwardRef<HTMLDivElement, MeterProps>(
  ({ value = 0, min = 0, max = 100, showValue, className, ...rest }, ref) => {
    const pct = ((value - min) / (max - min)) * 100
    const colorClass = useMemo(() => {
      if (pct >= 80) return 'bento-meter-high'
      if (pct < 30) return 'bento-meter-low'
      return 'bento-meter-mid'
    }, [pct])

    return (
      <div className={clsx('bento-meter', className)}>
        {showValue && (
          <div className="bento-meter-label">
            <span>{rest['aria-label'] ?? 'Meter'}</span>
            <span className="bento-meter-value">{Math.round(pct)}%</span>
          </div>
        )}
        <BaseMeter.Root ref={ref} value={value} min={min} max={max} {...rest}>
          <BaseMeter.Track className="bento-meter-track">
            <BaseMeter.Indicator className={clsx('bento-meter-indicator', colorClass)} />
          </BaseMeter.Track>
        </BaseMeter.Root>
      </div>
    )
  },
)

Meter.displayName = 'Meter'

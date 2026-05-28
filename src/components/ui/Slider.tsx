import { Slider as BaseSlider } from '@base-ui/react/slider'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Slider.css'

export type SliderProps = ComponentPropsWithoutRef<typeof BaseSlider.Root>

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ className, ...rest }, ref) => (
    <BaseSlider.Root ref={ref} className={clsx('bento-slider', className)} {...rest}>
      <BaseSlider.Control className="bento-slider-control">
        <BaseSlider.Track className="bento-slider-track">
          <BaseSlider.Indicator className="bento-slider-indicator" />
          <BaseSlider.Thumb className="bento-slider-thumb" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  ),
)

Slider.displayName = 'Slider'

import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card'
import { type ReactElement } from 'react'
import clsx from 'clsx'
import './PreviewCard.css'

type PreviewCardProps = {
  trigger: ReactElement
  title: string
  description?: string
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export function PreviewCard({
  trigger,
  title,
  description,
  imageUrl,
  imageAlt,
  className,
}: PreviewCardProps) {
  return (
    <BasePreviewCard.Root>
      <BasePreviewCard.Trigger render={trigger} />
      <BasePreviewCard.Portal>
        <BasePreviewCard.Positioner sideOffset={10}>
          <BasePreviewCard.Popup className={clsx('bento-preview-card', className)}>
            <BasePreviewCard.Arrow className="bento-preview-card-arrow" />
            {imageUrl && <img src={imageUrl} alt={imageAlt ?? ''} />}
            <h3 className="bento-preview-card-title">{title}</h3>
            {description && (
              <p className="bento-preview-card-description">{description}</p>
            )}
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    </BasePreviewCard.Root>
  )
}

export { BasePreviewCard }
export type { PreviewCardProps }

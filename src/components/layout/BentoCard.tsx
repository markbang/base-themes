import { type ComponentPropsWithoutRef, type ElementType } from 'react'
import clsx from 'clsx'
import './BentoCard.css'

type BentoCardProps<T extends ElementType = 'article'> = {
  as?: T
  variant?: 'default' | 'dark' | 'interactive'
} & ComponentPropsWithoutRef<T>

export function BentoCard<T extends ElementType = 'article'>({
  as,
  variant = 'default',
  className,
  children,
  ...rest
}: BentoCardProps<T>) {
  const Comp = as ?? 'article'
  return (
    <Comp
      className={clsx('bento-card', variant !== 'default' && variant, className)}
      {...rest}
    >
      {children}
    </Comp>
  )
}

export function BentoCardTitle({
  className,
  ...rest
}: ComponentPropsWithoutRef<'h3'>) {
  return <h3 className={clsx('bento-card-title', className)} {...rest} />
}

export function BentoCardSubtitle({
  className,
  ...rest
}: ComponentPropsWithoutRef<'small'>) {
  return <small className={clsx('bento-card-subtitle', className)} {...rest} />
}

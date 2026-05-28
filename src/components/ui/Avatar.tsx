import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import clsx from 'clsx'
import './Avatar.css'

export type AvatarProps = ComponentPropsWithoutRef<typeof BaseAvatar.Root> & {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, fallback, size, className, ...rest }, ref) => (
    <BaseAvatar.Root
      ref={ref}
      className={clsx('bento-avatar', size && size !== 'md' && size, className)}
      {...rest}
    >
      {src && <BaseAvatar.Image src={src} alt={alt} />}
      <BaseAvatar.Fallback>{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  ),
)

Avatar.displayName = 'Avatar'

type AvatarGroupProps = ComponentPropsWithoutRef<'div'>

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={clsx('bento-avatar-group', className)} {...rest} />
  ),
)

AvatarGroup.displayName = 'AvatarGroup'

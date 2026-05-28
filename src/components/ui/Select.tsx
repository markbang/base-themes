import { Select as BaseSelect } from '@base-ui/react/select'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import { ChevronDown, Check } from 'lucide-react'
import './Select.css'

export type SelectProps = Omit<ComponentPropsWithoutRef<typeof BaseSelect.Root>, 'items'> & {
  items: Record<string, string>
  label?: string
  placeholder?: string
}

export function Select({ items, label, placeholder, defaultValue, ...rest }: SelectProps) {
  return (
    <BaseSelect.Root defaultValue={defaultValue} items={items} {...rest}>
      {label && <label className="field-label" htmlFor={rest.id}>{label}</label>}
      <BaseSelect.Trigger id={rest.id} className="bento-select-trigger">
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon>
          <ChevronDown size={16} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="bento-select-positioner" sideOffset={8}>
          <BaseSelect.Popup className={clsx('bento-select-popup')}>
            {Object.entries(items).map(([value, label]) => (
              <BaseSelect.Item className="bento-select-item" key={value} value={value}>
                <BaseSelect.ItemIndicator>
                  <Check size={15} />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

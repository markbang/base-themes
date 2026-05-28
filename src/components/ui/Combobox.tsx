import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { useState } from 'react'
import clsx from 'clsx'
import './Combobox.css'

type ComboboxOption = { value: string; label: string }

type ComboboxProps = {
  options: ComboboxOption[]
  placeholder?: string
  label?: string
  className?: string
}

export function Combobox({ options, placeholder = 'Search...', label, className }: ComboboxProps) {
  const [query, setQuery] = useState('')

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className={clsx('bento-combobox', className)}>
      {label && <label className="field-label">{label}</label>}
      <BaseCombobox.Root
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <BaseCombobox.Input
          className="bento-combobox-input"
          placeholder={placeholder}
        />
        <BaseCombobox.Portal>
          <BaseCombobox.Positioner sideOffset={8}>
            <BaseCombobox.Popup className="bento-combobox-popup">
              {filtered.length === 0 ? (
                <div className="bento-combobox-no-results">No results</div>
              ) : (
                filtered.map((opt) => (
                  <BaseCombobox.Item className="bento-combobox-item" key={opt.value} value={opt.value}>
                    {opt.label}
                  </BaseCombobox.Item>
                ))
              )}
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </div>
  )
}

export type { ComboboxProps, ComboboxOption }

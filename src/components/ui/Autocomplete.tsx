import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { Check, Search } from 'lucide-react'
import clsx from 'clsx'
import './Combobox.css'
import './Autocomplete.css'

export type AutocompleteOption = { value: string; label: string }

export type AutocompleteProps = {
  options: AutocompleteOption[]
  label?: string
  placeholder?: string
  className?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  openOnInputClick?: boolean
  disabled?: boolean
}

export function Autocomplete({ options, label, placeholder = 'Search...', className, ...rest }: AutocompleteProps) {
  return (
    <div className={clsx('bento-combobox bento-autocomplete', className)}>
    <BaseAutocomplete.Root<AutocompleteOption> items={options} {...rest}>
      {label && <label className="field-label">{label}</label>}
      <BaseAutocomplete.InputGroup className="bento-combobox-input-wrap">
        <Search size={15} />
        <BaseAutocomplete.Input className="bento-combobox-input" placeholder={placeholder} />
      </BaseAutocomplete.InputGroup>
      <BaseAutocomplete.Portal>
        <BaseAutocomplete.Positioner className="bento-combobox-positioner" sideOffset={8}>
          <BaseAutocomplete.Popup className="bento-combobox-popup">
            <BaseAutocomplete.Empty className="bento-combobox-empty">No results</BaseAutocomplete.Empty>
            <BaseAutocomplete.List>
              {(item: AutocompleteOption) => (
                <BaseAutocomplete.Item className="bento-combobox-item" key={item.value} value={item.value}>
                  <BaseAutocomplete.Value>{item.label}</BaseAutocomplete.Value>
                  <Check size={14} />
                </BaseAutocomplete.Item>
              )}
            </BaseAutocomplete.List>
          </BaseAutocomplete.Popup>
        </BaseAutocomplete.Positioner>
      </BaseAutocomplete.Portal>
    </BaseAutocomplete.Root>
    </div>
  )
}

export { BaseAutocomplete }

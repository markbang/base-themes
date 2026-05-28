import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { type ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import './Accordion.css'

type AccordionItem = {
  value: string
  label: string
  content: string
}

type AccordionProps = Omit<ComponentPropsWithoutRef<typeof BaseAccordion.Root>, 'defaultValue'> & {
  items: AccordionItem[]
  defaultValue?: string | string[]
}

export function Accordion({ items, defaultValue, className, ...rest }: AccordionProps) {
  return (
    <BaseAccordion.Root
      defaultValue={(defaultValue as never) ?? (items.slice(0, 1).map((i) => i.value) as never)}
      className={clsx('bento-accordion', className)}
      {...rest}
    >
      {items.map((item) => (
        <BaseAccordion.Item className="bento-accordion-item" key={item.value} value={item.value}>
          <BaseAccordion.Header className="bento-accordion-header">
            <BaseAccordion.Trigger className="bento-accordion-trigger">
              {item.label}
              <ChevronDown size={15} />
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="bento-accordion-panel">{item.content}</BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  )
}

export { BaseAccordion }
export type { AccordionProps, AccordionItem }
